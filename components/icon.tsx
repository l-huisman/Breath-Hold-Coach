import React from 'react';
import { Platform, StyleProp, ViewStyle } from 'react-native';
import { SymbolView, SymbolWeight } from 'expo-symbols';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Colors } from '@/constants/theme';

/**
 * SF Symbol names available in the app.
 * These are official Apple SF Symbol names.
 * @see https://developer.apple.com/sf-symbols/
 */
const SF_SYMBOLS = [
  // Target/Goal icons
  'target',
  'scope',

  // Navigation & Actions
  'house.fill',
  'gearshape.fill',
  'line.3.horizontal',
  'xmark',
  'arrow.left',
  'arrow.right',
  'chevron.right',
  'chevron.left',

  // Breathing & Health
  'lungs.fill',
  'heart.fill',
  'waveform.path.ecg',
  'timer',
  'stopwatch.fill',
  'figure.mind.and.body',
  'brain.head.profile',

  // User & Profile
  'person.fill',
  'person.2.fill',

  // Communication
  'message.fill',
  'envelope.fill',
  'paperplane.fill',

  // Calendar & Time
  'calendar',
  'clock.fill',

  // Relaxation
  'leaf.fill',
  'wind',

  // Media
  'play.fill',
  'pause.fill',
  'stop.fill',
  'speaker.wave.2.fill',

  // General UI
  'checkmark',
  'plus',
  'minus',
  'info.circle.fill',
  'questionmark.circle.fill',
  'exclamationmark.triangle.fill',
  'star.fill',
  'bookmark.fill',
  'pencil',
  'trash.fill',
  'magnifyingglass',
  'line.3.horizontal.decrease',
  'graduationcap.fill',
] as const;

export type IconName = typeof SF_SYMBOLS[number];

/**
 * Fallback mapping for Android/Web (SF Symbol -> Material Icon)
 */
const MATERIAL_FALLBACK: Record<IconName, string> = {
  'target': 'gps-fixed',
  'scope': 'my-location',
  'house.fill': 'home',
  'gearshape.fill': 'settings',
  'line.3.horizontal': 'menu',
  'xmark': 'close',
  'arrow.left': 'arrow-back',
  'arrow.right': 'arrow-forward',
  'chevron.right': 'chevron-right',
  'chevron.left': 'chevron-left',
  'lungs.fill': 'air',
  'heart.fill': 'favorite',
  'waveform.path.ecg': 'show-chart',
  'timer': 'timer',
  'stopwatch.fill': 'timer',
  'figure.mind.and.body': 'accessibility',
  'brain.head.profile': 'psychology',
  'person.fill': 'person',
  'person.2.fill': 'people',
  'message.fill': 'message',
  'envelope.fill': 'email',
  'paperplane.fill': 'send',
  'calendar': 'calendar-today',
  'clock.fill': 'schedule',
  'leaf.fill': 'spa',
  'wind': 'air',
  'play.fill': 'play-arrow',
  'pause.fill': 'pause',
  'stop.fill': 'stop',
  'speaker.wave.2.fill': 'volume-up',
  'checkmark': 'check',
  'plus': 'add',
  'minus': 'remove',
  'info.circle.fill': 'info',
  'questionmark.circle.fill': 'help',
  'exclamationmark.triangle.fill': 'warning',
  'star.fill': 'star',
  'bookmark.fill': 'bookmark',
  'pencil': 'edit',
  'trash.fill': 'delete',
  'magnifyingglass': 'search',
  'line.3.horizontal.decrease': 'filter-list',
  'graduationcap.fill': 'school',
};

export interface IconProps {
  /**
   * The SF Symbol name to display
   * @see https://developer.apple.com/sf-symbols/
   */
  name: IconName;
  /**
   * Size of the icon (default: 32)
   */
  size?: number;
  /**
   * Color of the icon (default: primary color from theme)
   */
  color?: string;
  /**
   * Optional style to apply to the icon
   */
  style?: StyleProp<ViewStyle>;
  /**
   * Weight of the SF Symbol (iOS only, default: 'regular')
   */
  weight?: SymbolWeight;
}

/**
 * A unified Icon component using Apple SF Symbols.
 * Uses native SF Symbols on iOS and Material Icons fallback on Android/Web.
 *
 * @example
 * <Icon name="target" size={32} color="#284EA6" />
 * <Icon name="house.fill" />
 * <Icon name="graduationcap.fill" color="#F2EEEB" />
 */
export function Icon({
  name,
  size = 32,
  color = Colors.light.primary,
  style,
  weight = 'regular',
}: IconProps) {
  if (Platform.OS === 'ios') {
    return (
      <SymbolView
        name={name}
        size={size}
        tintColor={color}
        weight={weight}
        resizeMode="scaleAspectFit"
        style={[{ width: size, height: size }, style]}
      />
    );
  }

  // Fallback for Android/Web
  const materialName = MATERIAL_FALLBACK[name];
  return (
    <MaterialIcons
      name={materialName as keyof typeof MaterialIcons.glyphMap}
      size={size}
      color={color}
    />
  );
}

/**
 * Get all available SF Symbol names
 */
export function getAvailableIcons(): IconName[] {
  return [...SF_SYMBOLS];
}

