import type { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useAction, useMutation, useQuery } from 'convex/react';

import { IconInfoCircle } from '@tabler/icons-react-native';
import { useQuery as useTanstackQuery } from '@tanstack/react-query';
import * as Haptics from 'expo-haptics';
import type React from 'react';
import { useCallback, useEffect, useState } from 'react';
import type { LayoutChangeEvent } from 'react-native';
import { Alert, Dimensions, Linking, Platform, Pressable, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  Easing,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Badge } from '~/src/components/ui/badge';
import { Sheet } from '~/src/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/src/components/ui/tabs';
import { Text } from '~/src/components/ui/text';
import { api } from '~/src/convex/_generated/api';
import { AiChat } from '~/src/features/chat/components/ai-chat/ai-chat';
import type { PlacesResponse } from '~/src/features/places/services/types';
import { useSheetStore } from '~/src/features/places/store';
import { ArrowUpRight } from '~/src/lib/icons/arrow-up-right';
import { MessageCircleIcon } from '~/src/lib/icons/message-circle-icon';
import { useTheme } from '~/src/lib/theme/theme-provider';
import { AttractionOverview } from './attraction-overview';

const extractCountryFromAddress = (address?: string): string | undefined => {
  if (!address) {
    return undefined;
  }

  const parts = address.split(', ');
  return parts[parts.length - 1];
};

const extractCityFromAddress = (address?: string): string | undefined => {
  if (!address) {
    return undefined;
  }

  const parts = address.split(', ');
  return parts[parts.length - 2];
};

