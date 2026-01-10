/**
 * Practice Exercise Screen
 * Core breathing exercise - the actual medical DIBH (Deep Inspiration Breath Hold) phase.
 *
 * Flow:
 * - User has already completed breathing preparation in preparation.tsx
 * - This screen handles the hold phase (40s max) with timer and progress tracking
 * - On completion, navigates to finish screen
 *
 * Design: Light cyan background with pause icon and progress ring in center
 * Duration: Up to 40 seconds (customizable per user's goal)
 */

import React, {useCallback, useEffect, useState} from 'react';
import {Pressable, StyleSheet, View} from 'react-native';
import {router} from 'expo-router';
import {useKeepAwake} from 'expo-keep-awake';
import Svg, {Circle} from 'react-native-svg';
import {ThemedText} from '@/components/themed-text';
import {BreathingCircle} from '@/components/breathing-circle';
import {Icon} from '@/components/icon';
import {Colors, Fonts} from '@/constants/theme';
import {usePracticeSession} from '@/contexts/practice-session-context';
import {useAudio} from '@/contexts/audio-context';
import {AUDIO_SEQUENCES, playDebugPing} from '@/constants/audio';

// Exercise phase types
type ExercisePhaseType =
    | 'inhale_exhale_1' // First breathing cycle (6s)
    | 'inhale_exhale_2' // Second breathing cycle (6s)
    | 'final_inhale' // Final deep inhale (4s)
    | 'hold' // Breath hold (up to 40s)
    | 'complete'; // Exercise finished

type BreathingPhase = 'inhale' | 'exhale' | 'hold';

// Medical protocol timing constants (milliseconds)
const EXERCISE_TIMING = {
    MAX_HOLD_DURATION: 40000, // 40 seconds
} as const;

