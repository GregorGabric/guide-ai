// Native implementation - re-exports react-native-maps
import MapViewComponent, { Marker as ReactNativeMarker } from 'react-native-maps';

export default MapViewComponent;
export const MapMarker = ReactNativeMarker;
export const Marker = ReactNativeMarker;
export type { Region } from 'react-native-maps';
