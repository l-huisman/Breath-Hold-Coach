import React from 'react';
import { StyleSheet, ScrollView } from 'react-native';
import { ThemedView } from '@/components/themed-view';
import { WizardProgressIndicator } from './WizardProgressIndicator';

export type WizardProps = {
  children: React.ReactNode;
  currentStep: number;
  totalSteps: number;
};

export function Wizard({ children, currentStep, totalSteps }: WizardProps) {
  return (
    <ThemedView style={styles.container}>
      <WizardProgressIndicator currentStep={currentStep} totalSteps={totalSteps} />
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled">
        {children}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
});