export default function PracticeExerciseScreen() {
    // Keep screen awake during exercise
    useKeepAwake();

    const {
        getCurrentBreathHoldDuration,
        startBreathHold,
        endBreathHold,
        pauseExercise,
        finishExercise,
        setExercisePhase,
    } = usePracticeSession();
    const {playSequence, stop} = useAudio();

    // Local state for exercise phases
    const [currentPhase, setCurrentPhase] = useState<ExercisePhaseType>('hold');
    const [currentBreathingPhase, setCurrentBreathingPhase] = useState<BreathingPhase>('hold');
    const [phaseStartTime, setPhaseStartTime] = useState<Date>(new Date());
    const [progress, setProgress] = useState(0);
    const [holdTimer, setHoldTimer] = useState(0);

    // Calculate progress percentage based on elapsed time
    const calculateProgress = useCallback((): number => {
        if (!phaseStartTime || currentPhase !== 'hold') return 0;

        const elapsedInHold = Date.now() - phaseStartTime.getTime();
        return Math.min(100, (elapsedInHold / EXERCISE_TIMING.MAX_HOLD_DURATION) * 100);
    }, [currentPhase, phaseStartTime]);

    // Update progress bar every 100ms
    useEffect(() => {
        const interval = setInterval(() => {
            setProgress(calculateProgress());
        }, 100);

        return () => clearInterval(interval);
    }, [calculateProgress]);

    // Update hold timer display every 100ms during hold phase
    useEffect(() => {
        if (currentPhase !== 'hold') {
            setHoldTimer(0);
            return;
        }

        const interval = setInterval(() => {
            const duration = getCurrentBreathHoldDuration();
            setHoldTimer(duration);
        }, 100);

        return () => clearInterval(interval);
    }, [currentPhase, getCurrentBreathHoldDuration]);

    // Main exercise state machine - runs on mount
    // Note: Breathing preparation (inhale/exhale cycles) is handled in preparation.tsx
    // This phase starts directly with the hold phase (the actual medical exercise)
    useEffect(() => {
        const timers: number[] = [];

        const runExercise = () => {
            // === PHASE: hold (40s max) ===
            // This is the main medical exercise - breath hold with heart protection
            setCurrentPhase('hold');
            setCurrentBreathingPhase('hold');
            setPhaseStartTime(new Date());
            setExercisePhase('hold');

            // Start breath hold tracking in context
            startBreathHold();
            playDebugPing(); // DEBUG: Exercise start (hold begins)

            // === PHASE: complete (auto after 40s) ===
            timers.push(
                window.setTimeout(() => {
                    playDebugPing(); // DEBUG: Exercise→Finish transition (40s auto)
                    // End breath hold (calculates duration)
                    endBreathHold();

                    // Transition to complete
                    setCurrentPhase('complete');

                    // Finish exercise and navigate
                    finishExercise();
                    router.replace('/practice/finish' as any);
                }, EXERCISE_TIMING.MAX_HOLD_DURATION)
            );
        };

        runExercise();

        // Cleanup: Clear all timers on unmount
        return () => {
            timers.forEach((timer) => clearTimeout(timer));
            stop(); // Stop audio
        };
    }, [startBreathHold, endBreathHold, finishExercise, setExercisePhase, stop]);

    // Play audio cues based on phase transitions
    useEffect(() => {
        // Only play audio for the hold phase (the actual exercise)
        // Breathing prep audio is handled in preparation.tsx
        const audioSequences: Record<
            ExercisePhaseType,
            (typeof AUDIO_SEQUENCES)[keyof typeof AUDIO_SEQUENCES] | null
        > = {
            inhale_exhale_1: null, // Not used - breathing prep done in preparation.tsx
            inhale_exhale_2: null, // Not used - breathing prep done in preparation.tsx
            final_inhale: null, // Not used - breathing prep done in preparation.tsx
            hold: AUDIO_SEQUENCES.startHold,
            complete: null,
        };

        const sequence = audioSequences[currentPhase];
        if (sequence) {
            playSequence(sequence).catch((err) => {
                console.error('Audio playback failed:', err);
                // Continue exercise with visual cues only (graceful degradation)
            });
        }
    }, [currentPhase, playSequence]);

    // Handle tap to pause
    const handleTapToPause = () => {
        playDebugPing(); // DEBUG: Exercise→Pause transition (manual)
        // Stop audio
        stop();

        // Transition to paused state (keeps breathHoldStartTime intact)
        pauseExercise();

        // Navigate to paused screen
        router.push('/practice/paused' as any);
    };

    // Format hold timer for display (M:SS)
    const formattedHoldTime = `${Math.floor(holdTimer / 60)}:${String(holdTimer % 60).padStart(2, '0')}`;

    // Calculate circle circumference for progress ring (108 = radius of circle)
    const circleRadius = 108;
    const circleCircumference = 2 * Math.PI * circleRadius;
    const progressStrokeOffset = circleCircumference * (1 - progress / 100);

    return (
        <Pressable
            style={styles.container}
            onPress={handleTapToPause}
            accessibilityRole="button"
            accessibilityLabel="Oefening scherm"
            accessibilityHint="Tik ergens om te pauzeren"
        >
            {/* Top spacer - pushes content to vertical center */}
            <View style={styles.spacer}/>

            {/* Center content area - circles and text layered together */}
            <View style={styles.centerContent}>
                {/* Breathing Circle Animation */}
                <BreathingCircle phase={currentBreathingPhase}/>

                {/* Red accent circle - overlaid on wave circles */}
                <View style={styles.accentCircle}/>

                {/* Center Content: Pause icon or Timer */}
                <View style={styles.innerContent}>
                    {currentPhase === 'hold' ? (
                        // Show timer during hold phase
                        <ThemedText
                            style={styles.holdTimerText}
                            accessibilityLabel={`Ademhouding: ${formattedHoldTime}`}
                            accessibilityLiveRegion="polite"
                        >
                            {formattedHoldTime}
                        </ThemedText>
                    ) : (
                        // Show pause icon during breathing phases
                        <>
                            {/* Circular progress ring */}
                            <Svg
                                width={220}
                                height={220}
                                style={styles.progressRing}
                                accessibilityElementsHidden={true}
                            >
                                {/* Background circle */}
                                <Circle
                                    cx={110}
                                    cy={110}
                                    r={circleRadius}
                                    stroke="rgba(255, 255, 255, 0.3)"
                                    strokeWidth={4}
                                    fill="none"
                                />
                                {/* Progress circle */}
                                <Circle
                                    cx={110}
                                    cy={110}
                                    r={circleRadius}
                                    stroke={Colors.light.accent}
                                    strokeWidth={4}
                                    fill="none"
                                    strokeDasharray={circleCircumference}
                                    strokeDashoffset={progressStrokeOffset}
                                    strokeLinecap="round"
                                    transform={`rotate(-90 110 110)`}
                                />
                            </Svg>

                            {/* Pause icon */}
                            <View
                                style={styles.pauseIconContainer}
                                accessibilityElementsHidden={true}
                            >
                                <Icon
                                    name="pause.fill"
                                    size={48}
                                    color={Colors.light.text}
                                />
                            </View>
                        </>
                    )}
                </View>
            </View>

            {/* Bottom spacer - balances top spacer */}
            <View style={styles.spacer}/>

            {/* Bottom instruction text */}
            <View style={styles.bottomContainer}>
                <ThemedText
                    style={styles.bottomInstructionText}
                    accessibilityLabel="Tik ergens op het scherm om te pauzeren"
                >
                    Tik ergens op het scherm om te pauzeren
                </ThemedText>
            </View>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.light.secondary,
        alignItems: 'center',
    },
    spacer: {
        flex: 1,
    },
    centerContent: {
        position: 'relative',
        alignItems: 'center',
        justifyContent: 'center',
    },
    accentCircle: {
        position: 'absolute',
        width: 200,
        height: 200,
        borderRadius: 200 * 200 / 2,
        borderWidth: 4,
        borderColor: Colors.light.accent,
        backgroundColor: Colors.light.secondary,
    },
    innerContent: {
        position: 'absolute',
        justifyContent: 'center',
        alignItems: 'center',
    },
    progressRing: {
        position: 'absolute',
    },
    pauseIconContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: 'rgba(255, 255, 255, 0.5)',
    },
    holdTimerText: {
        fontSize: Fonts.title2,
        fontFamily: Fonts.bold,
        color: Colors.light.text,
        textAlign: 'center',
    },
    bottomContainer: {
        paddingBottom: 32,
    },
    bottomInstructionText: {
        fontSize: Fonts.body,
        fontFamily: Fonts.semiBold,
        color: Colors.light.text,
        textAlign: 'center',
    },
});
