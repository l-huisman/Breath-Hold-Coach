import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { router } from 'expo-router';
import { Wizard } from '@/components/onboarding/Wizard';
import { WizardStep } from '@/components/onboarding/WizardStep';
import { InputField } from '@/components/onboarding/InputField';
import { Button } from '@/components/onboarding/Button';
import { ErrorMessage } from '@/components/onboarding/ErrorMessage';
import { ThemedText } from '@/components/themed-text';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { validateInviteCode } from '@/services/database';

export default function Step1Screen() {
  const { data, updateData, setCurrentStep } = useOnboarding();
  const [inviteCode, setInviteCode] = useState(data.inviteCode);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleNext = async () => {
    setError('');

    if (!inviteCode.trim()) {
      setError('Please enter an invite code');
      return;
    }

    setLoading(true);
    try {
      const isValid = await validateInviteCode(inviteCode);
      
      if (isValid) {
        updateData({ inviteCode });
        setCurrentStep(2);
        router.push('/onboarding/step2');
      } else {
        setError('Invalid invite code. Please try again.');
      }
    } catch {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <Wizard currentStep={1} totalSteps={4}>
        <WizardStep>
          <View style={styles.content}>
            <ThemedText type="title" style={styles.title}>
              Welcome!
            </ThemedText>
            <ThemedText style={styles.subtitle}>
              Enter your invite code to get started with the Breath Hold Coach.
            </ThemedText>

            {error && <ErrorMessage message={error} />}

            <InputField
              label="Invite Code"
              value={inviteCode}
              onChangeText={setInviteCode}
              placeholder="Enter your invite code"
              autoCapitalize="characters"
              error={error ? ' ' : ''}
            />

            <ThemedText style={styles.hint}>
              💡 Try: DEMO2024, TEST123, INVITE001, or WELCOME
            </ThemedText>

            <View style={styles.buttonContainer}>
              <Button
                title="Continue"
                onPress={handleNext}
                loading={loading}
                disabled={!inviteCode.trim()}
              />
            </View>
          </View>
        </WizardStep>
      </Wizard>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
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
  hint: {
    fontSize: 12,
    marginTop: 8,
    marginBottom: 24,
    opacity: 0.6,
  },
  buttonContainer: {
    marginTop: 24,
  },
});
