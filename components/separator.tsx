import React from 'react';
import { StyleSheet, View, type ViewProps } from 'react-native';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export type SeparatorProps = ViewProps & {
  /**
   * Color of the separator line (default: text color from theme)
   */
  color?: string;
};

/**
 * A horizontal separator line component for visual separation of content.
 *
 * @example
 * <Separator />
 * <Separator color="#CCCCCC" />
 */
export function Separator({ color, style, ...rest }: SeparatorProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const themeColor = Colors[colorScheme].text;

  return (
    <View
      style={[
        styles.separator,
        { backgroundColor: color ?? themeColor },
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  separator: {
    height: 1,
    width: '100%',
  },
});

