import React, { useEffect, useCallback } from 'react';
import { StyleSheet, View, Pressable } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/button';
import { Icon } from '@/components/icon';
import { ProgressDots } from '@/components/progress-dots';
import { InstructionStep } from '@/components/instruction-step';
import { Colors, Fonts } from '@/constants/theme';
import { usePracticeSession } from '@/contexts/practice-session-context';
import { useAudio } from '@/contexts/audio-context';
import { INSTRUCTION_STEPS } from '@/constants/instruction-steps';

/**
 * Pre-instructions wizard screen for practice module.
 * Guides users through 3 preparatory steps with voice guidance before exercise:
 * 1. Volume Check
 * 2. Mindfulness Reminder
 * 3. Laying Position
 *
 * Features:
 * - Auto-play voice guidance on each step
 * - Progress indicator (dots)
 * - Skip button to jump to ready screen
 * - Replay audio button
 * - Optional link to Relax module (mindfulness step)
 */
export default function PracticeIndexScreen() {
	const { session, nextInstruction, skipInstructions, setReady, startSession } = usePracticeSession();
	const { play, replay } = useAudio();

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
						await play(currentStep.audioId);
					}
				} catch (error) {
					console.error('Failed to play instruction audio:', error);
					// Non-blocking error - user can still proceed
				}
			}
		};

		playStepAudio();

		// Cleanup: set cancelled flag to prevent state updates after unmount
		return () => {
			cancelled = true;
			// Note: Don't call stop() here - causes infinite loop due to state updates
			// Audio cleanup is handled by AudioContext's own cleanup
		};
	}, [session.currentInstructionIndex, play]);

	// Get current step data
	const currentStep = INSTRUCTION_STEPS[session.currentInstructionIndex];
	const isLastStep = session.currentInstructionIndex === INSTRUCTION_STEPS.length - 1;

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

	const handleSkip = useCallback(() => {
		// Skip all remaining instructions and go to ready
		skipInstructions();
		router.push('/practice/ready');
	}, [skipInstructions]);

	const handleReplay = useCallback(() => {
		replay();
	}, [replay]);

	// Don't render if no current step (will navigate away via useEffect above)
	if (!currentStep) {
		return null;
	}

	return (
		<SafeAreaView style={styles.safeArea} edges={['top']}>
			<ThemedView style={styles.container}>
				{/* Progress Dots - Top */}
				<ProgressDots
					totalSteps={INSTRUCTION_STEPS.length}
					currentStep={session.currentInstructionIndex}
					accessibilityLabel={currentStep.accessibilityLabel}
				/>

				{/* Skip Button - Top Right */}
				<Pressable
					style={({ pressed }) => [
						styles.skipButton,
						pressed && styles.skipButtonPressed,
					]}
					onPress={handleSkip}
					accessibilityRole="button"
					accessibilityLabel="Overslaan"
					accessibilityHint="Tik om alle instructies over te slaan"
					hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
				>
					<ThemedText style={styles.skipText}>Overslaan</ThemedText>
				</Pressable>

				{/* Spacer - Push content to center */}
				<View style={styles.spacer} />

				{/* Instruction Content - Centered */}
				<InstructionStep
					title={currentStep.title}
					description={currentStep.description}
					icon={<Icon name={currentStep.icon} size={80} color={Colors.light.primary} />}
					accessibilityLabel={currentStep.accessibilityLabel}
				>
					{/* Mindfulness Relax Link (if hasRelaxLink) */}
					{currentStep.hasRelaxLink && (
						<Button
							href="/(tabs)/relax"
							style={styles.secondaryButton}
							accessibilityLabel="Ga naar Ontspan tab"
							accessibilityHint="Tik om naar de mindfulness oefeningen te gaan"
						>
							<Icon name="brain.head.profile" size={24} color={Colors.light.primary} />
							<ThemedText style={styles.secondaryButtonText}>Ga naar Ontspan</ThemedText>
						</Button>
					)}
				</InstructionStep>

				{/* Replay Audio Button (if audioId exists) */}
				{currentStep.audioId && (
					<Pressable
						style={({ pressed }) => [
							styles.replayButton,
							pressed && styles.replayButtonPressed,
						]}
						onPress={handleReplay}
						accessibilityRole="button"
						accessibilityLabel="Herhaal audio"
						accessibilityHint="Tik om de instructie audio opnieuw af te spelen"
						hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
					>
						<Icon name="speaker.wave.2.fill" size={24} color={Colors.light.primary} />
						<ThemedText style={styles.replayText}>Herhaal audio</ThemedText>
					</Pressable>
				)}

				{/* Spacer - Push button to bottom */}
				<View style={styles.spacer} />

				{/* Next/Continue Button - Bottom */}
				<View style={styles.buttonContainer}>
					<Button
						onPress={handleNext}
						accessibilityLabel={isLastStep ? 'Verder naar oefening' : 'Volgende stap'}
						accessibilityHint={
							isLastStep
								? 'Tik om door te gaan naar het klaar-scherm'
								: 'Tik om naar de volgende instructie te gaan'
						}
					>
						{isLastStep ? 'Verder naar oefening' : 'Volgende'}
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
		paddingTop: 10,
	},
	skipButton: {
		position: 'absolute',
		top: 18,
		right: 20,
		padding: 12,
		zIndex: 10,
	},
	skipButtonPressed: {
		opacity: 0.7,
	},
	skipText: {
		fontSize: 16,
		fontFamily: Fonts.medium,
		color: Colors.light.primary,
	},
	spacer: {
		flex: 1,
	},
	replayButton: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		gap: 8,
		marginTop: 16,
		padding: 12,
	},
	replayButtonPressed: {
		opacity: 0.7,
	},
	replayText: {
		fontSize: 16,
		fontFamily: Fonts.medium,
		color: Colors.light.primary,
	},
	buttonContainer: {
		width: '100%',
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
});
