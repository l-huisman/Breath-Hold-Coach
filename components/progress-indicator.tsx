import React from 'react';
import { View, Text, StyleSheet, Image, ImageSourcePropType } from 'react-native';
import { Colors, Fonts } from '@/constants/theme';

interface ProgressIndicatorProps {
  /**
   * Current seconds achieved
   */
  seconds: number;
  /**
   * Maximum seconds possible (default: 45)
   */
  maxSeconds?: number;
  /**
   * Label text displayed next to the seconds
   */
  label?: string;
  /**
   * Optional icon to display on the left - can be an image source or React component
   */
  icon?: ImageSourcePropType | React.ReactNode;
}

export function ProgressIndicator({
  seconds,
  maxSeconds = 45,
  label = 'Progressie van oefenen',
  icon,
}: ProgressIndicatorProps) {
  // Clamp seconds between 0 and maxSeconds
  const clampedSeconds = Math.max(0, Math.min(maxSeconds, seconds));
  // Calculate progress percentage for the bar
  const progressPercentage = (clampedSeconds / maxSeconds) * 100;

  // Check if icon is an image source or a React component
  const isImageSource = icon && typeof icon === 'object' && !React.isValidElement(icon);

  return (
    <View style={styles.container}>
      {/* Icon - only render if provided */}
      {icon && (
        <View style={styles.iconContainer}>
          {isImageSource ? (
            <Image source={icon as ImageSourcePropType} style={styles.icon} resizeMode="contain" />
          ) : (
            icon
          )}
        </View>
      )}

      {/* Content */}
      <View style={[styles.content, !icon && styles.contentWithoutIcon]}>
        {/* Top row: seconds and label */}
        <View style={styles.topRow}>
          <Text style={styles.seconds}>{Math.round(clampedSeconds)}s</Text>
          <Text style={styles.label}>{label}</Text>
        </View>

        {/* Progress bar */}
        <View style={styles.progressBarContainer}>
          <View
            style={[
              styles.progressBarFilled,
              { width: `${progressPercentage}%` },
            ]}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 3,
    borderColor: Colors.light.primary,
    borderRadius: 10,
    backgroundColor: Colors.light.background,
  },
  iconContainer: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    width: 29.33,
    height: 29.33,
  },
  content: {
    flex: 1,
    gap: 8,
  },
  contentWithoutIcon: {
    marginLeft: 0,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  seconds: {
    fontFamily: Fonts.bold,
    fontSize: 18,
    color: Colors.light.primary,
  },
  label: {
    fontFamily: Fonts.semiBold,
    fontSize: 16,
    color: Colors.light.textMuted,
  },
  progressBarContainer: {
    width: '100%',
    height: 8,
    backgroundColor: Colors.light.progressBackground,
    borderRadius: 100,
    overflow: 'hidden',
  },
  progressBarFilled: {
    height: '100%',
    backgroundColor: Colors.light.primary,
    borderRadius: 100,
  },
});

