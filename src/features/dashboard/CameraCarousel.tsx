import { IconSymbol } from '@/components/ui/icon-symbol';
import { Typography } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';
import { LinearGradient } from 'expo-linear-gradient';
import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Dimensions,
  FlatList,
  ImageBackground,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { Device, useDeviceStore } from '../../store/useDeviceStore';

const { width: windowWidth } = Dimensions.get('window');
const CARD_SIDE_PADDING = 16;
const CARD_GAP = 16;
const SLIDE_WIDTH = windowWidth - CARD_SIDE_PADDING * 2;
const SLIDE_HEIGHT = (SLIDE_WIDTH * 10) / 16;
const ITEM_WIDTH = SLIDE_WIDTH + CARD_GAP;

const CHEVRON_SIZE = 32;

function ChevronButton({
  side,
  onPress,
}: {
  side: 'left' | 'right';
  onPress: () => void;
}) {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  const onPressIn = useCallback(() => {
    scale.value = withTiming(0.9, { duration: 100 });
  }, [scale]);
  const onPressOut = useCallback(() => {
    scale.value = withSpring(1, { damping: 15, stiffness: 300 });
  }, [scale]);
  return (
    <Pressable onPress={onPress} onPressIn={onPressIn} onPressOut={onPressOut}>
      <Animated.View
        style={[
          styles.chevron,
          side === 'left' ? styles.chevronLeft : styles.chevronRight,
          animatedStyle,
        ]}
      >
        <IconSymbol
          name={side === 'left' ? 'chevron.left' : 'chevron.right'}
          size={18}
          color="#FFF"
        />
      </Animated.View>
    </Pressable>
  );
}

const CameraSlide = memo(function CameraSlide({
  device,
  index,
  total,
  onPrev,
  onNext,
}: {
  device: Device;
  index: number;
  total: number;
  onPrev: () => void;
  onNext: () => void;
}) {
  const recDotOpacity = useSharedValue(1);
  useEffect(() => {
    recDotOpacity.value = withRepeat(withTiming(0.2, { duration: 800 }), -1, true);
  }, [recDotOpacity]);
  const pulseDotStyle = useAnimatedStyle(() => ({ opacity: recDotOpacity.value }));

  return (
    <View style={styles.slide}>
      <ImageBackground
        source={device.image}
        style={StyleSheet.absoluteFill}
        resizeMode="cover"
      />
      <LinearGradient
        colors={['rgba(0,0,0,0.30)', 'transparent', 'rgba(0,0,0,0.70)']}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.camBadge}>
        <IconSymbol name="video.fill" size={20} color="#FFF" />
      </View>
      <View style={styles.recBadge}>
        <Animated.View style={[styles.recDot, pulseDotStyle]} />
        <Text style={styles.recText}>REC</Text>
      </View>
      {index > 0 && <ChevronButton side="left" onPress={onPrev} />}
      {index < total - 1 && <ChevronButton side="right" onPress={onNext} />}
      <View style={styles.slideBottom}>
        <Text style={styles.slideName}>{device.name}</Text>
        <Text style={styles.slideStatus}>● LIVE FEED • <Text style={styles.slideStatusHD}>HD</Text></Text>
      </View>
    </View>
  );
});

const CAMERA_FEED_NAMES = ['Front Yard', 'Back Yard', 'Pet Cam'];

const CAMERA_FEED_IMAGES = [
  null,
  require('../../../assets/images/backyard.gif'),
  require('../../../assets/images/pet-cam.gif'),
] as const;

