import { Typography } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';
import { FrostedScreenWrapper } from '@/src/components/FrostedScreenWrapper';
import { DeviceDetailControls } from '@/src/features/device-detail/DeviceDetailControls';
import { DeviceDetailHeader } from '@/src/features/device-detail/DeviceDetailHeader';
import { DeviceType, useDeviceStore } from '@/src/store/useDeviceStore';
import { haptics } from '@/src/utils/haptics';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

const TYPES_WITH_CUSTOM_HERO: DeviceType[] = ['light', 'thermostat', 'camera', 'solar', 'vacuum'];
/** Types that hide the header title (vacuum keeps its title) */
const TYPES_WITHOUT_HEADER_TITLE: DeviceType[] = ['light', 'thermostat', 'camera', 'solar'];

export default function DeviceDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const devices = useDeviceStore((state) => state.devices);
  const device = devices.find((d) => d.id === id);

  const textColor = useThemeColor({}, 'text');
  const accentColor = useThemeColor({}, 'tint');
  const surfaceColor = useThemeColor({}, 'surface');

  const handleBack = () => {
    haptics.tap();
    router.back();
  };

  if (!device) {
    return (
      <FrostedScreenWrapper>
        <SafeAreaView style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity onPress={handleBack} style={[styles.backButton, { backgroundColor: surfaceColor }]}>
              <Ionicons name="arrow-back" size={18} color={textColor} />
            </TouchableOpacity>
          </View>
          <View style={styles.errorContainer}>
            <Text style={[styles.errorText, { color: textColor }]}>Device not found</Text>
            <TouchableOpacity
              onPress={handleBack}
              style={[styles.retryButton, { backgroundColor: accentColor }]}
            >
              <Text style={styles.retryButtonText}>Go Back</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </FrostedScreenWrapper>
    );
  }

  return (
    <FrostedScreenWrapper>
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={[styles.backButton, { backgroundColor: surfaceColor }]}>
            <Ionicons name="arrow-back" size={18} color={textColor} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: textColor }]}>
            {TYPES_WITHOUT_HEADER_TITLE.includes(device.type) ? '' : device.name}
          </Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.contentInset}>
            {!TYPES_WITH_CUSTOM_HERO.includes(device.type) && (
              <DeviceDetailHeader device={device} />
            )}

            <Animated.View entering={FadeInDown.delay(200).duration(500).springify()}>
              <DeviceDetailControls device={device} />
            </Animated.View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </FrostedScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 96,
  },
  contentInset: {
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  backButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 16,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    fontFamily: Typography.bold,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    fontSize: 18,
    fontWeight: '700',
    fontFamily: Typography.bold,
    marginBottom: 20,
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    fontFamily: Typography.bold,
  },
});
