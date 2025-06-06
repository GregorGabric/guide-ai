import type { BottomSheetModal } from '@gorhom/bottom-sheet';
import BottomSheet, { BottomSheetScrollView, BottomSheetView } from '@gorhom/bottom-sheet';
import * as Haptics from 'expo-haptics';
import { ArrowUpRight, Clock3, MapPin, Navigation, Phone, Volume2 } from 'lucide-react-native';
import React, { useCallback } from 'react';
import { View } from 'react-native';
import { TAB_BAR_HEIGHT } from '~/app/(drawer)/(tabs)/_layout';
import { Badge } from '~/components/ui/badge';
import { Button } from '~/components/ui/button';
import { Text } from '~/components/ui/text';
import { H3, H4, P } from '~/components/ui/typography';

import type { PlacesResponse } from '~/services/places/types';
import { colors } from '~/utils/theme';

interface AttractionBottomSheetProps {
  attraction: PlacesResponse['places'][number] | null;
  onClose: () => void;
  sheetRef: React.RefObject<BottomSheetModal | null>;
}

const snapPoints = ['80%', '85%', '90%'];

function AttractionBottomSheet({ attraction, onClose, sheetRef }: AttractionBottomSheetProps) {
  const handleSheetChanges = useCallback(
    (index: number) => {
      if (index === -1) {
        onClose();
      }
    },
    [onClose]
  );

  const handlePlayAudio = async () => {
    if (!attraction) {
      return;
    }
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

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
    <BottomSheet
      enableDynamicSizing={false}
      detached
      bottomInset={TAB_BAR_HEIGHT}
      ref={sheetRef}
      snapPoints={snapPoints}
      onChange={handleSheetChanges}
      enablePanDownToClose
      backgroundStyle={{
        backgroundColor: colors.background,
      }}>
      <BottomSheetScrollView className="flex-  1 rounded-t-3xl">
        {attraction && (
          <BottomSheetView className="flex-1 font-mono">
            <View className="mb-6 px-6">
              <H3 className="mb-3 font-thin leading-tight text-slate-900">
                {attraction.displayName.text || attraction.name}
              </H3>

              {attraction.formattedAddress && (
                <View className="flex-row items-center rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
                  <MapPin size={16} color="#6B7280" />
                  <Text className="ml-2 flex-1 text-base font-medium text-slate-600">
                    {attraction.formattedAddress}
                  </Text>
                </View>
              )}
            </View>

            <View className="mb-6 px-6">
              <BottomSheetScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View className="flex-row space-x-3">
                  {distance && (
                    <Badge
                      variant="secondary"
                      className="flex-row items-center rounded-2xl px-4 py-3 ">
                      <Navigation size={16} color="#6366F1" />
                      <Text className="ml-2 text-sm font-semibold text-indigo-700">
                        {distance} away
                      </Text>
                    </Badge>
                  )}

                  {priceLevel && (
                    <Badge
                      variant="outline"
                      className={`flex-row items-center ${priceLevel.bgColor} ${priceLevel.borderColor} rounded-2xl border px-4 py-3 `}>
                      <Text className="text-sm font-bold" style={{ color: priceLevel.color }}>
                        {priceLevel.text}
                      </Text>
                    </Badge>
                  )}

                  {attraction.addressDescriptor?.landmarks?.[0]?.spatialRelationship && (
                    <Badge
                      variant="secondary"
                      className="flex-row items-center rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 ">
                      <Clock3 size={16} color="#10B981" />
                      <Text className="ml-2 text-sm font-semibold capitalize text-emerald-700">
                        {attraction.addressDescriptor.landmarks[0].spatialRelationship
                          .replace('_', ' ')
                          .toLowerCase()}
                      </Text>
                    </Badge>
                  )}
                </View>
              </BottomSheetScrollView>
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
                  <H4 className="mb-4 text-slate-900">📍 Nearby Landmarks</H4>
                  <View className="overflow-hidden rounded-3xl border border-slate-100 bg-white ">
                    {attraction.addressDescriptor.landmarks.slice(0, 3).map((landmark, index) => (
                      <View
                        key={landmark.displayName.text}
                        className={`flex-row items-center p-4 ${
                          index < (attraction.addressDescriptor?.landmarks?.length ?? 0) - 1 &&
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

            <View className="gap-2 space-y-4 px-6 pb-6">
              <Button variant="primary" size="lg" onPress={handlePlayAudio}>
                <Volume2 size={22} />
                <P>Listen to Audio Guide</P>
              </Button>

              {/* Secondary Actions */}
              <View className="w-full flex-row gap-2 space-x-3">
                <Button
                  variant="tonal"
                  size="lg"
                  className="flex-1 rounded-2xl border border-slate-200 ">
                  <Phone size={18} color={colors.accent} />
                  <Text>Contact</Text>
                </Button>

                <Button
                  variant="tonal"
                  size="lg"
                  className="flex-1 rounded-2xl border border-slate-200 ">
                  <Navigation size={18} color={colors.accent} />
                  <Text>Directions</Text>
                </Button>
              </View>
            </View>
          </BottomSheetView>
        )}
      </BottomSheetScrollView>
    </BottomSheet>
  );
}

export default AttractionBottomSheet;
