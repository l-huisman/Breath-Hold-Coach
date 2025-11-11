import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ThemedView } from '@/components/themed-view';

export type WizardStepProps = {
  children: React.ReactNode;
};

export function WizardStep({ children }: WizardStepProps) {
  return (
    <ThemedView style={styles.container}>
      <View style={styles.content}>{children}</View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 20,
  },
});
