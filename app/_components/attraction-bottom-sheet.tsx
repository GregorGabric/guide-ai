import type { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useQuery } from 'convex/react';

import * as Haptics from 'expo-haptics';
import { ArrowUpRight, NavigationIcon } from 'lucide-react-native';
import type React from 'react';
import { useCallback, useState } from 'react';
import { Dimensions, ScrollView, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AiChat } from '~/app/_components/ai-chat/ai-chat';
import { Badge } from '~/components/ui/badge';
import { Sheet } from '~/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/tabs';
import { Text } from '~/components/ui/text';
import { H3, H4, P } from '~/components/ui/typography';
import { api } from '~/convex/_generated/api';
import type { PlacesResponse } from '~/services/places/types';
import { colors } from '~/utils/theme';

interface AttractionBottomSheetProps {
  attraction: PlacesResponse['places'][number] | null;
  onClose: () => void;
  sheetRef: React.RefObject<BottomSheetModal | null>;
}
const snapPoints = ['85%', '95%'];

const { width: screenWidth } = Dimensions.get('window');

export function AttractionBottomSheet({
  attraction,
  onClose,
  sheetRef,
}: AttractionBottomSheetProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const insets = useSafeAreaInsets();

  const translateX = useSharedValue(0);
  const gestureProgress = useSharedValue(0);
  const tabTransition = useSharedValue(0); // 0 = overview, 1 = chat

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

  // const sendMessage = useMutation(api.messages.sendMessage);

  const updateTabTransition = useCallback(
    (newActiveTab: string) => {
      if (newActiveTab === 'chat') {
        sheetRef.current?.expand();

        // void sendMessage({
        //   prompt: 'Can you provide a brief history and cultural significance of this place?',
        //   attraction: {
        //     displayName: attraction?.displayName.text,
        //     formattedAddress: attraction?.formattedAddress,
        //     summary: attraction?.editorialSummary?.text,
        //   },
        // });
      }
      setActiveTab(newActiveTab);
      const targetValue = newActiveTab === 'chat' ? 1 : 0;
      tabTransition.set(withTiming(targetValue, { duration: 300 }));
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
      translateX.set(withTiming(0));
      gestureProgress.set(withTiming(0));

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

  const tabIndicatorStyle = useAnimatedStyle(() => {
    const baseProgress = tabTransition.get();
    // Invert the gesture - left swipe moves indicator right, right swipe moves indicator left
    const gestureOffset = -gestureProgress.get() * (screenWidth * 0.25); // Gesture influence (inverted)
    const finalProgress = baseProgress + gestureOffset / (screenWidth * 0.5);
    const translateXValue = interpolate(finalProgress, [0, 1], [0, screenWidth * 0.5]);

    return {
      transform: [{ translateX: Math.max(0, Math.min(screenWidth * 0.5, translateXValue)) }],
    };
  });

  const getDistance = () => {
    const landmark = attraction?.addressDescriptor?.landmarks?.[0];
    if (landmark?.straightLineDistanceMeters) {
      const km = landmark.straightLineDistanceMeters / 1000;
      return km < 1 ? `${Math.round(landmark.straightLineDistanceMeters)}m` : `${km.toFixed(1)}km`;
    }
    return null;
  };

  const getPriceLevel = () => {
    switch (attraction?.priceLevel) {
      case 'PRICE_LEVEL_FREE':
        return {
          text: 'Free',
          color: '#10B981',
          bgColor: 'bg-emerald-50',
          borderColor: 'border-emerald-200',
        };
      case 'PRICE_LEVEL_INEXPENSIVE':
        return {
          text: '$',
          color: '#6366F1',
          bgColor: 'bg-indigo-50',
          borderColor: 'border-indigo-200',
        };
      case 'PRICE_LEVEL_MODERATE':
        return {
          text: '$$',
          color: '#F59E0B',
          bgColor: 'bg-amber-50',
          borderColor: 'border-amber-200',
        };
      case 'PRICE_LEVEL_EXPENSIVE':
        return {
          text: '$$$',
          color: '#EF4444',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
        };
      case 'PRICE_LEVEL_VERY_EXPENSIVE':
        return {
          text: '$$$$',
          color: '#DC2626',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-300',
        };
      default:
        return null;
    }
  };

  const distance = getDistance();
  const priceLevel = getPriceLevel();

  return (
    <Sheet
      enableDynamicSizing={false}
      detached
      bottomInset={insets.bottom}
      topInset={insets.top}
      style={{
        marginInline: insets.left + 12,
      }}
      ref={sheetRef}
      snapPoints={snapPoints}
      onChange={handleSheetChanges}
      enablePanDownToClose
      enableBlurKeyboardOnGesture
      enableOverDrag={false}
      backgroundStyle={{
        borderRadius: 47 - (insets.left + 12),
        backgroundColor: colors.background,
      }}
      keyboardBehavior="interactive"
      keyboardBlurBehavior="restore">
      {attraction && (
        <View className="flex-1 overflow-hidden">
          <View className="mb-6 px-6">
            <H3 className="mb-3">{attraction.displayName.text || attraction.name}</H3>

            {attraction.formattedAddress && (
              <View className="flex flex-row items-center gap-2 rounded-2xl px-4">
                <P className="flex-1 text-base font-medium">{attraction.formattedAddress}</P>
              </View>
            )}
          </View>

          <Tabs value={activeTab} onValueChange={updateTabTransition} className="flex-1">
            <TabsList className="relative mb-6 h-12 w-full flex-row rounded-2xl bg-slate-100 p-1">
              <Animated.View
                style={[
                  tabIndicatorStyle,
                  {
                    position: 'absolute',
                    top: 4,
                    left: 4,
                    width: (screenWidth - 48) * 0.5 - 8, // Account for container padding
                    height: 40,
                    backgroundColor: '#1f2937', // Dark background for the indicator
                    borderRadius: 16,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.15,
                    shadowRadius: 4,
                    elevation: 2,
                    zIndex: 10,
                  },
                ]}
              />
              <TabsTrigger
                value="overview"
                className="flex-1 rounded-2xl bg-transparent shadow-none"
                style={{ zIndex: 20 }}>
                <Text
                  className="font-semibold"
                  style={{
                    color: activeTab === 'overview' ? 'white' : '#64748b',
                  }}>
                  Overview
                </Text>
              </TabsTrigger>
              <TabsTrigger
                value="chat"
                className="flex-1 rounded-2xl bg-transparent shadow-none"
                style={{ zIndex: 20 }}>
                <Text
                  className="font-semibold"
                  style={{
                    color: activeTab === 'chat' ? 'white' : '#64748b',
                  }}>
                  AI Chat
                </Text>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="flex-1">
              <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                <GestureDetector gesture={panGesture}>
                  <View className="flex-1">
                    <View className="mb-6 px-6">
                      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        <View className="flex flex-row gap-2">
                          {distance && (
                            <Badge
                              variant="secondary"
                              className="flex flex-row items-center gap-2 rounded-2xl px-4">
                              <NavigationIcon size={16} color="#6366F1" />
                              <P>{distance} away</P>
                            </Badge>
                          )}

                          {priceLevel && (
                            <Badge
                              variant="outline"
                              className={`flex-row items-center ${priceLevel.bgColor} ${priceLevel.borderColor} rounded-2xl border px-4 py-3 `}>
                              <Text
                                className="text-sm font-bold"
                                style={{ color: priceLevel.color }}>
                                {priceLevel.text}
                              </Text>
                            </Badge>
                          )}
                        </View>
                      </ScrollView>
                    </View>

                    {/* Enhanced Description */}
                    {attraction.editorialSummary?.text && (
                      <View className="mb-6 px-6">
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
                        <View className="mb-6 px-6">
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
                                  }`}>
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

            <TabsContent value="chat" className="flex-1">
              <GestureDetector gesture={panGesture}>
                <AiChat attraction={attraction} userMessages={userMessages} />
              </GestureDetector>
            </TabsContent>
          </Tabs>
        </View>
      )}
    </Sheet>
  );
}
