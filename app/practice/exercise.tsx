/**
 * Practice Exercise Screen
 * Core breathing exercise with 5-phase state machine.
 *
 * Phase sequence:
 * 1. inhale_exhale_1 (6s): First breathing cycle
 * 2. inhale_exhale_2 (6s): Second breathing cycle
 * 3. final_inhale (4s): Final deep inhale
 * 4. hold (40s max): Breath hold with timer
 * 5. complete: Navigate to finish screen
 *
 * Total duration: 56 seconds
 */

import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, View, Pressable } from 'react-native';
import { router } from 'expo-router';
import { useKeepAwake } from 'expo-keep-awake';
import { ThemedText } from '@/components/themed-text';
import { BreathingCircle } from '@/components/breathing-circle';
import { Colors, Fonts } from '@/constants/theme';
import { usePracticeSession } from '@/contexts/practice-session-context';
import { useAudio } from '@/contexts/audio-context';
import { AUDIO_SEQUENCES } from '@/constants/audio';

// Exercise phase types
type ExercisePhaseType =
	| 'inhale_exhale_1' // First breathing cycle (6s)
	| 'inhale_exhale_2' // Second breathing cycle (6s)
	| 'final_inhale' // Final deep inhale (4s)
	| 'hold' // Breath hold (up to 40s)
	| 'complete'; // Exercise finished

type BreathingPhase = 'inhale' | 'exhale' | 'hold';

// Medical protocol timing constants (milliseconds)
const EXERCISE_TIMING = {
	INHALE_EXHALE_1_DURATION: 6000, // 6 seconds
	INHALE_EXHALE_2_DURATION: 6000, // 6 seconds
	FINAL_INHALE_DURATION: 4000, // 4 seconds
	MAX_HOLD_DURATION: 40000, // 40 seconds
	TOTAL_DURATION: 56000, // 56 seconds total
	INHALE_DURATION: 3000, // 3 seconds per inhale
	EXHALE_DURATION: 3000, // 3 seconds per exhale
} as const;

