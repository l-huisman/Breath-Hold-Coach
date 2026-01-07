/**
 * Breathing Preparation Screen
 * Guides users through the full medical protocol breathing sequence:
 * "Inhale deeply and exhale... And again... Inhale deeply and hold"
 *
 * Features:
 * - 3-phase breathing preparation (inhale/exhale, inhale/exhale, inhale/hold)
 * - Animated breathing circle (expands on inhale, contracts on exhale)
 * - Text instructions synchronized with breathing phases
 * - Auto-navigates to exercise screen after completion
 */

import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BreathingCircle } from '@/components/breathing-circle';
import { Button } from '@/components/button';
import { Colors, Fonts } from '@/constants/theme';
import { usePracticeSession } from '@/contexts/practice-session-context';
import { useAudio } from '@/contexts/audio-context';
import { AUDIO_SEQUENCES } from '@/constants/audio';

type BreathingPhase = 'inhale' | 'exhale' | 'hold';
type PreparationPhase = 0 | 1 | 2; // 3 phases total

// Medical protocol timing constants (in milliseconds)
const BREATHING_TIMING = {
	INHALE_DURATION: 3500,
	EXHALE_DURATION: 3500,
	HOLD_DURATION: 1000,
	get PHASE_DURATION() { return this.INHALE_DURATION + this.EXHALE_DURATION; }, // 7000ms
	get TOTAL_DURATION() { return (this.PHASE_DURATION * 2) + this.INHALE_DURATION + this.HOLD_DURATION; }, // 18500ms
} as const;

