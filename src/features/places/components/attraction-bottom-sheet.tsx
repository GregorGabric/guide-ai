import type { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useMutation, useQuery } from 'convex/react';

import * as Haptics from 'expo-haptics';
import type React from 'react';
import { useCallback, useEffect, useState } from 'react';
import type { LayoutChangeEvent } from 'react-native';
import { Dimensions, ScrollView, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  Easing,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowUpRight } from '~/src/lib/icons/arrow-up-right';
import { MessageCircleIcon } from '~/src/lib/icons/message-circle-icon';

import { InfoIcon, NavigationIcon } from 'lucide-react-native';
import { Badge } from '~/src/components/ui/badge';
import { Sheet } from '~/src/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/src/components/ui/tabs';
import { Text } from '~/src/components/ui/text';
import { H3, H4, P } from '~/src/components/ui/typography';
import { api } from '~/src/convex/_generated/api';
import { AiChat } from '~/src/features/chat/components/ai-chat/ai-chat';
import type { PlacesResponse } from '~/src/features/places/services/types';
import { colors } from '~/src/utils/theme';

// Helper functions for address parsing
const extractCountryFromAddress = (address?: string): string | undefined => {
  if (!address) {
    return undefined;
  }
  // Simple country extraction - in a real app, you'd use a geocoding service
  const parts = address.split(', ');
  return parts[parts.length - 1];
};

const extractCityFromAddress = (address?: string): string | undefined => {
  if (!address) {
    return undefined;
  }
  // Simple city extraction - in a real app, you'd use a geocoding service
  const parts = address.split(', ');
  return parts[parts.length - 2];
};

interface AttractionBottomSheetProps {
  attraction: PlacesResponse['places'][number] | null;
  onClose: () => void;
  sheetRef: React.RefObject<BottomSheetModal | null>;
}
const snapPoints = ['95%'];

const { width: screenWidth } = Dimensions.get('window');

const TAB_TRANSITION_DURATION = 150;

export function AttractionBottomSheet({
  attraction,
  onClose,
  sheetRef,
}: AttractionBottomSheetProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const insets = useSafeAreaInsets();

  const translateX = useSharedValue(0);
  const gestureProgress = useSharedValue(0);
  const tabTransition = useSharedValue(activeTab === 'overview' ? 1 : 0);
  const handleSheetChanges = useCallback(
    (index: number) => {
      if (index === -1) {
        onClose();
      }
    },
    [onClose]
  );

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

      // Update gesture progress (-1 to 1, where -1 is left swipe, 1 is right swipe)
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
      const placeName = attraction.displayName?.text || attraction.name || 'Unknown Place';
      const placeAddress = attraction.formattedAddress;
      const latitude = attraction.location?.latitude;
      const longitude = attraction.location?.longitude;
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
      bottomInset={insets.bottom}
      topInset={insets.top}
      style={{
        borderCurve: 'continuous',
        marginInline: insets.left + 8,
      }}
      ref={sheetRef}
      snapPoints={snapPoints}
      onChange={handleSheetChanges}
      enablePanDownToClose
      enableBlurKeyboardOnGesture
      enableOverDrag={false}
      backgroundStyle={{
        borderRadius: 47 - (insets.left + 12),
        backgroundColor: colors['card-background'],
      }}
      keyboardBehavior="interactive"
      keyboardBlurBehavior="restore"
    >
      {attraction && (
        <View className="flex-1 overflow-hidden">
          <View className="mb-6 px-8 pt-2">
            <H3 className="mb-3">{attraction.displayName.text || attraction.name}</H3>

            {attraction.formattedAddress && (
              <View className="mb-2 flex flex-row items-center gap-2 rounded-2xl">
                <P className="flex-1 text-base font-medium text-foreground">
                  {attraction.formattedAddress}
                </P>
              </View>
            )}
            {distance && (
              <Badge
                variant="default"
                className="flex-row items-center gap-2 self-start rounded-2xl px-4"
              >
                <NavigationIcon size={16} />
                <Text>{distance} away</Text>
              </Badge>
            )}
          </View>

          <Tabs value={activeTab} onValueChange={updateTabTransition} className="flex-1 px-8">
            <TabsList
              onLayout={onTabsListLayout}
              className="native:h-10 relative mb-6 w-full rounded-full p-1"
              style={{
                borderCurve: 'continuous',
              }}
            >
              <View className="z-20 flex flex-row">
                <TabsTrigger
                  value="overview"
                  className="flex-1 flex-row gap-2 rounded-full bg-transparent"
                  style={{
                    borderCurve: 'continuous',
                  }}
                >
                  <InfoIcon size={14} />
                  <Text className="native:text-sm">Overview</Text>
                </TabsTrigger>
                <TabsTrigger
                  value="chat"
                  className="flex-1 flex-row gap-2 rounded-full bg-transparent"
                >
                  <MessageCircleIcon size={14} />
                  <Text className="native:text-sm">AI Chat</Text>
                </TabsTrigger>
              </View>
              <Animated.View
                className="absolute inset-x-0 z-10 mx-1 h-full rounded-full bg-white"
                style={tabIndicatorStyle}
              />
            </TabsList>

            <TabsContent value="chat" className="flex-1">
              <GestureDetector gesture={panGesture}>
                <AiChat attraction={attraction} userMessages={userMessages} />
              </GestureDetector>
            </TabsContent>
            <TabsContent value="overview" className="flex-1">
              <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                <GestureDetector gesture={panGesture}>
                  <View className="flex-1">
                    {/* Enhanced Description */}
                    {attraction.editorialSummary?.text && (
                      <View className="mb-6 ">
                        <View className="rounded-3xl border border-slate-100 bg-slate-50/80 p-5">
                          <P className="font-medium leading-7 text-slate-700">
                            {attraction.editorialSummary.text}
                          </P>
                        </View>
                      </View>
                    )}

                    {/* Enhanced Nearby Landmarks */}
                    {attraction.addressDescriptor?.landmarks &&
                      attraction.addressDescriptor.landmarks.length > 0 && (
                        <View className="mb-6 ">
                          <H4 className="mb-4">Nearby Landmarks</H4>
                          <View className="overflow-hidden rounded-3xl border border-slate-100 bg-white ">
                            {attraction.addressDescriptor.landmarks
                              .slice(0, 3)
                              .map((landmark, index) => (
                                <View
                                  key={landmark.displayName.text}
                                  className={`flex-row items-center p-4 ${
                                    index <
                                      (attraction.addressDescriptor?.landmarks?.length ?? 0) - 1 &&
                                    index < 2
                                      ? 'border-b border-slate-100'
                                      : ''
                                  }`}
                                >
                                  <View className="flex-1">
                                    <Text className="text-base font-semibold text-slate-800">
                                      {landmark.displayName.text}
                                    </Text>
                                    <Text className="mt-1 text-sm text-slate-500">
                                      {Math.round(landmark.straightLineDistanceMeters)}m away
                                    </Text>
                                  </View>
                                  <View className="h-10 w-10 items-center justify-center rounded-2xl bg-slate-100">
                                    <ArrowUpRight size={18} color="#6B7280" />
                                  </View>
                                </View>
                              ))}
                          </View>
                        </View>
                      )}
                  </View>
                </GestureDetector>
              </ScrollView>
            </TabsContent>
          </Tabs>
        </View>
      )}
    </Sheet>
  );
}
