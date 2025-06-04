export interface PlacesResponse {
  places: Array<Place>;
}

interface Place {
  name: string;
  id: string;
  types: Array<string>;
  formattedAddress: string;
  location: Location;
  rating: number;
  priceLevel?: string;
  userRatingCount: number;
  displayName: DisplayName;
  editorialSummary?: DisplayName;
  photos: Array<Photo>;
  addressDescriptor?: AddressDescriptor;
}

interface Photo {
  name: string;
  widthPx: number;
  heightPx: number;
  authorAttributions: Array<AuthorAttribution>;
  flagContentUri: string;
  googleMapsUri: string;
}

interface AuthorAttribution {
  displayName: string;
  uri: string;
  photoUri: string;
}

interface DisplayName {
  text: string;
  languageCode: string;
}

interface Location {
  latitude: number;
  longitude: number;
}

interface AddressDescriptor {
  landmarks?: Array<Landmark>;
  areas?: Array<Area>;
}

interface Landmark {
  name: string;
  placeId: string;
  displayName: DisplayName;
  types: Array<string>;
  straightLineDistanceMeters: number;
  travelDistanceMeters: number;
  spatialRelationship?: 'DOWN_THE_ROAD' | 'ACROSS_THE_ROAD' | 'AROUND_THE_CORNER' | 'NEARBY';
}

interface Area {
  name: string;
  placeId: string;
  displayName: DisplayName;
  containment: 'WITHIN' | 'OUTSKIRTS' | 'NEAR';
}
