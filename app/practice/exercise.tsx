// filepath: /Users/lh/Documents/School/HBO/HBO 2526/Minor App Design & Development/Frontend Development/Breath-Hold-Coach/app/practice/exercise.tsx
import React, { useState, useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/button';
import { Colors, Fonts } from '@/constants/theme';
import { usePracticeSession } from '@/contexts/practice-session-context';
import { useAudio } from '@/contexts/audio-context';
import { AUDIO_SEQUENCES } from '@/constants/audio';

/**
 * Main exercise screen - full-screen immersive experience.
 * No navigation chrome (handled by layout based on route).
 * Breathing animation will be added in issue #45.
 * Audio cues implemented in issue #45.
 */
export default function PracticeExerciseScreen() {
    const { session, getCurrentBreathHoldDuration, startBreathHold, pauseExercise, finishExercise } = usePracticeSession();
    const { playSequence, stop } = useAudio();
    const [displayTime, setDisplayTime] = useState(0);

    // Timer for UI updates - runs when holding breath
    useEffect(() => {
        if (session.exercisePhase !== 'hold') {
            setDisplayTime(0);
            return;
        }

        const interval = setInterval(() => {
            setDisplayTime(getCurrentBreathHoldDuration());
        }, 100); // Update every 100ms for smooth display

        return () => clearInterval(interval);
    }, [session.exercisePhase, getCurrentBreathHoldDuration]);

    // Auto-start breath hold when exercise begins
    useEffect(() => {
        if (session.currentState === 'exercise' && session.exercisePhase === 'inhale') {
            // Give user a moment, then start breath hold
            const timer = setTimeout(() => {
                startBreathHold();
            }, 1000);

            return () => clearTimeout(timer);
        }
    }, [session.currentState, session.exercisePhase, startBreathHold]);

    // Play audio cues based on exercise phase transitions
    useEffect(() => {
        if (session.currentState !== 'exercise') {
            return;
        }

        if (session.exercisePhase === 'inhale' && session.breathingCyclesCompleted < 3) {
            // First 3 cycles: practice breathing pattern
            playSequence(AUDIO_SEQUENCES.breathCycle);
        } else if (session.exercisePhase === 'inhale' && session.breathingCyclesCompleted === 3) {
            // Final cycle: prepare for hold
            playSequence(AUDIO_SEQUENCES.finalInhale);
        } else if (session.exercisePhase === 'hold') {
            // Start holding breath
            playSequence(AUDIO_SEQUENCES.startHold);
        }
    }, [session.exercisePhase, session.currentState, session.breathingCyclesCompleted, playSequence]);

    const handlePause = () => {
        stop(); // Stop audio when pausing
        pauseExercise();
        router.push('/practice/paused' as any);
    };

    const handleStop = () => {
        stop(); // Stop audio when stopping exercise
        finishExercise();
        // Use replace to prevent back navigation
        router.replace('/practice/finish' as any);
    };

    // Format time for display (M:SS)
    const formattedTime = `${Math.floor(displayTime / 60)}:${String(displayTime % 60).padStart(2, '0')}`;

    // Get instruction based on phase
    const getInstruction = () => {
        switch (session.exercisePhase) {
            case 'inhale':
                return 'Adem diep in...';
            case 'hold':
                return 'Houd vast!';
            case 'exhale':
                return 'Adem uit...';
            default:
                return 'Bereid je voor...';
        }
    };

    return (
        <ThemedView style={styles.container}>
            {/* Spacer */}
            <View style={styles.spacer} />

            {/* Status Text */}
            <ThemedText
                style={styles.statusText}
                accessibilityRole="header"
                accessibilityLabel="Oefening is actief"
            >
                Oefening actief
            </ThemedText>

            {/* Timer Display */}
            <ThemedText
                style={styles.timerText}
                accessibilityLabel={`Timer: ${formattedTime}`}
                accessibilityLiveRegion="polite"
            >
                {formattedTime}
            </ThemedText>

            {/* Breathing Instruction */}
            <ThemedText style={styles.instructionText}>
                {getInstruction()}
            </ThemedText>

            {/* Spacer */}
            <View style={styles.spacer} />

            {/* Action Buttons */}
            <View style={styles.buttonContainer}>
                <Button
                    onPress={handlePause}
                    accessibilityLabel="Pauzeer oefening"
                    accessibilityHint="Tik om de oefening te pauzeren"
                    style={styles.actionButton}
                >
                    Pauzeer
                </Button>
                <Button
                    onPress={handleStop}
                    accessibilityLabel="Stop oefening"
                    accessibilityHint="Tik om de oefening te stoppen"
                    style={styles.actionButton}
                >
                    Stop
                </Button>
            </View>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: Colors.light.primary,
    },
    spacer: {
        flex: 1,
    },
    statusText: {
        fontSize: 20,
        fontFamily: Fonts.medium,
        color: Colors.light.textContrast,
        textAlign: 'center',
        marginBottom: 24,
    },
    timerText: {
        fontSize: 72,
        fontFamily: Fonts.bold,
        color: Colors.light.textContrast,
        textAlign: 'center',
        marginBottom: 16,
    },
    instructionText: {
        fontSize: 18,
        fontFamily: Fonts.regular,
        color: Colors.light.textContrast,
        textAlign: 'center',
        lineHeight: 28,
    },
    buttonContainer: {
        width: '100%',
        gap: 12,
        paddingBottom: 40,
    },
    actionButton: {
        backgroundColor: Colors.light.textContrast,
        borderWidth: 2,
        borderColor: Colors.light.textContrast,
    },
});
