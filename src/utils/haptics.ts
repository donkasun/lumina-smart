import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

/**
 * Haptic feedback utility for consistent tactile feedback across the app
 *
 * Usage:
 * - hapticFeedback.selection() - Light tap for selections
 * - hapticFeedback.success() - Success confirmation
 * - hapticFeedback.warning() - Warning/error
 * - hapticFeedback.impact() - Medium impact
 * - hapticFeedback.heavy() - Heavy impact (destructive actions)
 */

class HapticFeedback {
  private enabled: boolean = true;

  /**
   * Enable or disable haptics globally
   */
  setEnabled(enabled: boolean) {
    this.enabled = enabled;
  }

  /**
   * Light haptic for selections and taps
   */
  async selection() {
    if (!this.enabled) return;
    try {
      await Haptics.selectionAsync();
    } catch (error) {
      if (__DEV__) console.warn('Haptics not supported', error);
    }
  }

  /**
   * Success haptic feedback (2 light impacts)
   */
  async success() {
    if (!this.enabled) return;
    try {
      await Haptics.notificationAsync(
        Haptics.NotificationFeedbackType.Success
      );
    } catch (error) {
      if (__DEV__) console.warn('Haptics not supported', error);
    }
  }

  /**
   * Warning haptic feedback
   */
  async warning() {
    if (!this.enabled) return;
    try {
      await Haptics.notificationAsync(
        Haptics.NotificationFeedbackType.Warning
      );
    } catch (error) {
      if (__DEV__) console.warn('Haptics not supported', error);
    }
  }

  /**
   * Error haptic feedback (stronger than warning)
   */
  async error() {
    if (!this.enabled) return;
    try {
      await Haptics.notificationAsync(
        Haptics.NotificationFeedbackType.Error
      );
    } catch (error) {
      if (__DEV__) console.warn('Haptics not supported', error);
    }
  }

  /**
   * Light impact (for press in)
   */
  async light() {
    if (!this.enabled) return;
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (error) {
      if (__DEV__) console.warn('Haptics not supported', error);
    }
  }

  /**
   * Medium impact (for button presses, toggles)
   */
  async impact() {
    if (!this.enabled) return;
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch (error) {
      if (__DEV__) console.warn('Haptics not supported', error);
    }
  }

  /**
   * Heavy impact (for destructive actions, confirmations)
   */
  async heavy() {
    if (!this.enabled) return;
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    } catch (error) {
      if (__DEV__) console.warn('Haptics not supported', error);
    }
  }

  /**
   * Rigid impact (for precise actions, snapping)
   */
  async rigid() {
    if (!this.enabled) return;
    try {
      if (Platform.OS === 'ios') {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Rigid);
      } else {
        // Fallback to medium on Android
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
    } catch (error) {
      if (__DEV__) console.warn('Haptics not supported', error);
    }
  }

  /**
   * Soft impact (for subtle feedback)
   */
  async soft() {
    if (!this.enabled) return;
    try {
      if (Platform.OS === 'ios') {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
      } else {
        // Fallback to light on Android
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    } catch (error) {
      if (__DEV__) console.warn('Haptics not supported', error);
    }
  }
}

// Singleton instance
export const hapticFeedback = new HapticFeedback();

// Convenience exports for common patterns
export const haptics = {
  // UI Interactions
  tap: () => hapticFeedback.light(),
  press: () => hapticFeedback.impact(),
  toggle: () => hapticFeedback.selection(),

  // Gestures
  swipeStart: () => hapticFeedback.soft(),
  swipeThreshold: () => hapticFeedback.rigid(),
  swipeComplete: () => hapticFeedback.impact(),

  // Actions
  delete: () => hapticFeedback.heavy(),
  favorite: () => hapticFeedback.success(),
  cancel: () => hapticFeedback.warning(),

  // Feedback
  success: () => hapticFeedback.success(),
  error: () => hapticFeedback.error(),
  warning: () => hapticFeedback.warning(),
};

export default hapticFeedback;
