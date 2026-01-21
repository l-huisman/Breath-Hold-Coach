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

import React, {useCallback, useEffect, useRef, useState} from 'react';
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
import {playDebugPing} from '@/constants/audio';
import {AudioId} from '@/types/audio';
import {useHaptics} from '@/hooks/useHaptics';

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
    const {play, stop} = useAudio();
    const haptics = useHaptics();

    // Store functions in refs to avoid effect restarts when their identity changes
    // This is critical because finishExercise depends on session state and gets new refs
    const playRef = useRef(play);
    const startBreathHoldRef = useRef(startBreathHold);
    const endBreathHoldRef = useRef(endBreathHold);
    const finishExerciseRef = useRef(finishExercise);
    const setExercisePhaseRef = useRef(setExercisePhase);
    const stopRef = useRef(stop);
    const hapticsRef = useRef(haptics);

    useEffect(() => {
        playRef.current = play;
        startBreathHoldRef.current = startBreathHold;
        endBreathHoldRef.current = endBreathHold;
        finishExerciseRef.current = finishExercise;
        setExercisePhaseRef.current = setExercisePhase;
        stopRef.current = stop;
        hapticsRef.current = haptics;
    }, [play, startBreathHold, endBreathHold, finishExercise, setExercisePhase, stop, haptics]);

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

    // Countdown tick haptics every 10 seconds during hold phase
    useEffect(() => {
        if (currentPhase !== 'hold') {
            return;
        }

        // Trigger tick haptic every 10 seconds (10000ms)
        const interval = setInterval(() => {
            haptics.tick(); // Haptic: Subtle progress indicator
        }, 10000);

        return () => clearInterval(interval);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentPhase]);

    // Milestone audio announcements during hold phase
    useEffect(() => {
        if (currentPhase !== 'hold') return;

        const milestoneTimers: number[] = [];
        const milestones: { time: number; audioId: AudioId }[] = [
            { time: 10000, audioId: 'milestone-10s' },
            { time: 20000, audioId: 'milestone-20s' },
            { time: 30000, audioId: 'milestone-30s' },
        ];

        milestones.forEach(({ time, audioId }) => {
            milestoneTimers.push(
                window.setTimeout(() => {
                    playRef.current(audioId).catch(err => console.error(`Milestone audio failed (${audioId}):`, err));
                }, time)
            );
        });

        return () => milestoneTimers.forEach(clearTimeout);
    }, [currentPhase]);

    // Main exercise state machine - runs ONCE on mount
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
            setExercisePhaseRef.current('hold');

            // Start breath hold tracking in context
            startBreathHoldRef.current();
            playDebugPing(); // DEBUG: Exercise start (hold begins)
            // Play breath-hold-starts announcement
            playRef.current('breath-hold-starts').catch(err => console.error('Audio failed:', err));
            // Note: holdStart haptic already fired in preparation.tsx when entering hold phase

            // === PHASE: complete (auto after 40s) ===
            timers.push(
                window.setTimeout(() => {
                    playDebugPing(); // DEBUG: Exercise→Finish transition (40s auto)
                    // End breath hold (calculates duration)
                    endBreathHoldRef.current();

                    // Transition to complete
                    setCurrentPhase('complete');

                    // Haptic: Success feedback for completion
                    hapticsRef.current.complete();

                    // Play 40 second milestone announcement
                    playRef.current('milestone-40s').catch(err => console.error('Milestone audio failed (40s):', err));

                    // Finish exercise and navigate after audio delay (1700ms to let audio finish)
                    finishExerciseRef.current();
                    timers.push(
                        window.setTimeout(() => {
                            router.replace('/practice/finish' as any);
                        }, 1700)
                    );
                }, EXERCISE_TIMING.MAX_HOLD_DURATION)
            );
        };

        runExercise();

        // Cleanup: Clear all timers on unmount
        return () => {
            timers.forEach((timer) => clearTimeout(timer));
            stopRef.current(); // Stop audio
        };
        // Empty dependency array - this effect should only run once on mount
        // All functions are accessed via refs to avoid restarts
    }, []);

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
                    {(currentPhase === 'hold' || currentPhase === 'complete') ? (
                        // Show timer during hold and complete phases
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
        borderRadius: 100,
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
