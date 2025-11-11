import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { useThemeColor } from '@/hooks/use-theme-color';

export type ABButtonProps = {
  title: string;
  description?: string;
  onPress: () => void;
  selected: boolean;
  lightColor?: string;
  darkColor?: string;
};

export function ABButton({
  title,
  description,
  onPress,
  selected,
  lightColor,
  darkColor,
}: ABButtonProps) {
  const tintColor = useThemeColor({ light: lightColor, dark: darkColor }, 'tint');
  const textColor = useThemeColor({ light: undefined, dark: undefined }, 'text');
  const backgroundColor = useThemeColor({ light: '#f5f5f5', dark: '#2a2a2a' }, 'background');

  return (
    <TouchableOpacity
      style={[
        styles.button,
        { backgroundColor },
        selected && { borderColor: tintColor, borderWidth: 2 },
      ]}
      onPress={onPress}
      activeOpacity={0.7}>
      <View style={styles.content}>
        <Text style={[styles.title, { color: textColor }]}>{title}</Text>
        {description && <Text style={[styles.description, { color: textColor }]}>{description}</Text>}
      </View>
      {selected && (
        <View style={[styles.indicator, { backgroundColor: tintColor }]}>
          <Text style={styles.checkmark}>✓</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#ccc',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    opacity: 0.7,
  },
  indicator: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
  checkmark: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
