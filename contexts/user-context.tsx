import React, {createContext, useContext, useState, ReactNode} from 'react';

export interface UserPreferences {
    notifications: boolean;
    hapticFeedback: boolean;
    soundEnabled: boolean;
    theme: 'light' | 'dark' | 'system';
    language: string;
}

export interface UserDetails {
    name: string;
    dateOfBirth: Date | null;
    patientNumber: string;
}

export interface UserSettings {
    breathHoldGoal: number; // in seconds
    dailyReminderTime: string | null;
    weeklyGoal: number; // number of sessions
}

export interface UserContextType {
    user: UserDetails;
    preferences: UserPreferences;
    settings: UserSettings;
    updateUser: (user: Partial<UserDetails>) => void;
    updatePreferences: (preferences: Partial<UserPreferences>) => void;
    updateSettings: (settings: Partial<UserSettings>) => void;
}

const defaultUser: UserDetails = {
    name: 'Tineke',
    dateOfBirth: null,
    patientNumber: '123456',
};

const defaultPreferences: UserPreferences = {
    notifications: true,
    hapticFeedback: true,
    soundEnabled: true,
    theme: 'system',
    language: 'nl',
};

const defaultSettings: UserSettings = {
    breathHoldGoal: 45,
    dailyReminderTime: null,
    weeklyGoal: 5,
};

const UserContext = createContext<UserContextType | undefined>(undefined);

interface UserProviderProps {
    children: ReactNode;
}

export function UserProvider({children}: UserProviderProps) {
    const [user, setUser] = useState<UserDetails>(defaultUser);
    const [preferences, setPreferences] = useState<UserPreferences>(defaultPreferences);
    const [settings, setSettings] = useState<UserSettings>(defaultSettings);

    const updateUser = (updates: Partial<UserDetails>) => {
        setUser(prev => ({...prev, ...updates}));
    };

    const updatePreferences = (updates: Partial<UserPreferences>) => {
        setPreferences(prev => ({...prev, ...updates}));
    };

    const updateSettings = (updates: Partial<UserSettings>) => {
        setSettings(prev => ({...prev, ...updates}));
    };

    return (
        <UserContext.Provider
            value={{
                user,
                preferences,
                settings,
                updateUser,
                updatePreferences,
                updateSettings,
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

