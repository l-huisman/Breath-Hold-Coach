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
import { validateEmail } from '@/services/database';

export default function Step2Screen() {
  const { data, updateData, setCurrentStep } = useOnboarding();
  const [name, setName] = useState(data.name);
  const [email, setEmail] = useState(data.email);
  const [errors, setErrors] = useState({ name: '', email: '' });

  const handleNext = () => {
    const newErrors = { name: '', email: '' };

    if (!name.trim()) {
      newErrors.name = 'Please enter your name';
    }

    if (!email.trim()) {
      newErrors.email = 'Please enter your email';
    } else if (!validateEmail(email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    setErrors(newErrors);

    if (!newErrors.name && !newErrors.email) {
      updateData({ name, email });
      setCurrentStep(3);
      router.push('/onboarding/step3');
    }
  };

  const handleBack = () => {
    setCurrentStep(1);
    router.back();
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <Wizard currentStep={2} totalSteps={4}>
        <WizardStep>
          <View style={styles.content}>
            <ThemedText type="title" style={styles.title}>
              Personal Information
            </ThemedText>
            <ThemedText style={styles.subtitle}>
              Tell us a bit about yourself to personalize your experience.
            </ThemedText>

            {(errors.name || errors.email) && (
              <ErrorMessage message="Please correct the errors below" />
            )}

            <InputField
              label="Full Name"
              value={name}
              onChangeText={setName}
              placeholder="Enter your full name"
              autoCapitalize="words"
              error={errors.name}
            />

            <InputField
              label="Email Address"
              value={email}
              onChangeText={setEmail}
              placeholder="your.email@example.com"
              autoCapitalize="none"
              keyboardType="email-address"
              error={errors.email}
            />

            <View style={styles.buttonContainer}>
              <Button
                title="Continue"
                onPress={handleNext}
                disabled={!name.trim() || !email.trim()}
              />
              <Button
                title="Back"
                onPress={handleBack}
                variant="secondary"
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
  buttonContainer: {
    marginTop: 24,
    gap: 12,
  },
});
