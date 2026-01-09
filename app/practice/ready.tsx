/**
 * Ready confirmation screen before starting the exercise.
 * Matches Figma design with wave circles background.
 * Tap anywhere on screen to proceed to breathing preparation.
 */

import React, {useEffect} from 'react';
import {Pressable, StyleSheet, View} from 'react-native';
import {router} from 'expo-router';
import {ThemedText} from '@/components/themed-text';
import {BreathingCircle} from '@/components/breathing-circle';
import {Colors, Fonts} from '@/constants/theme';
import {usePracticeSession} from '@/contexts/practice-session-context';
import {playDebugPing} from '@/constants/audio';

export default function PracticeReadyScreen() {
    const {setReady} = usePracticeSession();

    // Transition to ready state on mount
    useEffect(() => {
        setReady();
    }, [setReady]);

    const handleStart = () => {
        playDebugPing(); // DEBUG: Ready→Preparation transition
        // Navigate to breathing preparation
        router.replace('/practice/preparation' as any);
    };

    return (
        <Pressable
            style={styles.container}
            onPress={handleStart}
            accessibilityRole="button"
            accessibilityLabel="Klaar om te beginnen"
            accessibilityHint="Tik ergens op het scherm om de oefening te starten"
        >
            {/* Top spacer - pushes content to vertical center */}
            <View style={styles.spacer}/>

            {/* Center content area - circles and text layered together */}
            <View style={styles.centerContent}>
                {/* Wave circles background - static (not animated) */}
                <BreathingCircle phase="hold"/>

                {/* Red accent circle - overlaid on wave circles */}
                <View style={styles.accentCircle}/>

                {/* "Klaar?" text - centered inside the circles */}
                <ThemedText
                    style={styles.readyText}
                    accessibilityRole="header"
                >
                    Klaar?
                </ThemedText>
            </View>

            {/* Bottom spacer - balances top spacer */}
            <View style={styles.spacer}/>

            {/* Bottom instruction */}
            <View style={styles.bottomContainer}>
                <ThemedText style={styles.bottomText}>
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
    readyText: {
        position: 'absolute',
        fontSize: Fonts.title2,
        fontFamily: Fonts.semiBold,
        color: Colors.light.text,
        textAlign: 'center',
    },
    bottomContainer: {
        paddingBottom: 32,
    },
    bottomText: {
        fontSize: Fonts.body,
        fontFamily: Fonts.semiBold,
        color: Colors.light.text,
        textAlign: 'center',
    },
});
