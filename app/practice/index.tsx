import React, {useCallback, useEffect, useState} from 'react';
import {Pressable, StyleSheet, View} from 'react-native';
import {router} from 'expo-router';
import * as Haptics from 'expo-haptics';
import {ThemedText} from '@/components/themed-text';
import {ThemedView} from '@/components/themed-view';
import {Button} from '@/components/button';
import {Icon} from '@/components/icon';
import {InstructionStep} from '@/components/instruction-step';
import {Colors, Fonts} from '@/constants/theme';
import {usePracticeSession} from '@/contexts/practice-session-context';
import {useAudio} from '@/contexts/audio-context';
import {INSTRUCTION_STEPS} from '@/constants/instruction-steps';

/**
 * Pre-instructions wizard screen for practice module.
 * Guides users through 3 preparatory steps with voice guidance before exercise:
 * 1. Volume Check
 * 2. Mindfulness Reminder
 * 3. Laying Position
 *
 * Features:
 * - Auto-play voice guidance on each step
 * - Text-based progress indicator ("X van 3")
 * - Skip button to jump to ready screen
 * - Replay audio button for each step
 * - Optional link to Relax module (mindfulness step)
 * - Visual/haptic feedback when audio plays
 */
export default function PracticeIndexScreen() {
    const {
        session,
        nextInstruction,
        previousInstruction,
        skipInstructions,
        setReady,
        startSession
    } = usePracticeSession();
    const {play, replay} = useAudio();
    const [isPlayingAudio, setIsPlayingAudio] = useState(false);

    // Start session on mount
    useEffect(() => {
        startSession();
    }, [startSession]);

    // Auto-play audio when step changes
    useEffect(() => {
        let cancelled = false;

        const playStepAudio = async () => {
            const currentStep = INSTRUCTION_STEPS[session.currentInstructionIndex];

            // Only play if step exists and has audio
            if (currentStep?.audioId) {
                try {
                    if (!cancelled) {
                        setIsPlayingAudio(true);
                        // Haptic feedback when audio starts
                        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        await play(currentStep.audioId);
                        if (!cancelled) {
                            setIsPlayingAudio(false);
                        }
                    }
                } catch (error) {
                    console.error('Failed to play instruction audio:', error);
                    // Non-blocking error - user can still proceed
                    if (!cancelled) {
                        setIsPlayingAudio(false);
                    }
                }
            }
        };

        playStepAudio();

        // Cleanup: set cancelled flag to prevent state updates after unmount
        return () => {
            cancelled = true;
            setIsPlayingAudio(false);
            // Note: Don't call stop() here - causes infinite loop due to state updates
            // Audio cleanup is handled by AudioContext's own cleanup
        };
    }, [session.currentInstructionIndex, play]);

    // Get current step data
    const currentStep = INSTRUCTION_STEPS[session.currentInstructionIndex];
    const isLastStep = session.currentInstructionIndex === INSTRUCTION_STEPS.length - 1;
    const isFirstStep = session.currentInstructionIndex === 0;

    // Event handlers - defined before conditional return (hooks must be called in same order)
    const handleNext = useCallback(() => {
        if (isLastStep) {
            // Last step: transition to ready screen
            setReady();
            router.push('/practice/ready');
        } else {
            // Advance to next instruction
            nextInstruction();
        }
    }, [isLastStep, nextInstruction, setReady]);

    const handlePrevious = useCallback(() => {
        // Use context method to go to previous instruction
        previousInstruction();
    }, [previousInstruction]);

    const handleSkip = useCallback(() => {
        // Skip all remaining instructions and go to ready
        skipInstructions();
        router.push('/practice/ready');
    }, [skipInstructions]);

    const handleReplay = useCallback(async () => {
        try {
            setIsPlayingAudio(true);
            // Haptic feedback when audio starts
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            await replay();
            setIsPlayingAudio(false);
        } catch (error) {
            console.error('Failed to replay audio:', error);
            setIsPlayingAudio(false);
        }
    }, [replay]);

    // Don't render if no current step (will navigate away via useEffect above)
    if (!currentStep) {
        return null;
    }

    return (

        <ThemedView style={styles.container}>
            {/* Header Section */}
            <View style={styles.header}>
                <ThemedText style={styles.headerTitle}>Voorinstructies</ThemedText>
                <ThemedText style={styles.headerSubtitle}>
                    {session.currentInstructionIndex + 1} van {INSTRUCTION_STEPS.length}
                </ThemedText>
            </View>

            {/* Skip Button - Top Right */}
            <Pressable
                style={({pressed}) => [
                    styles.skipButton,
                    pressed && styles.skipButtonPressed,
                ]}
                onPress={handleSkip}
                accessibilityRole="button"
                accessibilityLabel="Overslaan"
                accessibilityHint="Tik om alle instructies over te slaan"
                hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
            >
                <ThemedText style={styles.skipText}>Overslaan</ThemedText>
                <Icon name="arrow.right" size={20} color={Colors.light.text}/>
            </Pressable>

            {/* Spacer - Push content to center */}
            <View style={styles.spacer}/>

            {/* Instruction Content - Centered */}
            <View style={styles.contentContainer}>
                <InstructionStep
                    description={currentStep.description}
                    icon={<Icon name={currentStep.icon} size={192} color={Colors.light.text}/>}
                    showTooltip={currentStep.id === 'volume-check'}
                    tooltipText="Tik op de luidspreker voor geluid"
                    onIconPress={currentStep.id === 'volume-check' ? handleReplay : undefined}
                    accessibilityLabel={currentStep.accessibilityLabel}
                    isPlayingAudio={isPlayingAudio}
                />

                {/* Mindfulness Relax Link (if mindfulness step) */}
                {currentStep.id === 'mindfulness-reminder' && (
                    <View style={styles.actionButtonContainer}>
                        <Button
                            href="/(tabs)/relax"
                            style={styles.secondaryButton}
                            accessibilityLabel="Ga naar Ontspan tab"
                            accessibilityHint="Tik om naar de mindfulness oefeningen te gaan"
                        >
                            <Icon name="brain.head.profile" size={24} color={Colors.light.primary}/>
                            <ThemedText style={styles.secondaryButtonText}>Ga naar Ontspan</ThemedText>
                        </Button>
                    </View>
                )}

                {/* Replay Audio Button (if audioId exists) */}
                {currentStep.audioId && (
                    <Pressable
                        style={({pressed}) => [
                            styles.replayButton,
                            pressed && styles.replayButtonPressed,
                            isPlayingAudio && styles.replayButtonPlaying,
                        ]}
                        onPress={handleReplay}
                        disabled={isPlayingAudio}
                        accessibilityRole="button"
                        accessibilityLabel="Herhaal audio"
                        accessibilityHint="Tik om de instructie audio opnieuw af te spelen"
                        hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
                    >
                        <Icon
                            name="speaker.wave.2.fill"
                            size={24}
                            color={isPlayingAudio ? Colors.light.accent : Colors.light.primary}
                        />
                        <ThemedText
                            style={[
                                styles.replayText,
                                isPlayingAudio && styles.replayTextPlaying
                            ]}
                        >
                            {isPlayingAudio ? 'Audio speelt af...' : 'Herhaal audio'}
                        </ThemedText>
                    </Pressable>
                )}
            </View>

            {/* Spacer - Push buttons to bottom */}
            <View style={styles.spacer}/>

            {/* Navigation Buttons - Bottom */}
            <View style={styles.navigationContainer}>
                {!isFirstStep && (
                    <Pressable
                        style={({pressed}) => [
                            styles.navigationButton,
                            styles.previousButton,
                            pressed && styles.navigationButtonPressed,
                        ]}
                        onPress={handlePrevious}
                        accessibilityRole="button"
                        accessibilityLabel="Vorige"
                        accessibilityHint="Tik om naar de vorige instructie te gaan"
                    >
                        <Icon name="arrow.left" size={32} color={Colors.light.textContrast}/>
                        <ThemedText style={styles.navigationButtonText}>Vorige</ThemedText>
                    </Pressable>
                )}
                <Pressable
                    style={({pressed}) => [
                        styles.navigationButton,
                        styles.nextButton,
                        isFirstStep && styles.nextButtonFullWidth,
                        pressed && styles.navigationButtonPressed,
                    ]}
                    onPress={handleNext}
                    accessibilityRole="button"
                    accessibilityLabel={isLastStep ? 'Verder naar oefening' : 'Volgende'}
                    accessibilityHint={
                        isLastStep
                            ? 'Tik om door te gaan naar het klaar-scherm'
                            : 'Tik om naar de volgende instructie te gaan'
                    }
                >
                    <ThemedText style={styles.navigationButtonText}>Volgende</ThemedText>
                    <Icon name="arrow.right" size={32} color={Colors.light.textContrast}/>
                </Pressable>
            </View>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
    },
    container: {
        flex: 1,
        padding: 20,
        paddingTop: 16,
    },
    header: {
        alignItems: 'center',
        gap: 4,
        marginBottom: 24,
    },
    headerTitle: {
        fontSize: Fonts.body,
        fontFamily: Fonts.semiBold,
        color: Colors.light.text,
    },
    headerSubtitle: {
        fontSize: Fonts.subtitle,
        fontFamily: Fonts.regular,
        color: Colors.light.textMuted,
    },
    skipButton: {
        position: 'absolute',
        top: 16,
        right: 20,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        padding: 8,
        zIndex: 10,
    },
    skipButtonPressed: {
        opacity: 0.7,
    },
    skipText: {
        fontSize: Fonts.label,
        fontFamily: Fonts.regular,
        color: Colors.light.text,
    },
    spacer: {
        flex: 1,
    },
    contentContainer: {
        alignItems: 'center',
        gap: 16,
    },
    actionButtonContainer: {
        width: '100%',
        marginTop: 8,
    },
    secondaryButton: {
        backgroundColor: Colors.light.background,
        borderWidth: 2,
        borderColor: Colors.light.primary,
        flexDirection: 'row',
        gap: 8,
    },
    secondaryButtonText: {
        fontSize: 16,
        fontFamily: Fonts.semiBold,
        color: Colors.light.primary,
    },
    replayButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        marginTop: 8,
        padding: 12,
        borderRadius: 8,
    },
    replayButtonPressed: {
        opacity: 0.7,
    },
    replayButtonPlaying: {
        opacity: 0.6,
    },
    replayText: {
        fontSize: 16,
        fontFamily: Fonts.medium,
        color: Colors.light.primary,
    },
    replayTextPlaying: {
        color: Colors.light.accent,
    },
    navigationContainer: {
        flexDirection: 'row',
        gap: 12,
        width: '100%',
    },
    navigationButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 12,
        backgroundColor: Colors.light.primary,
        flex: 1,
        minHeight: 48,
    },
    previousButton: {
        flex: 1,
    },
    nextButton: {
        flex: 1,
    },
    nextButtonFullWidth: {
        flex: 1,
        maxWidth: '100%',
    },
    navigationButtonPressed: {
        opacity: 0.8,
    },
    navigationButtonText: {
        fontSize: 16,
        fontFamily: Fonts.semiBold,
        color: Colors.light.textContrast,
    },
});
