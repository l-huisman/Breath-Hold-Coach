import React, { useState } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { Wizard } from '@/components/onboarding/Wizard';
import { WizardStep } from '@/components/onboarding/WizardStep';
import { Button } from '@/components/onboarding/Button';
import { ErrorMessage } from '@/components/onboarding/ErrorMessage';
import { SuccessMessage } from '@/components/onboarding/SuccessMessage';
import { ThemedText } from '@/components/themed-text';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { saveUserData } from '@/services/database';

export default function FinalizeScreen() {
  const { data, updateData, setIsCompleted, resetData, setCurrentStep } = useOnboarding();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleFinalize = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const result = await saveUserData({
        inviteCode: data.inviteCode,
        name: data.name,
        email: data.email,
        selectedOption: data.selectedOption,
      });

      if (result.success) {
        updateData({ localId: result.userId });
        setIsCompleted(true);
        setSuccess('Your account has been set up successfully!');

        // Navigate to main app after a brief delay
        setTimeout(() => {
          router.replace('/(tabs)');
        }, 2000);
      } else {
        setError('Failed to save your information. Please try again.');
      }
    } catch {
      setError('An error occurred while setting up your account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    setCurrentStep(3);
    router.back();
  };

  const handleRestart = () => {
    resetData();
    router.replace('/onboarding/step1');
  };

  return (
    <Wizard currentStep={4} totalSteps={4}>
      <WizardStep>
        <View style={styles.content}>
          <ThemedText type="title" style={styles.title}>
            Ready to Begin!
          </ThemedText>
          <ThemedText style={styles.subtitle}>
            Review your information and complete your setup.
          </ThemedText>

          {error && <ErrorMessage message={error} />}
          {success && <SuccessMessage message={success} />}

          <View style={styles.summaryContainer}>
            <View style={styles.summaryItem}>
              <ThemedText type="defaultSemiBold">Invite Code:</ThemedText>
              <ThemedText>{data.inviteCode}</ThemedText>
            </View>
            <View style={styles.summaryItem}>
              <ThemedText type="defaultSemiBold">Name:</ThemedText>
              <ThemedText>{data.name}</ThemedText>
            </View>
            <View style={styles.summaryItem}>
              <ThemedText type="defaultSemiBold">Email:</ThemedText>
              <ThemedText>{data.email}</ThemedText>
            </View>
            <View style={styles.summaryItem}>
              <ThemedText type="defaultSemiBold">Training Path:</ThemedText>
              <ThemedText>
                {data.selectedOption === 'A' ? 'Guided Training' : 'Flexible Training'}
              </ThemedText>
            </View>
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" />
              <ThemedText style={styles.loadingText}>Setting up your account...</ThemedText>
            </View>
          ) : (
            <View style={styles.buttonContainer}>
              <Button
                title="Complete Setup"
                onPress={handleFinalize}
              />
              <Button
                title="Back"
                onPress={handleBack}
                variant="secondary"
              />
              <Button
                title="Restart Onboarding"
                onPress={handleRestart}
                variant="secondary"
              />
            </View>
          )}
        </View>
      </WizardStep>
    </Wizard>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    marginBottom: 8,
  },
  subtitle: {
    marginBottom: 32,
    opacity: 0.7,
  },
  summaryContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    padding: 20,
    borderRadius: 12,
    marginBottom: 24,
  },
  summaryItem: {
    marginBottom: 12,
  },
  loadingContainer: {
    alignItems: 'center',
    padding: 32,
  },
  loadingText: {
    marginTop: 16,
    opacity: 0.7,
  },
  buttonContainer: {
    gap: 12,
  },
});
