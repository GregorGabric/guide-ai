import { searchNearbyPlaces } from '~/services/places/placesService';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const latitude = searchParams.get('latitude');
  const longitude = searchParams.get('longitude');
  const radius = searchParams.get('radius');
  const maxResults = searchParams.get('maxResults');

  const places = await searchNearbyPlaces({
    includedTypes: ['tourist_attraction', 'museum', 'church', 'park', 'zoo'],
    locationRestriction: {
      circle: {
        center: { latitude: Number(latitude), longitude: Number(longitude) },
        radius: Number(radius),
      },
    },
    maxResultCount: Number(maxResults),
  });
  return Response.json({ places });
}
