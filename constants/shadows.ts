import { Platform } from 'react-native';

export const Shadows = {
  // Header pills: weather, energy, live badges (uniform across all)
  pill: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 1, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    },
    android: { elevation: 2 },
  }) ?? {},

  // Glass cards, inline panels (Level 1)
  card: Platform.select({
    ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
           shadowOpacity: 0.06, shadowRadius: 12 },
    android: { elevation: 2 },
  }) ?? {},

  // Section cards, tab bar (Level 2)
  section: Platform.select({
    ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 10 },
           shadowOpacity: 0.08, shadowRadius: 30 },
    android: { elevation: 4 },
  }) ?? {},

  // Scene buttons, device icons, action buttons with primary bg (Level 3)
  primaryUnderglow: Platform.select({
    ios: { shadowColor: '#FF7D54', shadowOffset: { width: 0, height: 6 },
           shadowOpacity: 0.30, shadowRadius: 12 },
    android: { elevation: 6 },
  }) ?? {},

  // Power button, modal icon, hero-sized primary circles (Level 3 strong)
  heroUnderglow: Platform.select({
    ios: { shadowColor: '#FF7D54', shadowOffset: { width: 0, height: 8 },
           shadowOpacity: 0.40, shadowRadius: 16 },
    android: { elevation: 10 },
  }) ?? {},
} as const;
