import { IconCalendar, IconGlobe, IconTrophy } from '@tabler/icons-react-native';
import { Linking, Platform, Pressable, ScrollView, View } from 'react-native';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '~/components/ui/accordion';
import { Badge } from '~/src/components/ui/badge';
import { HistoricalSignificanceSkeleton } from '~/src/components/ui/skeleton';
import { Text } from '~/src/components/ui/text';
import type { LocationHistorySignificance } from '~/src/convex/chat';
import type { PlacesResponse } from '~/src/features/places/services/types';
import { ArrowUpRight } from '~/src/lib/icons/arrow-up-right';
import type { PossibleThemeColors } from '~/src/lib/theme/colors';
import { useTheme } from '~/src/lib/theme/theme-provider';

type LocationHistoryData = {
  location: {
    name: string;
    address: string;
  };
  historicalSignificances: Array<{
    id: string;
    title: string;
    description: string;
    period: string;
    significance:
      | 'architectural'
      | 'cultural'
      | 'political'
      | 'religious'
      | 'economic'
      | 'social'
      | 'military'
      | 'artistic'
      | 'scientific';
    yearRange?: {
      start?: number;
      end?: number;
    };
    keyFigures?: Array<string>;
    relatedEvents?: Array<string>;
    popularityScore: number;
  }>;
  summary: string;
};

interface AttractionOverviewProps {
  attraction: PlacesResponse['places'][number];
  locationHistory?: LocationHistoryData | null;
  isLoadingHistory?: boolean;
  historyError?: string | null;
}

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
    });
};

const getSignificanceIcon = (
  significance: LocationHistorySignificance,
  colors: PossibleThemeColors
) => {
  switch (significance) {
    case 'architectural':
      return <IconGlobe size={16} color={colors.foreground} />;
    case 'cultural':
      return <IconTrophy size={16} color={colors.foreground} />;
    case 'political':
    case 'social':
      return <IconCalendar size={16} color={colors.foreground} />;
    default:
      return <IconGlobe size={16} color={colors.foreground} />;
  }
};

const getSignificanceColor = (significance: LocationHistorySignificance) => {
  switch (significance) {
    case 'architectural':
      return 'bg-blue-500/10 border-blue-500/20';
    case 'cultural':
      return 'bg-purple-500/10 border-purple-500/20';
    case 'political':
      return 'bg-red-500/10 border-red-500/20';
    case 'religious':
      return 'bg-yellow-500/10 border-yellow-500/20';
    case 'economic':
      return 'bg-green-500/10 border-green-500/20';
    case 'social':
      return 'bg-pink-500/10 border-pink-500/20';
    case 'military':
      return 'bg-gray-500/10 border-gray-500/20';
    case 'artistic':
      return 'bg-indigo-500/10 border-indigo-500/20';
    case 'scientific':
      return 'bg-teal-500/10 border-teal-500/20';
    default:
      return 'bg-gray-500/10 border-gray-500/20';
  }
};

