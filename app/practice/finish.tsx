// filepath: /Users/lh/Documents/School/HBO/HBO 2526/Minor App Design & Development/Frontend Development/Breath-Hold-Coach/app/practice/finish.tsx
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/button';
import { Icon } from '@/components/icon';
import { Colors, Fonts } from '@/constants/theme';
import { usePracticeSession } from '@/contexts/practice-session-context';

/**
 * Completion screen with summary after finishing exercise.
 * Shows placeholder stats that will be populated by timer logic in issue #44.
 * Statistics persistence will be added in issue #52.
 */
export default function PracticeFinishScreen() {
    const { session, resetSession } = usePracticeSession();

    const handleFinish = () => {
        resetSession();
        // Replace to clear practice stack and return to home
        router.replace('/(tabs)');
    };

    // Format breath hold duration for display
    const formattedDuration = session.breathHoldDuration > 0
        ? `${session.breathHoldDuration} seconden`
        : 'Geen ademhouding gemeten';

    return (
        <SafeAreaView style={styles.safeArea} edges={['top']}>
            <ThemedView style={styles.container}>
                {/* Spacer */}
                <View style={styles.spacer} />

                {/* Success Icon */}
                <View style={styles.iconContainer}>
                    <Icon
                        name="star.fill"
                        size={80}
                        color={Colors.light.accent}
                    />
                </View>

                {/* Success Message */}
                <ThemedText
                    style={styles.header}
                    accessibilityRole="header"
                >
                    Goed gedaan!
                </ThemedText>

                {/* Summary Stats */}
                <View style={styles.statsContainer}>
                    <ThemedText style={styles.statLabel}>
                        Je hebt volgehouden:
                    </ThemedText>
                    <ThemedText style={styles.statValue}>
                        {formattedDuration}
                    </ThemedText>
                </View>

                {/* Encouragement Text */}
                <ThemedText style={styles.encouragementText}>
                    Elke oefening brengt je dichter bij je doel van 45 seconden
                </ThemedText>

                {/* Spacer */}
                <View style={styles.spacer} />

                {/* Home Button */}
                <Button
                    onPress={handleFinish}
                    accessibilityLabel="Naar Home"
                    accessibilityHint="Tik om terug te gaan naar het startscherm"
                >
                    Naar Home
                </Button>
            </ThemedView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
    },
    container: {
        flex: 1,
        padding: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    spacer: {
        flex: 1,
    },
    iconContainer: {
        marginBottom: 24,
    },
    header: {
        fontSize: 32,
        fontFamily: Fonts.bold,
        color: Colors.light.text,
        textAlign: 'center',
        marginBottom: 32,
    },
    statsContainer: {
        alignItems: 'center',
        gap: 8,
        marginBottom: 24,
    },
    statLabel: {
        fontSize: 16,
        fontFamily: Fonts.regular,
        color: Colors.light.textMuted,
        textAlign: 'center',
    },
    statValue: {
        fontSize: 48,
        fontFamily: Fonts.bold,
        color: Colors.light.primary,
        textAlign: 'center',
    },
    encouragementText: {
        fontSize: 16,
        fontFamily: Fonts.regular,
        color: Colors.light.textMuted,
        textAlign: 'center',
        lineHeight: 24,
        paddingHorizontal: 20,
    },
});
