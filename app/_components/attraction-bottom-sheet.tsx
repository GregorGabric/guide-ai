import type { BottomSheetModal } from '@gorhom/bottom-sheet';
import * as Haptics from 'expo-haptics';
import { ArrowUpRight, NavigationIcon } from 'lucide-react-native';
import type React from 'react';
import { useCallback, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { runOnJS } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AiChat from '~/app/_components/ai-chat';
import { Badge } from '~/components/ui/badge';
import { Sheet } from '~/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/tabs';
import { Text } from '~/components/ui/text';
import { H3, H4, P } from '~/components/ui/typography';
import type { PlacesResponse } from '~/services/places/types';
import { colors } from '~/utils/theme';

interface AttractionBottomSheetProps {
  attraction: PlacesResponse['places'][number] | null;
  onClose: () => void;
  sheetRef: React.RefObject<BottomSheetModal | null>;
}

const snapPoints = ['85%', '95%'];

export function AttractionBottomSheet({
  attraction,
  onClose,
  sheetRef,
}: AttractionBottomSheetProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const insets = useSafeAreaInsets();

  const handleSheetChanges = useCallback(
    (index: number) => {
      if (index === -1) {
        onClose();
      }
    },
    [onClose]
  );

  const panGesture = Gesture.Pan().onEnd((event) => {
    'worklet';
    const { velocityX, translationX } = event;
    const swipeThreshold = 50;
    const velocityThreshold = 500;

    // Determine if it's a significant horizontal swipe
    if (Math.abs(translationX) > swipeThreshold || Math.abs(velocityX) > velocityThreshold) {
      if (translationX > 0 || velocityX > 0) {
        // Swipe right - go to previous tab (overview)
        if (activeTab === 'chat') {
          runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Light);
          runOnJS(setActiveTab)('overview');
        }
      } else {
        // Swipe left - go to next tab (chat)
        if (activeTab === 'overview') {
          runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Light);
          runOnJS(setActiveTab)('chat');
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
      style={{
        marginInline: insets.left + 12,
        marginBlock: insets.right + 12,
      }}
      ref={sheetRef}
      snapPoints={snapPoints}
      onChange={handleSheetChanges}
      enablePanDownToClose
      backgroundStyle={{
        borderRadius: 47,
        backgroundColor: colors.background,
      }}>
      <ScrollView className="flex-1">
        {attraction && (
          <View className="flex-1 font-mono">
            <View className="mb-6 px-6">
              <H3 className="mb-3 font-thin leading-tight">
                {attraction.displayName.text || attraction.name}
              </H3>

              {attraction.formattedAddress && (
                <View className="flex flex-row items-center gap-2 rounded-2xl px-4">
                  <P className="flex-1 text-base font-medium">{attraction.formattedAddress}</P>
                </View>
              )}
            </View>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
              <TabsList className="mb-6 w-full flex-row">
                <TabsTrigger value="overview" className="flex-1">
                  <Text>Overview</Text>
                </TabsTrigger>
                <TabsTrigger value="chat" className="flex-1">
                  <Text>AI Chat</Text>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="flex-1">
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
              </TabsContent>

              <TabsContent value="chat" className="flex-1">
                <GestureDetector gesture={panGesture}>
                  <View className="px-6 pb-6">
                    <AiChat />
                  </View>
                </GestureDetector>
              </TabsContent>
            </Tabs>
          </View>
        )}
      </ScrollView>
    </Sheet>
  );
}
