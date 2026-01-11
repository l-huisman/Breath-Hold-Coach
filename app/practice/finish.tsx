/**
 * Practice Finish Screen
 * Completion screen shown after successfully finishing the breathing exercise.
 *
 * Design: Matches exercise.tsx and preparation.tsx pattern
 * - Light cyan background with breathing circle
 * - Red accent circle overlay
 * - Center content showing duration and success
 * - Bottom instruction text
 * - Tap anywhere to return home
 */

import React, { useEffect, useRef } from 'react';
import { StyleSheet, View, Pressable } from 'react-native';
import { router } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { BreathingCircle } from '@/components/breathing-circle';
import { Colors, Fonts } from '@/constants/theme';
import { usePracticeSession } from '@/contexts/practice-session-context';
import { useUser } from '@/contexts/user-context';
import { saveSession, NewExerciseSession } from '@/services/statistics-service';

export default function PracticeFinishScreen() {
    const { session, resetSession } = usePracticeSession();
    const { settings, progress, updateProgress } = useUser();
    const hasSaved = useRef(false);

    // Check if this is a new personal best
    const isNewBest = session.breathHoldDuration > progress.currentBreathHold;

    // Save session and update progress on mount
    useEffect(() => {
        const saveSessionData = async () => {
            if (hasSaved.current) return; // Prevent double-save
            hasSaved.current = true;

            try {
                // Prepare session data
                const sessionData: NewExerciseSession = {
                    date: new Date().toISOString().split('T')[0], // YYYY-MM-DD
                    startTime: session.sessionStartTime?.toISOString() || new Date().toISOString(),
                    endTime: session.sessionEndTime?.toISOString() || new Date().toISOString(),
                    breathHoldDuration: session.breathHoldDuration,
                    targetDuration: settings.breathHoldGoal,
                    wasCompleted: session.wasCompleted,
                    wasSkipped: session.instructionsSkipped,
                };

                // Save to statistics
                await saveSession(sessionData);

                // Update user progress if new best
                if (isNewBest) {
                    const today = new Date().toISOString().split('T')[0];

                    await updateProgress({
                        currentBreathHold: session.breathHoldDuration,
                        completedExercises: progress.completedExercises + 1,
                        lastPracticeDate: today,
                    });
                }
            } catch (error) {
                // Log error but don't block UI
                console.error('Failed to save session:', error);
            }
        };

        saveSessionData();
    }, [
        session.breathHoldDuration,
        session.sessionStartTime,
        session.sessionEndTime,
        session.wasCompleted,
        session.instructionsSkipped,
        settings.breathHoldGoal,
        isNewBest,
        progress.completedExercises,
        updateProgress,
    ]);

    const handleTapToContinue = () => {
        resetSession();
        // Replace to clear practice stack and return to home
        router.replace('/(tabs)');
    };

    // Format breath hold duration for display
    const formattedDuration = session.breathHoldDuration > 0
        ? `${session.breathHoldDuration}s`
        : '0s';

    return (
        <Pressable
            style={styles.container}
            onPress={handleTapToContinue}
            accessibilityRole="button"
            accessibilityLabel="Voltooiingsscherm"
            accessibilityHint="Tik ergens om terug te gaan naar home"
        >
            {/* Top spacer - pushes content to vertical center */}
            <View style={styles.spacer} />

            {/* Center content area - circles and content layered together */}
            <View style={styles.centerContent}>
                {/* Breathing Circle - idle/hold state for completion */}
                <BreathingCircle phase="hold" />

                {/* Accent circle - overlaid on wave circles */}
                <View style={styles.accentCircle} />

                {/* Text content wrapper - centered as a unit */}
                <View style={styles.textWrapper}>
                    {/* Duration Display */}
                    <ThemedText
                        style={styles.durationText}
                        accessibilityLabel={`Je hebt ${session.breathHoldDuration} seconden volgehouden`}
                        accessibilityLiveRegion="polite"
                    >
                        {formattedDuration}
                    </ThemedText>

                    {/* New Best Badge - Conditionally rendered */}
                    {isNewBest && (
                        <ThemedText style={styles.newBestBadge}>
                            Nieuw record!
                        </ThemedText>
                    )}
                </View>
            </View>

            {/* Bottom spacer - balances top spacer */}
            <View style={styles.spacer} />

            {/* Bottom instruction text */}
            <View style={styles.bottomContainer}>
                <ThemedText
                    style={styles.bottomInstructionText}
                    accessibilityLabel="Tik ergens op het scherm om door te gaan"
                >
                    Tik ergens op het scherm om door te gaan
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
    textWrapper: {
        position: 'absolute',
        alignItems: 'center',
        justifyContent: 'center',
    },
    durationText: {
        fontSize: Fonts.title1,
        fontFamily: Fonts.bold,
        color: Colors.light.text,
        textAlign: 'center',
        lineHeight: 32,
    },
    newBestBadge: {
        fontSize: Fonts.body,
        fontFamily: Fonts.semiBold,
        color: Colors.light.accent,
        textAlign: 'center',
        marginTop: 8,
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