const openMapsNavigation = (latitude: number, longitude: number, label: string) => {
  const encodedLabel = encodeURIComponent(label);

  let mapsUrl: string;

  if (Platform.OS === 'ios') {
    mapsUrl = `maps://?q=${encodedLabel}&ll=${latitude},${longitude}`;
  } else {
    mapsUrl = `geo:${latitude},${longitude}?q=${latitude},${longitude}(${encodedLabel})`;
  }

  Linking.canOpenURL(mapsUrl)
    .then((supported) => {
      if (supported) {
        return Linking.openURL(mapsUrl);
      }
      const fallbackUrl =
        Platform.OS === 'ios'
          ? `https://maps.apple.com/?q=${encodedLabel}&ll=${latitude},${longitude}`
          : `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
      return Linking.openURL(fallbackUrl);
    })
    .catch((error: unknown) => {
      console.error('Error opening maps:', error);
      Alert.alert('Error', 'Unable to open maps navigation');
    });
};

interface AttractionBottomSheetProps {
  attraction: PlacesResponse['places'][number] | null;
  onClose: () => void;
  sheetRef: React.RefObject<BottomSheetModal | null>;
  animatedPosition: SharedValue<number>;
}
const snapPoints = ['65%', '100%'];

const { width: screenWidth } = Dimensions.get('window');

const TAB_TRANSITION_DURATION = 150;

export function AttractionBottomSheet({
  attraction,
  onClose,
  sheetRef,
  animatedPosition,
}: AttractionBottomSheetProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const translateX = useSharedValue(0);
  const gestureProgress = useSharedValue(0);
  const tabTransition = useSharedValue(activeTab === 'overview' ? 1 : 0);
  const setIsOpen = useSheetStore((state) => state.setIsOpen);

  const handleSheetChanges = useCallback(
    (index: number) => {
      setIsOpen(index > -1);
      if (index === -1) {
        onClose();
      }
    },
    [onClose, setIsOpen]
  );

  const getLocationHistoryAction = useAction(api.chat.getLocationHistory);

  const getLocationHistory = useTanstackQuery({
    queryKey: ['getLocationHistory', attraction?.id],
    queryFn: () => {
      if (!attraction) {
        return null;
      }
      return getLocationHistoryAction({
        attraction: {
          displayName: attraction.displayName.text || '',
          formattedAddress: attraction.formattedAddress || '',
          summary: '',
        },
      });
    },
    enabled: !!attraction,
  });

  const userMessages =
    useQuery(api.messages.listMessagesByLocationId, {
      locationId: attraction?.id ?? '',
    }) ?? [];

  const updateTabTransition = useCallback(
    (newActiveTab: string) => {
      if (newActiveTab === 'chat') {
        sheetRef.current?.expand();
      }
      setActiveTab(newActiveTab);
      const targetValue = newActiveTab === 'overview' ? 1 : 0;
      tabTransition.set(withTiming(targetValue, { duration: TAB_TRANSITION_DURATION }));
    },
    [sheetRef, tabTransition]
  );

  const panGesture = Gesture.Pan()
    .onStart(() => {
      translateX.set(0);
      gestureProgress.set(0);
    })
    .onUpdate((event) => {
      const { translationX } = event;
      const maxTranslation = screenWidth * 0.3; // Maximum translation for visual feedback

      // Update translation with bounds
      translateX.set(Math.max(-maxTranslation, Math.min(maxTranslation, translationX)));

      // Update gestureprogress (-1 to 1, where -1 is left swipe, 1 is right swipe)
      gestureProgress.set(translateX.value / maxTranslation);
    })
    .onEnd((event) => {
      'worklet';
      const { velocityX, translationX } = event;
      const swipeThreshold = 50;
      const velocityThreshold = 500;

      // Reset animations
      translateX.set(withTiming(0, { duration: 150 }));
      gestureProgress.set(withTiming(0, { duration: 150 }));

      // Determine if it's a significant horizontal swipe
      if (Math.abs(translationX) > swipeThreshold || Math.abs(velocityX) > velocityThreshold) {
        if (translationX > 0 || velocityX > 0) {
          // Swipe right - go to previous tab (overview)
          if (activeTab === 'chat') {
            runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Light);
            runOnJS(updateTabTransition)('overview');
          }
        } else {
          // Swipe left - go to next tab (chat)
          if (activeTab === 'overview') {
            runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Light);
            runOnJS(updateTabTransition)('chat');
          }
        }
      }
    });

  const getDistance = () => {
    const landmark = attraction?.addressDescriptor?.landmarks?.[0];
    if (landmark?.straightLineDistanceMeters) {
      const km = landmark.straightLineDistanceMeters / 1000;
      return km < 1 ? `${Math.round(landmark.straightLineDistanceMeters)}m` : `${km.toFixed(1)}km`;
    }
    return null;
  };

  const [tabsListWidth, setTabsListWidth] = useState(0);

  const onTabsListLayout = useCallback((event: LayoutChangeEvent) => {
    setTabsListWidth(event.nativeEvent.layout.width);
  }, []);

  const tabIndicatorStyle = useAnimatedStyle(() => {
    const baseProgress = tabTransition.get();
    const gestureOffset = gestureProgress.get() * (tabsListWidth * 0.25);
    const finalProgress = baseProgress + gestureOffset / (tabsListWidth * 0.5);
    const padding = 4;
    const indicatorWidth = (tabsListWidth - padding * 2) / 2;
    const translateXValue = interpolate(finalProgress, [0, 1], [indicatorWidth, 0]);

    return {
      transform: [
        {
          translateX: withTiming(translateXValue, {
            duration: 100,
            easing: Easing.out(Easing.ease),
          }),
        },
      ],
      width: indicatorWidth,
      borderCurve: 'continuous',
    };
  });

  const distance = getDistance();

  // Add visit tracking
  const recordVisit = useMutation(api.visitedPlaces.recordVisit);

  // Automatically record visit when attraction is opened
  useEffect(() => {
    if (attraction) {
      // Extract location info for visit tracking
      const placeName = attraction.displayName.text || attraction.name || 'Unknown Place';
      const placeAddress = attraction.formattedAddress;
      const latitude = attraction.location.latitude;
      const longitude = attraction.location.longitude;
      const placeId = attraction.id;

      if (latitude && longitude && placeId) {
        // Record the visit automatically
        recordVisit({
          placeId,
          placeName,
          placeAddress,
          latitude,
          longitude,
          visitType: 'automatic',
          // Extract country/city from address if available
          country: extractCountryFromAddress(placeAddress),
          city: extractCityFromAddress(placeAddress),
        }).catch((error: unknown) => {
          console.warn('Failed to record visit:', error);
        });
      }
    }
  }, [attraction, recordVisit]);

  return (
    <Sheet
      enableDynamicSizing={false}
      detached
      // bottomInset={insets.bottom}
      topInset={insets.top}
      style={{
        borderCurve: 'continuous',
      }}
      ref={sheetRef}
      snapPoints={snapPoints}
      onChange={handleSheetChanges}
      enablePanDownToClose
      enableBlurKeyboardOnGesture
      enableOverDrag={false}
      animatedPosition={animatedPosition}
      backgroundStyle={{
        borderRadius: 47 - (insets.left + 12),
        backgroundColor: colors.card,
      }}
      keyboardBehavior="interactive"
      keyboardBlurBehavior="restore"
    >
      {attraction && (
        <View className="flex-1 overflow-hidden">
          <View className="mb-6 px-8 pt-2">
            <Text variant={'largeTitle'} className="mb-3">
              {attraction.displayName.text || attraction.name}
            </Text>

            {attraction.formattedAddress && (
              <View className="mb-2 flex flex-row items-center gap-2 rounded-2xl">
                <Text variant={'subhead'} className="flex-1">
                  {attraction.formattedAddress}
                </Text>
              </View>
            )}
            {distance && (
              <Badge
                variant="default"
                className="flex-row items-center gap-2 self-start rounded-2xl px-4"
                asChild
              >
                <Pressable
                  onPress={() => {
                    openMapsNavigation(
                      attraction.location.latitude,
                      attraction.location.longitude,
                      attraction.displayName.text || attraction.name
                    );
                  }}
                >
                  <Text>{distance} away</Text>
                  <ArrowUpRight size={16} color={colors.background} />
                </Pressable>
              </Badge>
            )}
          </View>

          <Tabs
            value={activeTab}
            onValueChange={updateTabTransition}
            className="flex-1 px-8"
            style={{ backgroundColor: 'transparent' }}
          >
            <TabsList
              onLayout={onTabsListLayout}
              className="native:h-10 native:px-0 relative mb-6 w-full rounded-full"
              style={{
                borderCurve: 'continuous',
              }}
            >
              <View className="z-20 flex-row">
                <TabsTrigger
                  value="overview"
                  className="flex-1 flex-row  gap-2 rounded-full bg-transparent"
                  style={{
                    borderCurve: 'continuous',
                  }}
                >
                  <IconInfoCircle size={14} color={colors.foreground} />
                  <Text className="native:text-sm">Overview</Text>
                </TabsTrigger>
                <TabsTrigger
                  value="chat"
                  className="flex-1 flex-row gap-2 rounded-full bg-transparent"
                >
                  <MessageCircleIcon size={14} color={colors.foreground} />
                  <Text className="native:text-sm">AI Guide</Text>
                </TabsTrigger>
              </View>
              <Animated.View
                className="absolute inset-x-0 z-10 mx-1 h-full rounded-full bg-background"
                style={tabIndicatorStyle}
              />
            </TabsList>

            <TabsContent value="chat" className="flex-1" style={{ backgroundColor: 'transparent' }}>
              <GestureDetector gesture={panGesture}>
                <AiChat attraction={attraction} userMessages={userMessages} />
              </GestureDetector>
            </TabsContent>
            <TabsContent
              value="overview"
              className="flex-1"
              style={{ backgroundColor: 'transparent' }}
            >
              <GestureDetector gesture={panGesture}>
                <AttractionOverview
                  attraction={attraction}
                  locationHistory={getLocationHistory.data}
                  isLoadingHistory={getLocationHistory.isLoading}
                  historyError={getLocationHistory.error?.message || null}
                />
              </GestureDetector>
            </TabsContent>
          </Tabs>
        </View>
      )}
    </Sheet>
  );
}
