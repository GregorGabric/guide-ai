// Web fallback for maps
import React from 'react';
import type { ViewStyle } from 'react-native';
import { Text, View } from 'react-native';

interface MapViewProps {
  children?: React.ReactNode;
  style?: ViewStyle;
  region?: any;
  onRegionChangeComplete?: (region: any) => void;
  [key: string]: any;
}

interface MapMarkerProps {
  children?: React.ReactNode;
  coordinate?: {
    latitude: number;
    longitude: number;
  };
  title?: string;
  description?: string;
  [key: string]: any;
}

interface MarkerProps {
  children?: React.ReactNode;
  coordinate?: {
    latitude: number;
    longitude: number;
  };
  title?: string;
  description?: string;
  [key: string]: any;
}

export default function MapView({ children, style, ...props }: MapViewProps) {
  return (
    <View
      style={[
        { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f0f0f0' },
        style,
      ]}
    >
      <Text style={{ fontSize: 16, color: '#666' }}>Maps not supported on web</Text>
      <Text style={{ fontSize: 12, color: '#999', marginTop: 8 }}>
        Use the mobile app to view the map
      </Text>
    </View>
  );
}

export const MapMarker = ({ children, ...props }: MapMarkerProps) => null;

export const Marker = ({ children, ...props }: MarkerProps) => null;

// Export types for compatibility
export type Region = {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
};