export default function PracticeExerciseScreen() {
	// Keep screen awake during exercise
	useKeepAwake();

	const {
		getCurrentBreathHoldDuration,
		startBreathHold,
		endBreathHold,
		pauseExercise,
		finishExercise,
		setExercisePhase,
	} = usePracticeSession();
	const { playSequence, stop } = useAudio();

	// Local state for exercise phases
	const [currentPhase, setCurrentPhase] = useState<ExercisePhaseType>('inhale_exhale_1');
	const [currentBreathingPhase, setCurrentBreathingPhase] = useState<BreathingPhase>('inhale');
	const [phaseStartTime, setPhaseStartTime] = useState<Date>(new Date());
	const [progress, setProgress] = useState(0);
	const [holdTimer, setHoldTimer] = useState(0);

	// Calculate progress percentage based on elapsed time
	const calculateProgress = useCallback((): number => {
		if (!phaseStartTime) return 0;

		const elapsedInCurrentPhase = Date.now() - phaseStartTime.getTime();

		// Calculate base progress from completed phases
		let baseProgress = 0;
		switch (currentPhase) {
			case 'inhale_exhale_1':
				baseProgress = 0;
				break;
			case 'inhale_exhale_2':
				baseProgress = EXERCISE_TIMING.INHALE_EXHALE_1_DURATION;
				break;
			case 'final_inhale':
				baseProgress =
					EXERCISE_TIMING.INHALE_EXHALE_1_DURATION + EXERCISE_TIMING.INHALE_EXHALE_2_DURATION;
				break;
			case 'hold':
				baseProgress =
					EXERCISE_TIMING.INHALE_EXHALE_1_DURATION +
					EXERCISE_TIMING.INHALE_EXHALE_2_DURATION +
					EXERCISE_TIMING.FINAL_INHALE_DURATION;
				break;
			case 'complete':
				return 100;
		}

		const totalElapsed = baseProgress + elapsedInCurrentPhase;
		return Math.min(100, (totalElapsed / EXERCISE_TIMING.TOTAL_DURATION) * 100);
	}, [currentPhase, phaseStartTime]);

	// Update progress bar every 100ms
	useEffect(() => {
		const interval = setInterval(() => {
			setProgress(calculateProgress());
		}, 100);

		return () => clearInterval(interval);
	}, [calculateProgress]);

	// Update hold timer display every 100ms during hold phase
	useEffect(() => {
		if (currentPhase !== 'hold') {
			setHoldTimer(0);
			return;
		}

		const interval = setInterval(() => {
			const duration = getCurrentBreathHoldDuration();
			setHoldTimer(duration);
		}, 100);

		return () => clearInterval(interval);
	}, [currentPhase, getCurrentBreathHoldDuration]);

	// Main exercise state machine - runs on mount
	useEffect(() => {
		const timers: number[] = [];

		const runExercise = () => {
			// === PHASE 1: inhale_exhale_1 (6s) ===
			setCurrentPhase('inhale_exhale_1');
			setCurrentBreathingPhase('inhale');
			setPhaseStartTime(new Date());
			setExercisePhase('inhale');

			// Switch to exhale after 3s
			timers.push(
				window.setTimeout(() => {
					setCurrentBreathingPhase('exhale');
					setExercisePhase('exhale');
				}, EXERCISE_TIMING.INHALE_DURATION)
			);

			// === PHASE 2: inhale_exhale_2 (6s) ===
			timers.push(
				window.setTimeout(() => {
					setCurrentPhase('inhale_exhale_2');
					setCurrentBreathingPhase('inhale');
					setPhaseStartTime(new Date());
					setExercisePhase('inhale');

					// Switch to exhale after 3s
					timers.push(
						window.setTimeout(() => {
							setCurrentBreathingPhase('exhale');
							setExercisePhase('exhale');
						}, EXERCISE_TIMING.INHALE_DURATION)
					);

					// === PHASE 3: final_inhale (4s) ===
					timers.push(
						window.setTimeout(() => {
							setCurrentPhase('final_inhale');
							setCurrentBreathingPhase('inhale');
							setPhaseStartTime(new Date());
							setExercisePhase('inhale');

							// === PHASE 4: hold (40s max) ===
							timers.push(
								window.setTimeout(() => {
									setCurrentPhase('hold');
									setCurrentBreathingPhase('hold');
									setPhaseStartTime(new Date());
									setExercisePhase('hold');

									// Start breath hold tracking in context
									startBreathHold();

									// === PHASE 5: complete (auto after 40s) ===
									timers.push(
										window.setTimeout(() => {
											// End breath hold (calculates duration)
											endBreathHold();

											// Transition to complete
											setCurrentPhase('complete');

											// Finish exercise and navigate
											finishExercise();
											router.replace('/practice/finish' as any);
										}, EXERCISE_TIMING.MAX_HOLD_DURATION)
									);
								}, EXERCISE_TIMING.FINAL_INHALE_DURATION)
							);
						}, EXERCISE_TIMING.INHALE_EXHALE_2_DURATION)
					);
				}, EXERCISE_TIMING.INHALE_EXHALE_1_DURATION)
			);
		};

		runExercise();

		// Cleanup: Clear all timers on unmount
		return () => {
			timers.forEach((timer) => clearTimeout(timer));
			stop(); // Stop audio
		};
	}, [startBreathHold, endBreathHold, finishExercise, setExercisePhase, stop]);

	// Play audio cues based on phase transitions
	useEffect(() => {
		const audioSequences: Record<ExercisePhaseType, typeof AUDIO_SEQUENCES[keyof typeof AUDIO_SEQUENCES] | null> = {
			inhale_exhale_1: AUDIO_SEQUENCES.breathCycle,
			inhale_exhale_2: AUDIO_SEQUENCES.breathCycle,
			final_inhale: AUDIO_SEQUENCES.finalInhale,
			hold: AUDIO_SEQUENCES.startHold,
			complete: null,
		};

		const sequence = audioSequences[currentPhase];
		if (sequence) {
			playSequence(sequence).catch((err) => {
				console.error('Audio playback failed:', err);
				// Continue exercise with visual cues only (graceful degradation)
			});
		}
	}, [currentPhase, playSequence]);

	// Handle tap to pause
	const handleTapToPause = () => {
		// Stop audio
		stop();

		// If in hold phase, record the duration before pausing
		if (currentPhase === 'hold') {
			endBreathHold();
		}

		// Transition to paused state
		pauseExercise();

		// Navigate to paused screen
		router.push('/practice/paused' as any);
	};

	// Get instruction text based on current phase
	const getInstructionText = (): string => {
		switch (currentPhase) {
			case 'inhale_exhale_1':
			case 'inhale_exhale_2':
				return currentBreathingPhase === 'inhale' ? 'Adem diep in...' : 'En adem weer uit...';
			case 'final_inhale':
				return 'Adem diep in...';
			case 'hold':
				return 'Houd je adem vast!';
			case 'complete':
				return 'Goed gedaan!';
			default:
				return '';
		}
	};

	// Format hold timer for display (M:SS)
	const formattedHoldTime = `${Math.floor(holdTimer / 60)}:${String(holdTimer % 60).padStart(2, '0')}`;

	return (
		<Pressable
			style={styles.container}
			onPress={handleTapToPause}
			accessibilityRole="button"
			accessibilityLabel="Oefening scherm"
			accessibilityHint="Tik ergens om te pauzeren"
		>
			{/* Progress Bar */}
			<View
				style={styles.progressBarContainer}
				accessibilityElementsHidden={true}
			>
				<View style={[styles.progressBar, { width: `${progress}%` }]} />
			</View>

			{/* Spacer */}
			<View style={styles.spacer} />

			{/* Breathing Circle Animation */}
			<View style={styles.circleContainer}>
				<BreathingCircle phase={currentBreathingPhase} />
			</View>

			{/* Hold Timer (only during hold phase) */}
			{currentPhase === 'hold' && (
				<ThemedText
					style={styles.timerText}
					accessibilityLabel={`Ademhouding: ${formattedHoldTime}`}
					accessibilityLiveRegion="polite"
				>
					{formattedHoldTime}
				</ThemedText>
			)}

			{/* Instruction Text */}
			<ThemedText
				style={styles.instructionText}
				accessibilityLabel={getInstructionText()}
				accessibilityLiveRegion="polite"
			>
				{getInstructionText()}
			</ThemedText>

			{/* Spacer */}
			<View style={styles.spacer} />
		</Pressable>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: Colors.light.primary, // Full blue background
		padding: 20,
	},
	progressBarContainer: {
		position: 'absolute',
		top: 60, // Below safe area
		left: 20,
		right: 20,
		height: 4,
		backgroundColor: 'rgba(242, 238, 235, 0.3)', // Semi-transparent white
		borderRadius: 2,
		overflow: 'hidden',
	},
	progressBar: {
		height: '100%',
		backgroundColor: Colors.light.textContrast, // White
		borderRadius: 2,
	},
	spacer: {
		flex: 1,
	},
	circleContainer: {
		justifyContent: 'center',
		alignItems: 'center',
		minHeight: 300,
	},
	timerText: {
		fontSize: 72,
		fontFamily: Fonts.bold,
		color: Colors.light.textContrast,
		textAlign: 'center',
		marginTop: 24,
	},
	instructionText: {
		fontSize: 24,
		fontFamily: Fonts.medium,
		color: Colors.light.textContrast,
		textAlign: 'center',
		marginTop: 24,
		paddingHorizontal: 20,
	},
});
