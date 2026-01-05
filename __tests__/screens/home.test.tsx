import React from 'react';
import { render, fireEvent, waitFor, screen } from '@testing-library/react-native';
import { router } from 'expo-router';
import HomeScreen from '@/app/(tabs)/index';
import { UserProvider } from '@/contexts/user-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Mock expo-router
jest.mock('expo-router', () => ({
    router: {
        push: jest.fn(),
    },
}));

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
    getItem: jest.fn(),
    setItem: jest.fn(),
}));

// Mock SafeAreaView
jest.mock('react-native-safe-area-context', () => ({
    SafeAreaView: ({ children }: any) => children,
}));

// Mock expo-symbols
jest.mock('expo-symbols', () => ({
    SymbolView: ({ name, size, tintColor }: any) => null,
}));

// Mock Icon component
jest.mock('@/components/icon', () => ({
    Icon: ({ name, size, color }: any) => null,
}));

describe('HomeScreen', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
        <UserProvider>{children}</UserProvider>
    );

    beforeEach(() => {
        jest.clearAllMocks();
        (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
    });

    describe('Start Practice Button', () => {
        it('should render start practice button', () => {
            const { getByLabelText } = render(<HomeScreen />, { wrapper });

            const button = getByLabelText('Start oefenen, tik om te beginnen met de ademhalingsoefening');
            expect(button).toBeTruthy();
        });

        it('should have correct accessibility label', () => {
            const { getByLabelText } = render(<HomeScreen />, { wrapper });

            const button = getByLabelText(
                'Start oefenen, tik om te beginnen met de ademhalingsoefening'
            );
            expect(button).toBeTruthy();
        });

        it('should navigate to /practice when pressed', () => {
            const { getByLabelText } = render(<HomeScreen />, { wrapper });

            const button = getByLabelText('Start oefenen, tik om te beginnen met de ademhalingsoefening');
            fireEvent.press(button);

            expect(router.push).toHaveBeenCalledWith('/practice');
            expect(router.push).toHaveBeenCalledTimes(1);
        });
    });

    describe('Accessibility', () => {
        it('should have descriptive accessibility label in Dutch', () => {
            const { getByLabelText } = render(<HomeScreen />, { wrapper });

            const button = getByLabelText(
                'Start oefenen, tik om te beginnen met de ademhalingsoefening'
            );
            expect(button).toBeTruthy();
        });
    });
});
