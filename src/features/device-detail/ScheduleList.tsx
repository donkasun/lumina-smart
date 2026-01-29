import { Ionicons } from '@expo/vector-icons';
import { Typography } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';
import { AnimatedToggle } from '@/src/components/controls/AnimatedToggle';
import { GlassCard } from '@/src/components/ui/GlassCard';
import React, { useCallback, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

const MOCK_SCHEDULES = [
  {
    id: '1',
    name: 'Morning Rise',
    detail: 'DAILY • 07:00 AM • 100%',
    icon: 'sunny-outline' as const,
    iconBg: 'rgba(251,146,60,0.15)',
    iconColor: '#F97316',
    isOn: true,
  },
  {
    id: '2',
    name: 'Night Dimmer',
    detail: 'DAILY • 10:00 PM • 20%',
    icon: 'moon-outline' as const,
    iconBg: 'rgba(99,102,241,0.15)',
    iconColor: '#6366F1',
    isOn: true,
  },
];

interface ScheduleRowProps {
  name: string;
  detail: string;
  icon: 'sunny-outline' | 'moon-outline';
  iconBg: string;
  iconColor: string;
  isOn: boolean;
}

const ScheduleRow: React.FC<ScheduleRowProps> = ({
  name,
  detail,
  icon,
  iconBg,
  iconColor,
  isOn: initialIsOn,
}) => {
  const textColor = useThemeColor({}, 'text');
  const subtextColor = useThemeColor({}, 'icon');
  const [isOn, setIsOn] = useState(initialIsOn);

  const handleToggle = useCallback((v: boolean) => {
    setIsOn(v);
  }, []);

  return (
    <View style={styles.scheduleRow}>
      <View style={[styles.iconBadge, { backgroundColor: iconBg }]}>
        <Ionicons name={icon} size={20} color={iconColor} />
      </View>
      <View style={styles.scheduleText}>
        <Text style={[styles.scheduleName, { color: textColor }]}>{name}</Text>
        <Text style={[styles.scheduleDetail, { color: subtextColor }]}>{detail}</Text>
      </View>
      <AnimatedToggle value={isOn} onChange={handleToggle} />
    </View>
  );
};

export const ScheduleList: React.FC = () => {
  const textColor = useThemeColor({}, 'text');
  const subtextColor = useThemeColor({}, 'icon');
  const primaryColor = '#FF7D54';

  return (
    <GlassCard style={styles.card}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Ionicons name="time-outline" size={16} color={textColor} />
          <Text style={[styles.label, { color: subtextColor }]}>Schedules</Text>
        </View>
        <Text style={[styles.addButton, { color: primaryColor }]}>+ ADD</Text>
      </View>

      <View style={styles.list}>
        {MOCK_SCHEDULES.map((schedule) => (
          <ScheduleRow key={schedule.id} {...schedule} />
        ))}
      </View>
    </GlassCard>
  );
};

const styles = StyleSheet.create({
  card: {
    gap: 14,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    fontFamily: Typography.bold,
    letterSpacing: 1,
  },
  addButton: {
    fontSize: 12,
    fontWeight: '700',
    fontFamily: Typography.bold,
  },
  list: {
    gap: 10,
  },
  scheduleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scheduleText: {
    flex: 1,
    gap: 2,
  },
  scheduleName: {
    fontSize: 12,
    fontWeight: '700',
    fontFamily: Typography.bold,
  },
  scheduleDetail: {
    fontSize: 8,
    fontFamily: Typography.regular,
    textTransform: 'uppercase',
  },
});
