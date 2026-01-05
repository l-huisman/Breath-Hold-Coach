// filepath: /Users/lh/Documents/School/HBO/HBO 2526/Minor App Design & Development/Frontend Development/Breath-Hold-Coach/app/practice/ready.tsx
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/button';
import { Icon } from '@/components/icon';
import { Colors, Fonts } from '@/constants/theme';

/**
 * Ready confirmation screen before starting the exercise.
 * Final check-in with user before transitioning to active exercise.
 *
 * TODO: Secondary button has white text on white background (accessibility issue).
 * The Button component needs variant support to fix this properly.
 * Consider adding variant prop to Button component or creating SecondaryButton component.
 */
export default function PracticeReadyScreen() {
    const handleNotReady = () => {
        router.back();
    };

    const handleStartExercise = () => {
        // Use replace to prevent back navigation from exercise
        router.replace('/practice/exercise' as any);
    };

    return (
        <SafeAreaView style={styles.safeArea} edges={['top']}>
            <ThemedView style={styles.container}>
                {/* Spacer */}
                <View style={styles.spacer} />

                {/* Icon */}
                <View style={styles.iconContainer}>
                    <Icon
                        name="checkmark"
                        size={80}
                        color={Colors.light.primary}
                    />
                </View>

                {/* Main Message */}
                <ThemedText
                    style={styles.header}
                    accessibilityRole="header"
                >
                    Ben je er klaar voor?
                </ThemedText>

                {/* Reminder Text */}
                <ThemedText style={styles.reminderText}>
                    Zoek een rustige plek en ga comfortabel zitten
                </ThemedText>

                {/* Spacer */}
                <View style={styles.spacer} />

                {/* Buttons */}
                <View style={styles.buttonContainer}>
                    <Button
                        onPress={handleNotReady}
                        accessibilityLabel="Nog niet klaar"
                        accessibilityHint="Tik om terug te gaan naar de voorbereiding"
                        style={styles.secondaryButton}
                    >
                        Nog niet
                    </Button>
                    <Button
                        onPress={handleStartExercise}
                        accessibilityLabel="Start oefening"
                        accessibilityHint="Tik om de ademhalingsoefening te starten"
                    >
                        Start oefening
                    </Button>
                </View>
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
        fontSize: 28,
        fontFamily: Fonts.bold,
        color: Colors.light.text,
        textAlign: 'center',
        marginBottom: 16,
    },
    reminderText: {
        fontSize: 16,
        fontFamily: Fonts.regular,
        color: Colors.light.textMuted,
        textAlign: 'center',
        lineHeight: 24,
    },
    buttonContainer: {
        width: '100%',
        gap: 12,
    },
    secondaryButton: {
        backgroundColor: Colors.light.background,
        borderWidth: 2,
        borderColor: Colors.light.primary,
    },
});
