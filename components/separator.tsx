import React from 'react';
import { StyleSheet, View, type ViewProps } from 'react-native';
import { Colors } from '@/constants/theme';

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
  return (
    <View
      style={[
        styles.separator,
        color && { backgroundColor: color },
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
    backgroundColor: Colors.light.text,
  },
});

