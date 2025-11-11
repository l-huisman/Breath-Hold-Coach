import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useThemeColor } from '@/hooks/use-theme-color';

export type WizardProgressIndicatorProps = {
  currentStep: number;
  totalSteps: number;
  lightColor?: string;
  darkColor?: string;
};

export function WizardProgressIndicator({
  currentStep,
  totalSteps,
  lightColor,
  darkColor,
}: WizardProgressIndicatorProps) {
  const activeColor = useThemeColor({ light: lightColor, dark: darkColor }, 'tint');
  const inactiveColor = useThemeColor({ light: '#e0e0e0', dark: '#444' }, 'icon');

  return (
    <View style={styles.container}>
      {Array.from({ length: totalSteps }, (_, index) => (
        <View
          key={index}
          style={[
            styles.step,
            {
              backgroundColor: index < currentStep ? activeColor : inactiveColor,
            },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
  step: {
    height: 8,
    flex: 1,
    marginHorizontal: 4,
    borderRadius: 4,
  },
});
