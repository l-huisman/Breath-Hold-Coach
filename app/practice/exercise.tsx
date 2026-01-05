// filepath: /Users/lh/Documents/School/HBO/HBO 2526/Minor App Design & Development/Frontend Development/Breath-Hold-Coach/app/practice/exercise.tsx
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/button';
import { Colors, Fonts } from '@/constants/theme';

/**
 * Main exercise screen - full-screen immersive experience.
 * No navigation chrome (handled by layout based on route).
 * Timer logic will be added in issue #44.
 * Breathing animation will be added in issue #45.
 * Audio cues will be added in issue #46.
 */
export default function PracticeExerciseScreen() {
    const handlePause = () => {
        router.push('/practice/paused' as any);
    };

    const handleStop = () => {
        // Use replace to prevent back navigation
        router.replace('/practice/finish' as any);
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

            {/* Timer Display - Placeholder */}
            <ThemedText
                style={styles.timerText}
                accessibilityLabel="Timer"
                accessibilityLiveRegion="polite"
            >
                0:00
            </ThemedText>

            {/* Breathing Instruction - Placeholder */}
            <ThemedText style={styles.instructionText}>
                Adem diep in en houd vast
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