export default function PracticePreparationScreen() {
	const { startExercise } = usePracticeSession();
	const { playSequence, stop } = useAudio();

	const [currentPhase, setCurrentPhase] = useState<PreparationPhase>(0);
	const [currentBreathingPhase, setCurrentBreathingPhase] = useState<BreathingPhase>('inhale');
	const [error, setError] = useState<string | null>(null);

	// Auto-play audio sequence on mount (audio is just for guidance, timing is controlled separately)
	useEffect(() => {
		let cancelled = false;

		const startPreparation = async () => {
			try {
				if (!cancelled) {
					await playSequence(AUDIO_SEQUENCES.breathingPreparation);
				}
			} catch (err) {
				console.error('Failed to play preparation audio:', err);
				if (!cancelled) {
					setError('Audio kon niet worden afgespeeld. Volg de visuele instructies.');
				}
			}
		};

		startPreparation();

		return () => {
			cancelled = true;
			stop();
		};
	}, [playSequence, stop]);

	// Main breathing sequence - time-based (not audio-driven)
	useEffect(() => {
		// Phase 0: Inhale (3.5s) → Exhale (3.5s) = 7s total
		// Phase 1: Inhale (3.5s) → Exhale (3.5s) = 7s total
		// Phase 2: Inhale (3.5s) → Hold (1s) → Navigate = 4.5s total
		// Total: ~18.5 seconds

		const timers: number[] = [];

		const runBreathingSequence = () => {
			// Start with phase 0, inhale
			setCurrentPhase(0);
			setCurrentBreathingPhase('inhale');

			// Phase 0: Inhale → Exhale
			timers.push(setTimeout(() => {
				setCurrentBreathingPhase('exhale');
			}, BREATHING_TIMING.INHALE_DURATION));

			// Move to Phase 1 after one complete phase
			timers.push(setTimeout(() => {
				setCurrentPhase(1);
				setCurrentBreathingPhase('inhale');

				// Phase 1: Inhale → Exhale
				timers.push(setTimeout(() => {
					setCurrentBreathingPhase('exhale');
				}, BREATHING_TIMING.INHALE_DURATION));

				// Move to Phase 2 after two complete phases
				timers.push(setTimeout(() => {
					setCurrentPhase(2);
					setCurrentBreathingPhase('inhale');

					// Phase 2: Inhale → Hold
					timers.push(setTimeout(() => {
						setCurrentBreathingPhase('hold');
					}, BREATHING_TIMING.INHALE_DURATION));

					// Navigate to exercise after hold
					timers.push(setTimeout(() => {
						startExercise();
						router.replace('/practice/exercise' as any);
					}, BREATHING_TIMING.INHALE_DURATION + BREATHING_TIMING.HOLD_DURATION));
				}, BREATHING_TIMING.PHASE_DURATION));
			}, BREATHING_TIMING.PHASE_DURATION));
		};

		runBreathingSequence();

		return () => {
			// Clear all timers to prevent memory leaks
			timers.forEach(timer => clearTimeout(timer));
		};
	}, [startExercise]);

	// Fallback: Manual next button if audio fails
	const handleManualNext = useCallback(() => {
		if (currentPhase < 2) {
			setCurrentPhase((prev) => (prev + 1) as PreparationPhase);
			setCurrentBreathingPhase('inhale');
		} else {
			startExercise();
			router.replace('/practice/exercise' as any);
		}
	}, [currentPhase, startExercise]);

	// Get instruction text based on breathing phase
	const getInstructionText = () => {
		switch (currentBreathingPhase) {
			case 'inhale':
				return 'Adem in';
			case 'exhale':
				return 'Adem uit';
			case 'hold':
				return 'Houd vast';
			default:
				return '';
		}
	};

	return (
		<ThemedView style={styles.container}>
			{/* Progress Indicator */}
			<View style={styles.progressContainer}>
				<ThemedText
					style={styles.progressText}
					accessibilityLabel={`Voorbereiding ${currentPhase + 1} van 3`}
				>
					{currentPhase + 1} van 3
				</ThemedText>
			</View>

			{/* Spacer */}
			<View style={styles.spacer} />

			{/* Breathing Circle */}
			<View style={styles.circleContainer}>
				<BreathingCircle phase={currentBreathingPhase} />
			</View>

			{/* Breathing Instruction */}
			<View style={styles.instructionContainer}>
				<ThemedText
					style={styles.instructionText}
					accessibilityLabel={getInstructionText()}
					accessibilityLiveRegion="polite"
				>
					{getInstructionText()}
				</ThemedText>
			</View>

			{/* Spacer */}
			<View style={styles.spacer} />

			{/* Error Message + Manual Control (only if audio failed) */}
			{error && (
				<View style={styles.errorContainer}>
					<ThemedText style={styles.errorText}>{error}</ThemedText>
					<Button
						onPress={handleManualNext}
						accessibilityLabel={currentPhase === 2 ? 'Start oefening' : 'Volgende fase'}
					>
						{currentPhase === 2 ? 'Start oefening' : 'Volgende'}
					</Button>
				</View>
			)}

			{/* Bottom instruction (matching Figma design) */}
			<ThemedText style={styles.bottomInstruction}>
				Tik ergens op het scherm om te pauzeren
			</ThemedText>
		</ThemedView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		padding: 20,
		backgroundColor: Colors.light.background,
		justifyContent: 'center',
		alignItems: 'center',
	},
	progressContainer: {
		position: 'absolute',
		top: 60,
		alignSelf: 'center',
	},
	progressText: {
		fontSize: 18,
		fontFamily: Fonts.medium,
		color: Colors.light.textMuted,
		textAlign: 'center',
	},
	spacer: {
		flex: 1,
	},
	circleContainer: {
		justifyContent: 'center',
		alignItems: 'center',
		minHeight: 300,
	},
	instructionContainer: {
		marginTop: 40,
		paddingHorizontal: 20,
	},
	instructionText: {
		fontSize: 39,
		fontFamily: Fonts.bold,
		color: Colors.light.primary,
		textAlign: 'center',
	},
	bottomInstruction: {
		position: 'absolute',
		bottom: 120,
		fontSize: 14,
		fontFamily: Fonts.regular,
		color: Colors.light.textMuted,
		textAlign: 'center',
		paddingHorizontal: 20,
	},
	errorContainer: {
		position: 'absolute',
		bottom: 40,
		width: '100%',
		paddingHorizontal: 20,
		gap: 12,
	},
	errorText: {
		fontSize: 14,
		fontFamily: Fonts.regular,
		color: Colors.light.accent,
		textAlign: 'center',
	},
});
