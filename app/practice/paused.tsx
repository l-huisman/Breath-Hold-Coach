// filepath: /Users/lh/Documents/School/HBO/HBO 2526/Minor App Design & Development/Frontend Development/Breath-Hold-Coach/app/practice/paused.tsx
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/button';
import { Icon } from '@/components/icon';
import { Colors, Fonts } from '@/constants/theme';
import { usePracticeSession } from '@/contexts/practice-session-context';

/**
 * Paused state screen - full-screen overlay.
 * No navigation chrome (handled by layout based on route).
 * Allows user to resume or stop the exercise.
 */
export default function PracticePausedScreen() {
    const { session, resumeExercise, abandonSession } = usePracticeSession();

    const handleResume = () => {
        resumeExercise();
        // Use back() to return naturally to exercise screen
        router.back();
    };

    const handleStop = () => {
        abandonSession();
        // Use replace to prevent back navigation
        router.replace('/practice/finish' as any);
    };

    // Format best breath hold for display
    const formattedBestHold = session.breathHoldDuration > 0
        ? `${session.breathHoldDuration}s`
        : '0s';

    return (
        <ThemedView style={styles.container}>
            {/* Spacer */}
            <View style={styles.spacer} />

            {/* Pause Icon */}
            <View style={styles.iconContainer}>
                <Icon
                    name="pause.fill"
                    size={80}
                    color={Colors.light.textContrast}
                />
            </View>

            {/* Status Text */}
            <ThemedText
                style={styles.statusText}
                accessibilityRole="header"
                accessibilityLabel="Oefening gepauzeerd"
            >
                Oefening gepauzeerd
            </ThemedText>

            {/* Timer Display - Show best hold */}
            <ThemedText
                style={styles.timerText}
                accessibilityLabel={`Beste ademhouding: ${formattedBestHold}`}
                accessibilityLiveRegion="polite"
            >
                {formattedBestHold}
            </ThemedText>

            {/* Info Text */}
            <ThemedText style={styles.infoText}>
                Neem de tijd die je nodig hebt
            </ThemedText>

            {/* Spacer */}
            <View style={styles.spacer} />

            {/* Action Buttons */}
            <View style={styles.buttonContainer}>
                <Button
                    onPress={handleResume}
                    accessibilityLabel="Hervat oefening"
                    accessibilityHint="Tik om de oefening te hervatten"
                >
                    Hervat
                </Button>
                <Button
                    onPress={handleStop}
                    accessibilityLabel="Stop oefening"
                    accessibilityHint="Tik om de oefening te stoppen"
                    style={styles.stopButton}
                >
                    Stop oefening
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
    iconContainer: {
        marginBottom: 24,
    },
    statusText: {
        fontSize: 24,
        fontFamily: Fonts.bold,
        color: Colors.light.textContrast,
        textAlign: 'center',
        marginBottom: 16,
    },
    timerText: {
        fontSize: 56,
        fontFamily: Fonts.bold,
        color: Colors.light.textContrast,
        textAlign: 'center',
        marginBottom: 8,
    },
    infoText: {
        fontSize: 16,
        fontFamily: Fonts.regular,
        color: Colors.light.textContrast,
        textAlign: 'center',
        lineHeight: 24,
    },
    buttonContainer: {
        width: '100%',
        gap: 12,
        paddingBottom: 40,
    },
    stopButton: {
        backgroundColor: Colors.light.textContrast,
        borderWidth: 2,
        borderColor: Colors.light.textContrast,
    },
});