export const CameraCarousel = memo(function CameraCarousel() {
  const accentColor = useThemeColor({}, 'accent');
  const borderColor = useThemeColor({}, 'shadowLight');
  const devices = useDeviceStore((s) => s.devices);

  const cameras = useMemo(() => {
    const fromStore = devices.filter((d) => d.type === 'camera');
    if (fromStore.length === 0) return [];
    const source = fromStore[0];
    return Array.from({ length: 3 }, (_, i) => ({
      ...source,
      id: `${source.id}-feed-${i}`,
      name: CAMERA_FEED_NAMES[i] ?? `Camera ${i + 1}`,
      image: CAMERA_FEED_IMAGES[i] ?? source.image,
    }));
  }, [devices]);

  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const activeIndexRef = useRef(0);

  useEffect(() => {
    activeIndexRef.current = activeIndex;
  }, [activeIndex]);

  const scrollTo = useCallback(
    (index: number) => {
      const next = Math.max(0, Math.min(index, cameras.length - 1));
      flatListRef.current?.scrollToOffset({ offset: next * ITEM_WIDTH, animated: true });
      setActiveIndex(next);
    },
    [cameras.length]
  );

  const onScroll = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const x = e.nativeEvent.contentOffset.x;
      const center = x + windowWidth / 2;
      const firstCardCenter = CARD_SIDE_PADDING + SLIDE_WIDTH / 2;
      const idx = Math.round((center - firstCardCenter) / ITEM_WIDTH);
      setActiveIndex(Math.max(0, Math.min(idx, cameras.length - 1)));
    },
    [cameras.length]
  );

  const getItemLayout = useCallback(
    (_: unknown, index: number) => ({
      length: ITEM_WIDTH,
      offset: CARD_SIDE_PADDING + ITEM_WIDTH * index,
      index,
    }),
    []
  );

  useEffect(() => {
    if (cameras.length <= 1) return;
    const id = setInterval(() => {
      const next = (activeIndexRef.current + 1) % cameras.length;
      scrollTo(next);
    }, 3500);
    return () => clearInterval(id);
  }, [cameras.length, scrollTo]);

  if (cameras.length === 0) return null;

  const snapOffsets = cameras.map((_, i) => i * ITEM_WIDTH);

  return (
    <View style={styles.container}>
      <View style={styles.carouselWrapper}>
        <FlatList
          ref={flatListRef}
          data={cameras}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.carouselContent}
          getItemLayout={getItemLayout}
          horizontal
          pagingEnabled={false}
          snapToOffsets={snapOffsets}
          snapToAlignment="center"
          decelerationRate="fast"
          showsHorizontalScrollIndicator={false}
          onScroll={onScroll}
          scrollEventThrottle={16}
          renderItem={({ item, index }) => (
            <View style={styles.slideWrapper}>
              <CameraSlide
                device={item}
                index={index}
                total={cameras.length}
                onPrev={() => scrollTo(index - 1)}
                onNext={() => scrollTo(index + 1)}
              />
            </View>
          )}
        />
        {cameras.length > 1 && (
          <View style={styles.dotsRow}>
            {cameras.map((_, i) => (
              <View
                key={i}
                style={[
                  styles.dot,
                  { backgroundColor: borderColor },
                  i === activeIndex && { backgroundColor: accentColor },
                ]}
              />
            ))}
          </View>
        )}
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    paddingVertical: 12,
  },
  carouselWrapper: {
    height: SLIDE_HEIGHT,
    position: 'relative',
  },
  carouselContent: {
    paddingHorizontal: CARD_SIDE_PADDING,
  },
  slideWrapper: {
    width: ITEM_WIDTH,
  },
  slide: {
    width: SLIDE_WIDTH,
    height: SLIDE_HEIGHT,
    borderRadius: 24,
    overflow: 'hidden',
  },
  camBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#FF7D54',
    justifyContent: 'center',
    alignItems: 'center',
  },
  recBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: '#DC2626',
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  recDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FFF',
  },
  recText: {
    fontSize: 11,
    fontFamily: Typography.bold,
    color: '#FFF',
    letterSpacing: 1,
  },
  chevron: {
    position: 'absolute',
    top: SLIDE_HEIGHT / 2 - CHEVRON_SIZE / 2,
    width: CHEVRON_SIZE,
    height: CHEVRON_SIZE,
    borderRadius: CHEVRON_SIZE / 2,
    backgroundColor: 'rgba(255,255,255,0.60)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  chevronLeft: {
    left: 12,
  },
  chevronRight: {
    right: 12,
  },
  slideBottom: {
    position: 'absolute',
    bottom: 16,
    left: 16,
  },
  slideName: {
    fontSize: 16,
    fontFamily: Typography.bold,
    color: '#FFF',
  },
  slideStatusHD: {
    fontSize: 11,
    fontFamily: Typography.bold,
    color: '#DC2626',
    marginTop: 2,
  },
  slideStatus: {
    fontSize: 11,
    fontFamily: Typography.medium,
    color: 'rgba(255,255,255,0.80)',
    marginTop: 2,
  },
  dotsRow: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
});
