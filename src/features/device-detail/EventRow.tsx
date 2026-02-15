import React, { memo } from 'react';
import { View, Text, StyleSheet, ImageBackground, StyleProp, ViewStyle } from 'react-native';
import { GlassView } from '@/src/components/ui/GlassView';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Typography } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';

export interface CameraEvent {
  type: string;
  time: string;
  thumbnail?: any;
}

interface EventRowProps {
  event: CameraEvent;
  style?: StyleProp<ViewStyle>;
}

export const EventRow: React.FC<EventRowProps> = memo(({ event, style }) => {
  const textColor = useThemeColor({}, 'text');
  const subtextColor = useThemeColor({}, 'icon');

  return (
    <GlassView style={[styles.row, style]}>
      <View style={styles.thumbnail}>
        {event.thumbnail ? (
          <ImageBackground source={event.thumbnail} style={styles.thumbImage} imageStyle={styles.thumbImageStyle}>
            <IconSymbol name="play.circle.fill" size={24} color="#FFFFFF" />
          </ImageBackground>
        ) : (
          <View style={styles.thumbPlaceholder}>
            <IconSymbol name="play.circle.fill" size={24} color="#FFFFFF" />
          </View>
        )}
      </View>

      <View style={styles.content}>
        <Text style={[styles.eventType, { color: textColor }]}>{event.type}</Text>
        <Text style={[styles.timestamp, { color: subtextColor }]}>{event.time}</Text>
      </View>

      <IconSymbol name="more_vert" size={20} color={subtextColor} />
    </GlassView>
  );
});

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 16,
    gap: 12,
  },
  thumbnail: {
    width: 96,
    height: 64,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  thumbImage: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumbImageStyle: {
    borderRadius: 12,
  },
  thumbPlaceholder: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    gap: 4,
  },
  eventType: {
    fontSize: 14,
    fontWeight: '700',
    fontFamily: Typography.bold,
  },
  timestamp: {
    fontSize: 11,
    fontFamily: Typography.regular,
  },
});
