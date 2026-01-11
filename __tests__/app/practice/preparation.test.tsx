import React from 'react';
import {act, render, waitFor} from '@testing-library/react-native';
import PracticePreparationScreen from '@/app/practice/preparation';
import {usePracticeSession} from '@/contexts/practice-session-context';
import {useAudio} from '@/contexts/audio-context';

// Mock expo-audio
jest.mock('expo-audio', () => ({
    createAudioPlayer: jest.fn(),
    setAudioModeAsync: jest.fn(),
}));

// Mock expo-haptics
jest.mock('expo-haptics', () => ({
    ImpactFeedbackStyle: {
        Light: 'light',
        Medium: 'medium',
        Heavy: 'heavy',
    },
    NotificationFeedbackType: {
        Success: 'success',
        Warning: 'warning',
        Error: 'error',
    },
    impactAsync: jest.fn(() => Promise.resolve()),
    notificationAsync: jest.fn(() => Promise.resolve()),
}));

// Mock audio constants to avoid requiring MP3 files
jest.mock('@/constants/audio', () => ({
    AUDIO_SEQUENCES: {
        breathingPreparation: [
            'breathing-prep-phase-1',
            'breathing-prep-phase-2',
            'breathing-prep-phase-3',
        ],
    },
    playDebugPing: jest.fn(() => Promise.resolve()),
}));

// Mock navigation
jest.mock('expo-router', () => ({
    router: {
        replace: jest.fn(),
        push: jest.fn(),
    },
}));

// Mock contexts
jest.mock('@/contexts/practice-session-context');
jest.mock('@/contexts/audio-context');

// Mock useHaptics hook
jest.mock('@/hooks/useHaptics', () => ({
    useHaptics: jest.fn(() => ({
        phaseTransition: jest.fn(() => Promise.resolve()),
        inhale: jest.fn(() => Promise.resolve()),
        exhale: jest.fn(() => Promise.resolve()),
        holdStart: jest.fn(() => Promise.resolve()),
        tick: jest.fn(() => Promise.resolve()),
        complete: jest.fn(() => Promise.resolve()),
        isEnabled: true,
        setEnabled: jest.fn(),
    })),
}));

// Mock BreathingCircle component
jest.mock('@/components/breathing-circle', () => ({
    BreathingCircle: () => null,
}));

// Mock react-native-reanimated
jest.mock('react-native-reanimated', () => {
    const View = require('react-native').View;

    // Create a mock Animated object
    const Animated = {
        View,
        Text: View,
        ScrollView: View,
    };

    return {
        __esModule: true,
        default: Animated,
        useSharedValue: jest.fn(() => ({value: 0.33})),
        useAnimatedStyle: jest.fn(() => ({})),
        withTiming: jest.fn((value) => value),
        Easing: {
            inOut: jest.fn((fn) => fn),
            ease: jest.fn(),
        },
        FadeIn: {duration: jest.fn(() => ({}))},
        FadeOut: {duration: jest.fn(() => ({}))},
    };
});

// Mock SafeAreaView
jest.mock('react-native-safe-area-context', () => ({
    SafeAreaView: require('react-native').View,
}));

describe('PracticePreparationScreen', () => {
    const mockStartExercise = jest.fn();
    const mockPauseExercise = jest.fn();
    const mockPlaySequence = jest.fn();
    const mockStop = jest.fn();
    const mockReplace = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();

        // Get the mocked router
        const {router} = require('expo-router');
        router.replace = mockReplace;

        (usePracticeSession as jest.Mock).mockReturnValue({
            startExercise: mockStartExercise,
            pauseExercise: mockPauseExercise,
        });

        (useAudio as jest.Mock).mockReturnValue({
            playSequence: mockPlaySequence.mockResolvedValue(undefined),
            stop: mockStop,
            currentAudioId: null,
        });
    });

    describe('initialization', () => {
        it('should auto-play breathing preparation sequence on mount', async () => {
            render(<PracticePreparationScreen/>);

            await waitFor(() => {
                expect(mockPlaySequence).toHaveBeenCalledWith([
                    'breathing-prep-phase-1',
                    'breathing-prep-phase-2',
                    'breathing-prep-phase-3',
                ]);
            });
        });

        it('should display inhale instruction initially', () => {
            const {getByLabelText} = render(<PracticePreparationScreen/>);

            expect(getByLabelText('Adem in')).toBeTruthy();
        });
    });

    describe('phase progression', () => {
        it('should alternate breathing phases within each phase', async () => {
            jest.useFakeTimers();
            const {getByLabelText} = render(<PracticePreparationScreen/>);

            // Start with inhale
            expect(getByLabelText('Adem in')).toBeTruthy();

            // After 3.5 seconds, should show exhale
            await act(async () => {
                jest.advanceTimersByTime(3500);
            });

            expect(getByLabelText('Adem uit')).toBeTruthy();

            jest.useRealTimers();
        });
    });

    describe('completion', () => {
        it('should call startExercise and navigate after complete sequence', async () => {
            jest.useFakeTimers();
            render(<PracticePreparationScreen/>);

            // Total duration: 18.5 seconds
            // Phase 0: 7s, Phase 1: 7s, Phase 2: 4.5s (3.5s inhale + 1s hold)
            await act(async () => {
                jest.advanceTimersByTime(18500);
            });

            expect(mockStartExercise).toHaveBeenCalled();
            expect(mockReplace).toHaveBeenCalledWith('/practice/exercise');

            jest.useRealTimers();
        });

        it('should show hold phase on phase 2 after inhale', async () => {
            jest.useFakeTimers();
            const {getByLabelText} = render(<PracticePreparationScreen/>);

            // Advance to phase 2 (14s) + inhale duration (3.5s)
            await act(async () => {
                jest.advanceTimersByTime(17500);
            });

            expect(getByLabelText('Houd vast')).toBeTruthy();

            jest.useRealTimers();
        });
    });

    describe('error handling', () => {
        it('should show manual control button when audio fails', async () => {
            mockPlaySequence.mockRejectedValue(new Error('Audio failed'));

            const {findByLabelText} = render(<PracticePreparationScreen/>);

            // Use accessibility label to find button - error state is indicated by button presence
            const button = await findByLabelText('Volgende fase');
            expect(button).toBeTruthy();
        });
    });

    describe('accessibility', () => {
        it('should have accessible breathing instruction text', () => {
            const {getByLabelText} = render(<PracticePreparationScreen/>);

            // Verify instruction text is accessible by label
            expect(getByLabelText('Adem in')).toBeTruthy();
        });
    });

    describe('cleanup', () => {
        it('should stop audio on unmount', () => {
            const {unmount} = render(<PracticePreparationScreen/>);

            unmount();

            expect(mockStop).toHaveBeenCalled();
        });
    });
});