export function AttractionOverview({
  attraction,
  locationHistory,
  isLoadingHistory,
  historyError,
}: AttractionOverviewProps) {
  const { colors } = useTheme();

  return (
    <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
      <View className="flex-1">
        {/* Enhanced Description */}
        {attraction.editorialSummary?.text && (
          <View className="mb-6">
            <View className="rounded-3xl border border-border bg-card p-5">
              <Text variant={'body'}>{attraction.editorialSummary.text}</Text>
            </View>
          </View>
        )}

        {isLoadingHistory && (
          <HistoricalSignificanceSkeleton sectionTitle="Historical Significance" />
        )}

        {historyError && (
          <View className="mb-6">
            <Text variant={'subhead'} className="mb-4">
              Historical Significance
            </Text>
            <View className="rounded-3xl border border-border bg-card p-5">
              <Text variant={'body'} className="text-center">
                Unable to load historical information at this time.
              </Text>
            </View>
          </View>
        )}

        {locationHistory && !isLoadingHistory && !historyError && (
          <View className="mb-6">
            <Text variant={'subhead'} className="mb-4">
              Historical Significance
            </Text>

            {/* Summary */}
            {locationHistory.summary && (
              <View className="mb-4 rounded-3xl border border-border bg-card p-5">
                <Text variant={'body'}>{locationHistory.summary}</Text>
              </View>
            )}

            {/* Historical Significance Accordion */}
            <Accordion type="multiple" className="w-full">
              {locationHistory.historicalSignificances
                .sort((a, b) => b.popularityScore - a.popularityScore)
                .map((significance) => (
                  <AccordionItem
                    key={significance.id}
                    value={significance.id}
                    className="mb-3 overflow-hidden rounded-3xl border border-border bg-card"
                  >
                    <AccordionTrigger className="px-5 py-4 hover:no-underline">
                      <View className="flex-1 flex-row items-center justify-between">
                        <View className="flex-1 flex-row items-center gap-3">
                          <View
                            className={`rounded-full p-2 ${getSignificanceColor(significance.significance)}`}
                          >
                            {getSignificanceIcon(significance.significance, colors)}
                          </View>
                          <View className="flex-1">
                            <Text variant={'heading'} className="mb-1 text-left">
                              {significance.title}
                            </Text>
                            <View className="flex-row items-center gap-2">
                              <Badge variant="secondary" className="rounded-full">
                                <Text variant={'caption2'} className="capitalize">
                                  {significance.significance}
                                </Text>
                              </Badge>
                              <View className="flex-row items-center gap-1">
                                <IconTrophy size={12} className="text-muted-foreground" />
                                <Text variant={'caption2'} className="text-muted-foreground">
                                  {significance.popularityScore}/10
                                </Text>
                              </View>
                            </View>
                          </View>
                        </View>
                      </View>
                    </AccordionTrigger>

                    <AccordionContent className="px-5 pb-5">
                      {/* Period */}
                      <View className="mb-3 flex-row items-center gap-2">
                        <IconCalendar size={14} className="text-muted-foreground" />
                        <Text variant={'caption1'} className="text-muted-foreground">
                          {significance.period}
                        </Text>
                      </View>

                      {/* Description */}
                      <Text variant={'body'} className="mb-4">
                        {significance.description}
                      </Text>

                      {/* Related Events */}
                      {significance.relatedEvents && significance.relatedEvents.length > 0 && (
                        <View className="mb-3">
                          <Text
                            variant={'footnote'}
                            className="mb-2 font-semibold text-muted-foreground"
                          >
                            RELATED EVENTS
                          </Text>
                          {significance.relatedEvents.slice(0, 2).map((event, index) => (
                            <View key={index} className="mb-1 flex-row items-start gap-2">
                              <View className="mt-2 h-1.5 w-1.5 rounded-full bg-muted-foreground" />
                              <Text variant={'caption1'} className="flex-1 text-muted-foreground">
                                {event}
                              </Text>
                            </View>
                          ))}
                        </View>
                      )}

                      {/* Key Figures */}
                      {significance.keyFigures && significance.keyFigures.length > 0 && (
                        <View>
                          <Text
                            variant={'footnote'}
                            className="mb-2 font-semibold text-muted-foreground"
                          >
                            KEY FIGURES
                          </Text>
                          <View className="flex-row flex-wrap gap-2">
                            {significance.keyFigures.slice(0, 3).map((figure, index) => (
                              <Badge key={index} variant="outline" className="rounded-full">
                                <Text variant={'caption1'}>{figure}</Text>
                              </Badge>
                            ))}
                          </View>
                        </View>
                      )}
                    </AccordionContent>
                  </AccordionItem>
                ))}
            </Accordion>
          </View>
        )}

        {/* Enhanced Nearby Landmarks */}
        {attraction.addressDescriptor?.landmarks &&
          attraction.addressDescriptor.landmarks.length > 0 && (
            <View className="mb-6">
              <Text variant={'subhead'} className="mb-4">
                Nearby Landmarks
              </Text>
              <View className="overflow-hidden rounded-3xl border border-border bg-card">
                {attraction.addressDescriptor.landmarks.slice(0, 3).map((landmark, index) => (
                  <Pressable
                    onPress={() => {
                      openMapsNavigation(
                        attraction.location.latitude,
                        attraction.location.longitude,
                        landmark.displayName.text
                      );
                    }}
                    key={landmark.placeId}
                    className={`flex-row items-center p-4 ${
                      index < (attraction.addressDescriptor?.landmarks?.length ?? 0) - 1 &&
                      index < 2
                        ? 'border-b border-border'
                        : ''
                    }`}
                  >
                    <View className="flex-1">
                      <Text variant={'callout'} className="font-semibold">
                        {landmark.displayName.text}
                      </Text>
                      <Text variant={'caption1'} className="mt-1">
                        {Math.round(landmark.straightLineDistanceMeters)}m away
                      </Text>
                    </View>
                    <View className="h-10 w-10 items-center justify-center rounded-2xl bg-card">
                      <ArrowUpRight size={18} color={colors.foreground} />
                    </View>
                  </Pressable>
                ))}
              </View>
            </View>
          )}
      </View>
    </ScrollView>
  );
}
