// filepath: /Users/lh/Documents/School/HBO/HBO 2526/Minor App Design & Development/Frontend Development/Breath-Hold-Coach/app/practice/paused.tsx
import React, { useMemo } from 'react';
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
 * Shows current hold duration and allows restart or return home.
 */
export default function PracticePausedScreen() {
    const { session, resetSession } = usePracticeSession();

    // Calculate current hold duration when paused (frozen snapshot)
    const currentHoldDuration = useMemo(() => {
        // Calculate how long they've held breath in this attempt
        if (session.breathHoldStartTime) {
            const pauseTime = new Date();
            const durationInSeconds = Math.floor(
                (pauseTime.getTime() - session.breathHoldStartTime.getTime()) / 1000
            );
            return durationInSeconds;
        }
        return 0;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Empty deps = freeze at pause moment

    // Format for display
    const formattedDuration = currentHoldDuration > 0
        ? `${currentHoldDuration} seconden`
        : '0 seconden';

    const handleRestart = () => {
        resetSession();
        // Navigate to preparation screen to restart breathing cycle
        router.replace('/practice/preparation');
    };

    const handleHome = () => {
        resetSession();
        // Navigate directly to home tab, clear practice stack
        router.replace('/(tabs)');
    };

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

            {/* Current Hold Duration - large, centered */}
            <ThemedText
                style={styles.holdDurationText}
                accessibilityLabel={`Je hebt ${formattedDuration} volgehouden`}
                accessibilityLiveRegion="polite"
            >
                {formattedDuration}
            </ThemedText>

            {/* Label for duration */}
            <ThemedText style={styles.holdDurationLabel}>
                vastgehouden
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
                    onPress={handleRestart}
                    accessibilityLabel="Opnieuw beginnen"
                    accessibilityHint="Tik om de oefening opnieuw te starten vanaf de voorbereiding"
                >
                    Opnieuw beginnen
                </Button>
                <Button
                    onPress={handleHome}
                    accessibilityLabel="Terug naar Home"
                    accessibilityHint="Tik om terug te gaan naar het startscherm"
                >
                    Terug naar Home
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
    holdDurationText: {
        fontSize: 56,
        fontFamily: Fonts.bold,
        color: Colors.light.textContrast,
        textAlign: 'center',
        marginBottom: 8,
    },
    holdDurationLabel: {
        fontSize: 16,
        fontFamily: Fonts.regular,
        color: Colors.light.textContrast,
        textAlign: 'center',
        opacity: 0.9,
        marginBottom: 24,
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
});
