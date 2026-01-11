/**
 * Custom hook for haptic feedback during breathing exercises.
 * Provides tactile guidance for users who have their phone on their chest.
 *
 * Medical app consideration: Enhanced patterns with stronger, longer vibrations for better
 * perceptibility when phone is on chest. Multi-pulse patterns ensure users can feel cues clearly.
 * Haptics complement audio and visual cues but never replace them (accessibility).
 */

import { useState, useCallback } from 'react';
import * as Haptics from 'expo-haptics';

// ============================================================================
// Haptic Pattern Definitions
// ============================================================================

/**
 * Enhanced haptic patterns with multi-pulse sequences
 * Each pattern is [ImpactStyle, delayMs] - delay is AFTER the impact
 */
type HapticSequenceStep = [Haptics.ImpactFeedbackStyle, number];

const HAPTIC_PATTERNS = {
	/**
	 * Phase Transition: Double-pulse for clear phase change
	 * Duration: ~200ms
	 */
	phaseTransition: [
		[Haptics.ImpactFeedbackStyle.Medium, 100],
		[Haptics.ImpactFeedbackStyle.Medium, 0],
	] as HapticSequenceStep[],

	/**
	 * Inhale Cue: Ascending intensity (gentle build-up)
	 * Duration: ~100ms
	 */
	inhale: [
		[Haptics.ImpactFeedbackStyle.Light, 50],
		[Haptics.ImpactFeedbackStyle.Medium, 0],
	] as HapticSequenceStep[],

	/**
	 * Exhale Cue: Descending intensity (release)
	 * Duration: ~100ms
	 */
	exhale: [
		[Haptics.ImpactFeedbackStyle.Medium, 50],
		[Haptics.ImpactFeedbackStyle.Light, 0],
	] as HapticSequenceStep[],

	/**
	 * Hold Start: Triple-pulse for urgent "STOP NOW" signal
	 * Duration: ~400ms
	 */
	holdStart: [
		[Haptics.ImpactFeedbackStyle.Heavy, 150],
		[Haptics.ImpactFeedbackStyle.Heavy, 150],
		[Haptics.ImpactFeedbackStyle.Heavy, 0],
	] as HapticSequenceStep[],

	/**
	 * Countdown Tick: Double-pulse for noticeable progress
	 * Duration: ~200ms
	 */
	tick: [
		[Haptics.ImpactFeedbackStyle.Medium, 100],
		[Haptics.ImpactFeedbackStyle.Medium, 0],
	] as HapticSequenceStep[],

	/**
	 * Exercise Complete: "Success celebration" pattern
	 * Duration: ~600ms
	 */
	complete: [
		[Haptics.ImpactFeedbackStyle.Heavy, 100],
		[Haptics.ImpactFeedbackStyle.Heavy, 100],
		[Haptics.ImpactFeedbackStyle.Heavy, 200],
		[Haptics.ImpactFeedbackStyle.Heavy, 0],
	] as HapticSequenceStep[],
} as const;

/**
 * Haptic pattern functions
 * All patterns are async but non-blocking
 */
export interface HapticPatterns {
	/**
	 * Phase transition - signals start of new breathing phase
	 * Pattern: Double Medium impact (~200ms)
	 * When: Boundary between breathing phases
	 */
	phaseTransition: () => Promise<void>;

	/**
	 * Inhale cue - ascending intensity for inhalation
	 * Pattern: Light → Medium (~100ms)
	 * When: Start of inhale phase
	 */
	inhale: () => Promise<void>;

	/**
	 * Exhale cue - descending intensity for exhalation
	 * Pattern: Medium → Light (~100ms)
	 * When: Start of exhale phase
	 */
	exhale: () => Promise<void>;

	/**
	 * Hold start - urgent "hold breath now" signal
	 * Pattern: Triple Heavy impact (~400ms)
	 * When: Beginning of breath hold phase
	 */
	holdStart: () => Promise<void>;

	/**
	 * Countdown tick - subtle progress indicator
	 * Pattern: Double Medium impact (~200ms)
	 * When: Every 10 seconds during breath hold
	 */
	tick: () => Promise<void>;

	/**
	 * Exercise complete - success celebration
	 * Pattern: Quadruple Heavy impact (~600ms)
	 * When: Exercise successfully completed
	 */
	complete: () => Promise<void>;
}

/**
 * Hook return type
 */
export interface UseHapticsReturn extends HapticPatterns {
	/** Whether haptics are currently enabled */
	isEnabled: boolean;
	/** Enable or disable haptic feedback */
	setEnabled: (enabled: boolean) => void;
}

/**
 * Custom hook for managing haptic feedback patterns
 *
 * @example
 * ```tsx
 * const haptics = useHaptics();
 *
 * // Trigger phase transition
 * haptics.phaseTransition();
 *
 * // Disable haptics
 * haptics.setEnabled(false);
 * ```
 */
export function useHaptics(): UseHapticsReturn {
	const [isEnabled, setIsEnabled] = useState(true);

	/**
	 * Execute a sequence of haptic impacts with delays
	 * @param sequence - Array of [ImpactStyle, delayMs] tuples
	 * @param name - Pattern name for error logging
	 */
	const executeSequence = useCallback(
		async (sequence: HapticSequenceStep[], name: string) => {
			if (!isEnabled) {
				return;
			}

			try {
				for (const [style, delay] of sequence) {
					await Haptics.impactAsync(style);
					if (delay > 0) {
						await new Promise(resolve => setTimeout(resolve, delay));
					}
				}
			} catch (error) {
				// Graceful degradation: log but don't disrupt exercise
				console.warn(`Haptic feedback '${name}' failed:`, (error as Error).message);
				// Don't throw - exercise should continue with audio/visual cues only
			}
		},
		[isEnabled]
	);

	/**
	 * Phase transition - double-pulse for clear phase change
	 */
	const phaseTransition = useCallback(async () => {
		await executeSequence(HAPTIC_PATTERNS.phaseTransition, 'phaseTransition');
	}, [executeSequence]);

	/**
	 * Inhale cue - single heavy impact for clear signal
	 */
	const inhale = useCallback(async () => {
		await executeSequence(HAPTIC_PATTERNS.inhale, 'inhale');
	}, [executeSequence]);

	/**
	 * Exhale cue - single heavy impact for clear signal
	 */
	const exhale = useCallback(async () => {
		await executeSequence(HAPTIC_PATTERNS.exhale, 'exhale');
	}, [executeSequence]);

	/**
	 * Hold start - triple-pulse for urgent "STOP NOW" signal
	 */
	const holdStart = useCallback(async () => {
		await executeSequence(HAPTIC_PATTERNS.holdStart, 'holdStart');
	}, [executeSequence]);

	/**
	 * Countdown tick - double-pulse for noticeable progress
	 */
	const tick = useCallback(async () => {
		await executeSequence(HAPTIC_PATTERNS.tick, 'tick');
	}, [executeSequence]);

	/**
	 * Exercise complete - success celebration pattern
	 */
	const complete = useCallback(async () => {
		await executeSequence(HAPTIC_PATTERNS.complete, 'complete');
	}, [executeSequence]);

	return {
		phaseTransition,
		inhale,
		exhale,
		holdStart,
		tick,
		complete,
		isEnabled,
		setEnabled: setIsEnabled,
	};
}
