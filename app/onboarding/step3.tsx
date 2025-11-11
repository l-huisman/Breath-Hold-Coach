import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { Wizard } from '@/components/onboarding/Wizard';
import { WizardStep } from '@/components/onboarding/WizardStep';
import { ABButton } from '@/components/onboarding/ABButton';
import { Button } from '@/components/onboarding/Button';
import { ErrorMessage } from '@/components/onboarding/ErrorMessage';
import { ThemedText } from '@/components/themed-text';
import { useOnboarding } from '@/contexts/OnboardingContext';

export default function Step3Screen() {
  const { data, updateData, setCurrentStep } = useOnboarding();
  const [selectedOption, setSelectedOption] = useState<'A' | 'B' | null>(data.selectedOption);
  const [error, setError] = useState('');

  const handleNext = () => {
    if (!selectedOption) {
      setError('Please select an option to continue');
      return;
    }

    setError('');
    updateData({ selectedOption });
    setCurrentStep(4);
    router.push('/onboarding/finalize');
  };

  const handleBack = () => {
    setCurrentStep(2);
    router.back();
  };

  const handleSelect = (option: 'A' | 'B') => {
    setSelectedOption(option);
    setError('');
  };

  return (
    <Wizard currentStep={3} totalSteps={4}>
      <WizardStep>
        <View style={styles.content}>
          <ThemedText type="title" style={styles.title}>
            Choose Your Path
          </ThemedText>
          <ThemedText style={styles.subtitle}>
            Select the training approach that best suits your needs.
          </ThemedText>

          {error && <ErrorMessage message={error} />}

          <View style={styles.optionsContainer}>
            <ABButton
              title="Option A: Guided Training"
              description="Structured program with step-by-step instructions and daily reminders"
              selected={selectedOption === 'A'}
              onPress={() => handleSelect('A')}
            />
            <ABButton
              title="Option B: Flexible Training"
              description="Self-paced approach with customizable exercises and tracking"
              selected={selectedOption === 'B'}
              onPress={() => handleSelect('B')}
            />
          </View>

          <View style={styles.buttonContainer}>
            <Button
              title="Continue"
              onPress={handleNext}
              disabled={!selectedOption}
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
  optionsContainer: {
    marginBottom: 24,
  },
  buttonContainer: {
    marginTop: 24,
    gap: 12,
  },
});
