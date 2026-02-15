import React from 'react';
import { View, StyleSheet, Dimensions, Platform } from 'react-native';
import { Image } from 'expo-image';
import { useThemeColor } from '@/hooks/use-theme-color';

interface CameraViewerProps {
  image: any;
}

const { width } = Dimensions.get('window');
const VIEWER_WIDTH = width - 40;
const VIEWER_HEIGHT = VIEWER_WIDTH * 0.75;

export const CameraViewer: React.FC<CameraViewerProps> = ({ image }) => {
  const surfaceColor = useThemeColor({}, 'surface');

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.viewer,
          { width: VIEWER_WIDTH, height: VIEWER_HEIGHT, backgroundColor: surfaceColor },
          Platform.select({
            ios: {
              shadowColor: '#000',
              shadowOffset: { width: 4, height: 4 },
              shadowOpacity: 0.12,
              shadowRadius: 8,
            },
            android: { elevation: 4 },
          }),
        ]}
      >
        <View style={styles.imageContainer}>
          <Image source={image} style={styles.image} contentFit="cover" />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  viewer: {
    borderRadius: 24,
    overflow: 'hidden',
  },
  imageContainer: {
    ...StyleSheet.absoluteFillObject,
    margin: 8,
    borderRadius: 20,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
});
