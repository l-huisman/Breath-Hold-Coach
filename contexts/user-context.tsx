import React, {createContext, useContext, useState, useEffect, useCallback, ReactNode} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
    updateUser: (user: Partial<UserDetails>) => Promise<void>
    updatePreferences: (preferences: Partial<UserPreferences>) => Promise<void>
    updateSettings: (settings: Partial<UserSettings>) => Promise<void>
    updateProgress: (progress: Partial<UserProgress>) => Promise<void>
    isLoading: boolean;
}

// Storage keys
const STORAGE_KEYS = {
    USER: '@breathhold:user',
    PREFERENCES: '@breathhold:preferences',
    SETTINGS: '@breathhold:settings',
    PROGRESS: '@breathhold:progress',
};

// Default practice moments for non-smokers (2 sessions per day)
export const defaultPracticeMomentsNormalLearning: PracticeMoment[] = [
    {id: '1', time: '09:00', enabled: true},
    {id: '2', time: '18:00', enabled: true},
];

// Default practice moments for smokers (more frequent, smaller sessions)
export const defaultPracticeMomentsAssistiveLearning: PracticeMoment[] = [
    {id: '1', time: '08:00', enabled: true},
    {id: '2', time: '11:00', enabled: true},
    {id: '3', time: '14:00', enabled: true},
    {id: '4', time: '17:00', enabled: true},
    {id: '5', time: '20:00', enabled: true},
];

const defaultUser: UserDetails = {
    name: 'Tineke Stoffers',
    dateOfBirth: new Date('1960-01-01'),
    patientNumber: '684651',
    assistiveLearning: false,
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

const UserContext = createContext<UserContextType | undefined>(undefined);

interface UserProviderProps {
    children: ReactNode;
}

export function UserProvider({children}: UserProviderProps) {
    const [user, setUser] = useState<UserDetails>(defaultUser);
    const [preferences, setPreferences] = useState<UserPreferences>(defaultPreferences);
    const [settings, setSettings] = useState<UserSettings>(defaultSettings);
    const [progress, setProgress] = useState<UserProgress>(defaultProgress);
    const [isLoading, setIsLoading] = useState(true);

    // Load data from AsyncStorage on mount
    const loadAllData = useCallback(async () => {
        try {
            const [userData, preferencesData, settingsData, progressData] = await Promise.all([
                AsyncStorage.getItem(STORAGE_KEYS.USER),
                AsyncStorage.getItem(STORAGE_KEYS.PREFERENCES),
                AsyncStorage.getItem(STORAGE_KEYS.SETTINGS),
                AsyncStorage.getItem(STORAGE_KEYS.PROGRESS),
            ]);

            if (userData) {
                const parsed = JSON.parse(userData);
                // Convert dateOfBirth string back to Date
                if (parsed.dateOfBirth) {
                    parsed.dateOfBirth = new Date(parsed.dateOfBirth);
                }
                setUser(parsed);
            }

            if (preferencesData) {
                setPreferences(JSON.parse(preferencesData));
            }

            if (settingsData) {
                setSettings(JSON.parse(settingsData));
            }

            if (progressData) {
                setProgress(JSON.parse(progressData));
            }
        } catch (error) {
            console.error('Failed to load user data from storage:', error);
            // Keep defaults on error
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadAllData();
    }, [loadAllData]);

    const updateUser = async (updates: Partial<UserDetails>) => {
        const newUser = {...user, ...updates};
        setUser(newUser);

        try {
            await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(newUser));
        } catch (error) {
            console.error('Failed to save user data:', error);
        }
    };

    const updatePreferences = async (updates: Partial<UserPreferences>) => {
        const newPreferences = {...preferences, ...updates};
        setPreferences(newPreferences);

        try {
            await AsyncStorage.setItem(STORAGE_KEYS.PREFERENCES, JSON.stringify(newPreferences));
        } catch (error) {
            console.error('Failed to save preferences:', error);
        }
    };

    const updateSettings = async (updates: Partial<UserSettings>) => {
        const newSettings = {...settings, ...updates};
        setSettings(newSettings);

        try {
            await AsyncStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(newSettings));
        } catch (error) {
            console.error('Failed to save settings:', error);
        }
    };

    const updateProgress = async (updates: Partial<UserProgress>) => {
        const newProgress = {...progress, ...updates};
        setProgress(newProgress);

        try {
            await AsyncStorage.setItem(STORAGE_KEYS.PROGRESS, JSON.stringify(newProgress));
        } catch (error) {
            console.error('Failed to save progress:', error);
        }
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
                isLoading,
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
