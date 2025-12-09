import React, {createContext, useContext, useState, ReactNode} from 'react';

export interface PracticeMoment {
    id: string;
    time: string; // HH:mm format
    enabled: boolean;
}

export interface UserPreferences {
    notifications: boolean;
    practiceMoments: PracticeMoment[];
}

export interface UserDetails {
    name: string;
    dateOfBirth: Date | null;
    patientNumber: string;
    assistiveLearning: boolean | null; // null = not yet filled in during onboarding
}

export interface UserSettings {
    breathHoldGoal: number; // in seconds - ultimate goal
    dailyGoal: number; // in seconds - daily increment goal
    dailyReminder: boolean;
    dailyReminderTime: string | null;
}

export interface UserProgress {
    currentBreathHold: number; // current best breath hold in seconds
    completedExercises: number; // total completed exercises
    lastPracticeDate: string | null; // ISO date string
    streakDays: number; // consecutive days practiced
}

export interface UserContextType {
    user: UserDetails;
    preferences: UserPreferences;
    settings: UserSettings;
    progress: UserProgress;
    updateUser: (user: Partial<UserDetails>) => void;
    updatePreferences: (preferences: Partial<UserPreferences>) => void;
    updateSettings: (settings: Partial<UserSettings>) => void;
    updateProgress: (progress: Partial<UserProgress>) => void;
}

// Default practice moments for non-smokers (2 sessions per day)
const defaultPracticeMomentsNormalLearning: PracticeMoment[] = [
    {id: '1', time: '09:00', enabled: true},
    {id: '2', time: '18:00', enabled: true},
];

// Default practice moments for smokers (more frequent, smaller sessions)
const defaultPracticeMomentsAssistiveLearning: PracticeMoment[] = [
    {id: '1', time: '08:00', enabled: true},
    {id: '2', time: '11:00', enabled: true},
    {id: '3', time: '14:00', enabled: true},
    {id: '4', time: '17:00', enabled: true},
    {id: '5', time: '20:00', enabled: true},
];

const defaultUser: UserDetails = {
    name: 'Tineke',
    dateOfBirth: null,
    patientNumber: '123456',
    assistiveLearning: null,
};

const defaultPreferences: UserPreferences = {
    notifications: true,
    practiceMoments: defaultPracticeMomentsNormalLearning,
};

// Daily goal: seconds to add per day
// Non-smoker: 5 seconds per day (faster progression)
// Smoker: 2 seconds per day (smaller steps, more gradual)
const defaultSettings: UserSettings = {
    breathHoldGoal: 45,
    dailyGoal: 5, // default for non-smoker
    dailyReminder: false,
    dailyReminderTime: null,
};

const defaultProgress: UserProgress = {
    currentBreathHold: 12,
    completedExercises: 0,
    lastPracticeDate: null,
    streakDays: 0,
};

export {defaultPracticeMomentsNormalLearning, defaultPracticeMomentsAssistiveLearning};

const UserContext = createContext<UserContextType | undefined>(undefined);

interface UserProviderProps {
    children: ReactNode;
}

export function UserProvider({children}: UserProviderProps) {
    const [user, setUser] = useState<UserDetails>(defaultUser);
    const [preferences, setPreferences] = useState<UserPreferences>(defaultPreferences);
    const [settings, setSettings] = useState<UserSettings>(defaultSettings);
    const [progress, setProgress] = useState<UserProgress>(defaultProgress);

    const updateUser = (updates: Partial<UserDetails>) => {
        setUser(prev => ({...prev, ...updates}));
    };

    const updatePreferences = (updates: Partial<UserPreferences>) => {
        setPreferences(prev => ({...prev, ...updates}));
    };

    const updateSettings = (updates: Partial<UserSettings>) => {
        setSettings(prev => ({...prev, ...updates}));
    };

    const updateProgress = (updates: Partial<UserProgress>) => {
        setProgress(prev => ({...prev, ...updates}));
    };

    return (
        <UserContext.Provider
            value={{
                user,
                preferences,
                settings,
                progress,
                updateUser,
                updatePreferences,
                updateSettings,
                updateProgress,
            }}
        >
            {children}
        </UserContext.Provider>
    );
}

export function useUser() {
    const context = useContext(UserContext);
    if (context === undefined) {
        throw new Error('useUser must be used within a UserProvider');
    }
    return context;
}
