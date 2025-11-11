import React, { createContext, useContext, useState, ReactNode } from 'react';

export type OnboardingData = {
  inviteCode: string;
  name: string;
  email: string;
  selectedOption: 'A' | 'B' | null;
  localId?: string;
};

export type OnboardingContextType = {
  data: OnboardingData;
  updateData: (updates: Partial<OnboardingData>) => void;
  resetData: () => void;
  currentStep: number;
  setCurrentStep: (step: number) => void;
  isCompleted: boolean;
  setIsCompleted: (completed: boolean) => void;
};

const initialData: OnboardingData = {
  inviteCode: '',
  name: '',
  email: '',
  selectedOption: null,
};

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<OnboardingData>(initialData);
  const [currentStep, setCurrentStep] = useState(1);
  const [isCompleted, setIsCompleted] = useState(false);

  const updateData = (updates: Partial<OnboardingData>) => {
    setData((prev) => ({ ...prev, ...updates }));
  };

  const resetData = () => {
    setData(initialData);
    setCurrentStep(1);
    setIsCompleted(false);
  };

  return (
    <OnboardingContext.Provider
      value={{
        data,
        updateData,
        resetData,
        currentStep,
        setCurrentStep,
        isCompleted,
        setIsCompleted,
      }}>
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const context = useContext(OnboardingContext);
  if (context === undefined) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
}
