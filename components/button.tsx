import React, { ReactNode } from 'react';
import {
  StyleSheet,
  Text,
  Pressable,
  View,
  type PressableProps,
} from 'react-native';
import { router, type Href } from 'expo-router';
import { Colors } from '@/constants/theme';

export type ButtonProps = Omit<PressableProps, 'onPress'> & {
  /**
   * The main content of the button - can be text or an icon (required)
   */
  children: ReactNode;
  /**
   * Optional icon placed to the left of the main content
   */
  icon?: ReactNode;
  /**
   * Optional route to navigate to when pressed
   */
  href?: Href;
  /**
   * Optional onPress handler (ignored if href is provided)
   */
  onPress?: PressableProps['onPress'];
};

export function Button({ children, icon, style, href, onPress, ...rest }: ButtonProps) {
  const isTextContent = typeof children === 'string';

  const handlePress = (event: any) => {
    if (href) {
      router.push(href);
    } else if (onPress) {
      onPress(event);
    }
  };

  return (
    <Pressable
      style={({ pressed }) => [
        styles.button,
        pressed && styles.buttonPressed,
        style as any,
      ]}
      onPress={handlePress}
      {...rest}
    >
      {icon && <View style={styles.iconContainer}>{icon}</View>}
      {isTextContent ? (
        <Text style={styles.text}>{children}</Text>
      ) : (
        <View style={styles.iconContainer}>{children}</View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    width: '100%',
    height: 48,
    minWidth: 250,
    paddingVertical: 8,
    paddingHorizontal: 0,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
    borderRadius: 10,
    backgroundColor: Colors.light.tertiary,
    shadowColor: 'rgba(0, 0, 0, 0.25)',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
  },
  buttonPressed: {
    opacity: 0.8,
  },
  iconContainer: {
    width: 32,
    height: 32,
    flexShrink: 0,
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    color: Colors.light.textContrast,
    textAlign: 'center',
    fontFamily: 'Montserrat',
    fontSize: 16,
    fontWeight: '600', // Closest to 550 in React Native
    lineHeight: 16, // Normal line height
  },
});

