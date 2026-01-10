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

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { StyleSheet, View, Pressable } from 'react-native';
import { router } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { BreathingCircle } from '@/components/breathing-circle';
import { Button } from '@/components/button';
import { Colors, Fonts } from '@/constants/theme';
import { usePracticeSession } from '@/contexts/practice-session-context';
import { useAudio } from '@/contexts/audio-context';
import { AUDIO_SEQUENCES, playDebugPing } from '@/constants/audio';

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
	const { startExercise, pauseExercise } = usePracticeSession();
	const { playSequence, stop } = useAudio();

	const [currentPhase, setCurrentPhase] = useState<PreparationPhase>(0);
	const [currentBreathingPhase, setCurrentBreathingPhase] = useState<BreathingPhase>('inhale');
	const [error, setError] = useState<string | null>(null);

	// Store timers in ref so we can clear them on pause
	const timersRef = useRef<number[]>([]);

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
		//
		// Debug pings fire at phase END boundaries (before state changes)

		const runBreathingSequence = () => {
			// Clear any existing timers
			timersRef.current.forEach(timer => clearTimeout(timer));
			timersRef.current = [];
			// 0ms: Start Phase 0, inhale
			setCurrentPhase(0);
			setCurrentBreathingPhase('inhale');

			// 3500ms: End of first inhale → Start exhale + DEBUG PING
			timersRef.current.push(setTimeout(() => {
				playDebugPing(); // DEBUG: End of Phase 0 inhale
				setCurrentBreathingPhase('exhale');
			}, BREATHING_TIMING.INHALE_DURATION));

			// 6900ms: Just before Phase 1 → DEBUG PING
			timersRef.current.push(setTimeout(() => {
				playDebugPing(); // DEBUG: Phase 0→1 boundary
			}, BREATHING_TIMING.PHASE_DURATION - 100));

			// 7000ms: Start Phase 1, inhale
			timersRef.current.push(setTimeout(() => {
				setCurrentPhase(1);
				setCurrentBreathingPhase('inhale');
			}, BREATHING_TIMING.PHASE_DURATION));

			// 10500ms: End of second inhale → Start exhale + DEBUG PING
			timersRef.current.push(setTimeout(() => {
				playDebugPing(); // DEBUG: End of Phase 1 inhale
				setCurrentBreathingPhase('exhale');
			}, BREATHING_TIMING.PHASE_DURATION + BREATHING_TIMING.INHALE_DURATION));

			// 13900ms: Just before Phase 2 → DEBUG PING
			timersRef.current.push(setTimeout(() => {
				playDebugPing(); // DEBUG: Phase 1→2 boundary
			}, (BREATHING_TIMING.PHASE_DURATION * 2) - 100));

			// 14000ms: Start Phase 2, inhale
			timersRef.current.push(setTimeout(() => {
				setCurrentPhase(2);
				setCurrentBreathingPhase('inhale');
			}, BREATHING_TIMING.PHASE_DURATION * 2));

			// 17500ms: End of third inhale → Start hold
			timersRef.current.push(setTimeout(() => {
				setCurrentBreathingPhase('hold');
			}, (BREATHING_TIMING.PHASE_DURATION * 2) + BREATHING_TIMING.INHALE_DURATION));

			// 18500ms: Navigate to exercise + DEBUG PING
			timersRef.current.push(setTimeout(() => {
				playDebugPing(); // DEBUG: Preparation→Exercise transition
				startExercise();
				router.replace('/practice/exercise' as any);
			}, (BREATHING_TIMING.PHASE_DURATION * 2) + BREATHING_TIMING.INHALE_DURATION + BREATHING_TIMING.HOLD_DURATION));
		};

		runBreathingSequence();

		return () => {
			// Clear all timers to prevent memory leaks
			timersRef.current.forEach(timer => clearTimeout(timer));
			timersRef.current = [];
		};
	}, [startExercise]);

	// Handle tap to pause during preparation
	const handleTapToPause = useCallback(() => {
		playDebugPing(); // DEBUG: Preparation→Pause transition
		// Clear all timers
		timersRef.current.forEach(timer => clearTimeout(timer));
		timersRef.current = [];

		// Stop audio
		stop();

		// Transition to paused state
		pauseExercise();

		// Navigate to paused screen
		router.push('/practice/paused' as any);
	}, [pauseExercise, stop]);

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
		<Pressable
			style={styles.container}
			onPress={handleTapToPause}
			accessibilityRole="button"
			accessibilityLabel="Voorbereiding scherm"
			accessibilityHint="Tik ergens om te pauzeren"
		>
			{/* Top spacer - pushes content to vertical center */}
			<View style={styles.spacer} />

			{/* Center content area - circles and text layered together */}
			<View style={styles.centerContent}>
				{/* Breathing circle - animates based on phase */}
				<BreathingCircle phase={currentBreathingPhase} />

			{/* Accent circle - overlaid on wave circles */}
			<View style={styles.accentCircle} />


				{/* Instruction text - centered inside the circles */}
				<ThemedText
					style={styles.instructionText}
					accessibilityLabel={getInstructionText()}
					accessibilityLiveRegion="polite"
				>
					{getInstructionText()}
				</ThemedText>
			</View>

			{/* Bottom spacer - balances top spacer */}
			<View style={styles.spacer} />

			{/* Bottom instruction text */}
			<View style={styles.bottomContainer}>
				<ThemedText style={styles.bottomText}>
					Tik ergens op het scherm om te pauzeren
				</ThemedText>
			</View>

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
	instructionText: {
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
	errorContainer: {
		position: 'absolute',
		bottom: 80,
		width: '100%',
		paddingHorizontal: 20,
		gap: 12,
		alignItems: 'center',
	},
	errorText: {
		fontSize: 14,
		fontFamily: Fonts.regular,
		color: Colors.light.accent,
		textAlign: 'center',
	},
});
