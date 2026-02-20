import React, { useCallback, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Ionicons } from '@expo/vector-icons';
import { Typography } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';
import { GlassCard } from '@/src/components/ui/GlassCard';
import { haptics } from '@/src/utils/haptics';
import { Device, useDeviceStore } from '@/src/store/useDeviceStore';
import { PRIMARY } from './constants';
import { FloorMap, RoomKey } from './FloorMap';
import { VacuumModeSelector, VacuumMode } from './VacuumModeSelector';


const SUCTION_LABELS = ['Quiet', 'Standard', 'Strong', 'Max'];

type VacuumStatus = 'DOCKED' | 'CLEANING' | 'RETURNING';

interface VacuumDetailProps {
  device: Device;
}

export const VacuumDetail: React.FC<VacuumDetailProps> = ({ device }) => {
  const toggleDevice = useDeviceStore((s) => s.toggleDevice);
  const updateDeviceMode = useDeviceStore((s) => s.updateDeviceMode);
  const getState = useDeviceStore.getState;
  const textColor = useThemeColor({}, 'text');
  const subtextColor = useThemeColor({}, 'icon');
  const borderColor = useThemeColor({}, 'border');

  const [selectedRoom, setSelectedRoom] = useState<RoomKey | null>(null);
  const [selectedMode, setSelectedMode] = useState<VacuumMode>(
    (device.mode as VacuumMode) ?? 'auto'
  );
  const [isReturning, setIsReturning] = useState(false);
  const [suctionIndex, setSuctionIndex] = useState(1); // 0–3 → Standard

  const status: VacuumStatus = isReturning
    ? 'RETURNING'
    : device.isOn
      ? 'CLEANING'
      : 'DOCKED';

  const statusLabel = status === 'CLEANING' ? 'Active' : status === 'RETURNING' ? 'Returning' : 'Docked';
  const statusColor =
    status === 'CLEANING' ? '#34D399' : status === 'RETURNING' ? '#FBBF24' : subtextColor;

  const handleDockReached = useCallback(() => {
    setIsReturning(false);
    const currentDevice = getState().devices.find((d) => d.id === device.id);
    if (currentDevice?.isOn) {
      toggleDevice(device.id);
    }
  }, [device.id, getState, toggleDevice]);

  const handleStartPause = () => {
    if (device.isOn) {
      haptics.press();
      setIsReturning(true);
    } else {
      haptics.success();
      setIsReturning(false);
      toggleDevice(device.id);
    }
  };

  const handleReturnToDock = () => {
    if (device.isOn) {
      haptics.press();
      setIsReturning(true);
    }
  };

  const handleModeChange = (mode: VacuumMode) => {
    setSelectedMode(mode);
    updateDeviceMode(device.id, mode);
  };

  return (
    <View style={styles.section}>
      {/* Map */}
      <GlassCard style={styles.mapCard}>
        <FloorMap
          isOn={device.isOn}
          selectedRoom={selectedRoom}
          onRoomSelect={(room) => setSelectedRoom(room)}
          returnToDock={isReturning}
          onDockReached={handleDockReached}
        />
      </GlassCard>

      {/* Battery / Status — compact horizontal card */}
      <GlassCard>
        <View style={styles.statusRow}>
          <View style={styles.statusLeft}>
            <View style={[styles.batteryIconBox, { backgroundColor: `${statusColor}20` }]}>
              <IconSymbol
                name="battery.75percent"
                size={28}
                color={status === 'DOCKED' ? subtextColor : statusColor}
              />
            </View>
            <View style={styles.statusTextBlock}>
              <Text style={[styles.batteryPercent, { color: textColor }]}>
                {Math.round(device.value)}% Battery
              </Text>
              <Text style={[styles.statusSubtext, { color: subtextColor }]}>
                Status: {statusLabel}
              </Text>
            </View>
          </View>
          <View style={styles.statusBadgeRow}>
            {status === 'CLEANING' && (
              <View style={[styles.pulseDot, { backgroundColor: statusColor }]} />
            )}
            <Text style={[styles.statusBadgeText, { color: statusColor }]}>
              {statusLabel}
            </Text>
          </View>
        </View>
      </GlassCard>

      {/* Primary CTA — full-width button */}
      <Pressable
        style={({ pressed }) => [styles.primaryButton, pressed && styles.primaryButtonPressed]}
        onPress={handleStartPause}
      >
        <IconSymbol
          name={device.isOn ? 'pause.circle.fill' : 'play.circle.fill'}
          size={28}
          color="#FFFFFF"
        />
        <Text style={styles.primaryButtonLabel}>
          {device.isOn ? 'Pause Cleaning' : 'Start Cleaning'}
        </Text>
      </Pressable>

      {/* Return to dock — secondary */}
      {device.isOn && (
        <Pressable onPress={handleReturnToDock} style={styles.returnButton}>
          <Text style={[styles.returnButtonLabel, { color: PRIMARY }]}>Return to dock</Text>
        </Pressable>
      )}

      {/* Cleaning Mode — grid */}
      <GlassCard>
        <VacuumModeSelector selectedMode={selectedMode} onModeChange={handleModeChange} />
      </GlassCard>

      {/* Suction Power */}
      <View style={styles.suctionHeader}>
        <Text style={[styles.sectionLabel, { color: subtextColor }]}>SUCTION POWER</Text>
        <Text style={[styles.suctionValue, { color: PRIMARY }]}>
          {SUCTION_LABELS[suctionIndex]}
        </Text>
      </View>
      <GlassCard>
        <View style={styles.suctionSegments}>
          {SUCTION_LABELS.map((label, i) => (
            <Pressable
              key={label}
              style={[
                styles.suctionSegment,
                { backgroundColor: borderColor },
                suctionIndex === i && styles.suctionSegmentActive,
              ]}
              onPress={() => { haptics.tap(); setSuctionIndex(i); }}
            >
              <Text
                style={[
                  styles.suctionSegmentLabel,
                  { color: suctionIndex === i ? '#FFFFFF' : subtextColor },
                ]}
              >
                {label}
              </Text>
            </Pressable>
          ))}
        </View>
      </GlassCard>

      {/* Maintenance */}
      <Text style={[styles.sectionLabel, { color: subtextColor, marginBottom: 12, marginLeft: 4 }]}>
        MAINTENANCE
      </Text>
      <View style={styles.maintenanceGrid}>
        <GlassCard style={styles.maintenanceCard}>
          <View style={styles.maintenanceRow}>
            <View style={styles.maintenanceIconBox}>
              <Ionicons name="brush" size={22} color="#EA580C" />
            </View>
            <View>
              <Text style={[styles.maintenanceTitle, { color: textColor }]}>Side Brush</Text>
              <Text style={[styles.maintenanceLife, { color: PRIMARY }]}>82% Life</Text>
            </View>
          </View>
        </GlassCard>
        <GlassCard style={styles.maintenanceCard}>
          <View style={styles.maintenanceRow}>
            <View style={[styles.maintenanceIconBox, { backgroundColor: 'rgba(59, 130, 246, 0.2)' }]}>
              <IconSymbol name="air.purifier.fill" size={22} color="#3B82F6" />
            </View>
            <View>
              <Text style={[styles.maintenanceTitle, { color: textColor }]}>HEPA Filter</Text>
              <Text style={[styles.maintenanceLife, { color: PRIMARY }]}>95% Life</Text>
            </View>
          </View>
        </GlassCard>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    gap: 16,
    paddingTop: 8,
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  mapCard: {
    padding: 0,
    overflow: 'hidden',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  statusLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  batteryIconBox: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusTextBlock: {
    gap: 2,
  },
  batteryPercent: {
    fontSize: 14,
    fontWeight: '700',
    fontFamily: Typography.bold,
  },
  statusSubtext: {
    fontSize: 12,
    fontFamily: Typography.medium,
  },
  statusBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  pulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    fontFamily: Typography.bold,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  primaryButton: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    backgroundColor: PRIMARY,
    borderRadius: 24,
    shadowColor: PRIMARY,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
  primaryButtonPressed: {
    opacity: 0.92,
    transform: [{ scale: 0.98 }],
  },
  primaryButtonLabel: {
    fontSize: 16,
    fontWeight: '700',
    fontFamily: Typography.bold,
    color: '#FFFFFF',
  },
  returnButton: {
    alignSelf: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  returnButtonLabel: {
    fontSize: 13,
    fontWeight: '600',
    fontFamily: Typography.semiBold,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    fontFamily: Typography.bold,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  suctionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginLeft: 4,
  },
  suctionValue: {
    fontSize: 12,
    fontWeight: '700',
    fontFamily: Typography.bold,
  },
  suctionSegments: {
    flexDirection: 'row',
    gap: 8,
  },
  suctionSegment: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  suctionSegmentActive: {
    backgroundColor: PRIMARY,
  },
  suctionSegmentLabel: {
    fontSize: 11,
    fontWeight: '600',
    fontFamily: Typography.semiBold,
  },
  maintenanceGrid: {
    flexDirection: 'row',
    gap: 16,
  },
  maintenanceCard: {
    flex: 1,
    padding: 16,
  },
  maintenanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  maintenanceIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(234, 88, 12, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  maintenanceTitle: {
    fontSize: 12,
    fontWeight: '700',
    fontFamily: Typography.bold,
  },
  maintenanceLife: {
    fontSize: 10,
    fontWeight: '600',
    fontFamily: Typography.semiBold,
    marginTop: 2,
  },
});
