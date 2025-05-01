'use client';
import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import MapView, { Heatmap, PROVIDER_GOOGLE } from 'react-native-maps';
import { useTheme } from '../../theme/ThemeContext';

const { width } = Dimensions.get('window');

type HeatmapViewProps = {
  data?: {
    latitude: number;
    longitude: number;
    weight?: number;
  }[];
};

// Default center coordinates (you can set this to your app's default location)
const DEFAULT_CENTER = {
  latitude: 37.7749, // San Francisco coordinates as default
  longitude: -122.4194,
  latitudeDelta: 0.0922,
  longitudeDelta: 0.0421,
};

const HeatmapView: React.FC<HeatmapViewProps> = ({ data = [] }) => {
  const { colors } = useTheme();
  const [initialRegion, setInitialRegion] = useState(DEFAULT_CENTER);

  useEffect(() => {
    if (data && data.length > 0) {
      // Calculate center point of all locations
      const validPoints = data.filter(
        point =>
          typeof point.latitude === 'number' &&
          !isNaN(point.latitude) &&
          typeof point.longitude === 'number' &&
          !isNaN(point.longitude),
      );

      if (validPoints.length > 0) {
        const center = validPoints.reduce(
          (acc, point) => ({
            latitude: acc.latitude + point.latitude,
            longitude: acc.longitude + point.longitude,
          }),
          { latitude: 0, longitude: 0 },
        );

        setInitialRegion({
          latitude: center.latitude / validPoints.length,
          longitude: center.longitude / validPoints.length,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        });
      }
    }
  }, [data]);

  const validPoints =
    data?.filter(
      point =>
        typeof point.latitude === 'number' &&
        !isNaN(point.latitude) &&
        typeof point.longitude === 'number' &&
        !isNaN(point.longitude),
    ) || [];

  return (
    <View style={[styles.container, { backgroundColor: colors.card }]}>
      <MapView
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={initialRegion}
        showsUserLocation={true}
        showsMyLocationButton={true}
      >
        {validPoints.length > 0 && (
          <Heatmap
            points={validPoints.map(point => ({
              latitude: point.latitude,
              longitude: point.longitude,
              weight: point.weight || 1,
            }))}
            radius={20}
            opacity={0.7}
            gradient={{
              colors: ['#00ff00', '#ff0000'],
              startPoints: [0.1, 1],
              colorMapSize: 256,
            }}
          />
        )}
      </MapView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    height: 200,
    overflow: 'hidden',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
});

export default HeatmapView;
