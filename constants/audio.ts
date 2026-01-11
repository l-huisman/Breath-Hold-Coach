/**
 * Audio manifest and constants for practice module audio service.
 * Maps audio IDs to their file sources and metadata.
 */

import { AudioMetadata, AudioId } from '@/types/audio';

/**
 * Audio manifest - single source of truth for all audio files
 * Maps audio IDs to their source files and metadata
 */
export const AUDIO_MANIFEST: Record<AudioId, AudioMetadata> = {
	'volume-check': {
		id: 'volume-check',
		source: require('@/assets/audio/pre-instructions/volume-check.mp3'),
		category: 'pre-instruction',
		durationMs: 1000,
		description: 'Controleer je geluidsvolume',
	},
	'mindfulness-reminder': {
		id: 'mindfulness-reminder',
		source: require('@/assets/audio/pre-instructions/mindfulness-reminder.mp3'),
		category: 'pre-instruction',
		durationMs: 1000,
		description: 'Herinnering voor mindfulness',
	},
	'laying-position': {
		id: 'laying-position',
		source: require('@/assets/audio/pre-instructions/laying-position.mp3'),
		category: 'pre-instruction',
		durationMs: 1000,
		description: 'Instructie voor liggende positie',
	},
	'inhale-exhale': {
		id: 'inhale-exhale',
		source: require('@/assets/audio/exercise/inhale-exhale.mp3'),
		category: 'exercise',
		durationMs: 1000,
		description: 'Adem diep in en adem weer uit',
	},
	'and-again': {
		id: 'and-again',
		source: require('@/assets/audio/exercise/and-again.mp3'),
		category: 'exercise',
		durationMs: 1000,
		description: 'En nog een keer',
	},
	'inhale-deeply': {
		id: 'inhale-deeply',
		source: require('@/assets/audio/exercise/inhale-deeply.mp3'),
		category: 'exercise',
		durationMs: 1000,
		description: 'Adem diep in',
	},
	'hold-breath': {
		id: 'hold-breath',
		source: require('@/assets/audio/exercise/hold-breath.mp3'),
		category: 'exercise',
		durationMs: 1000,
		description: 'En houd je adem vast',
	},
	'countdown-beep': {
		id: 'countdown-beep',
		source: require('@/assets/audio/ui/countdown-beep.mp3'),
		category: 'ui',
		durationMs: 1000,
		description: 'Countdown pieptoon',
	},
	'breathing-prep-phase-1': {
		id: 'breathing-prep-phase-1',
		source: require('@/assets/audio/preparation/breathing-prep-phase-1.mp3'),
		category: 'exercise',
		durationMs: 7000,
		description: 'Eerste oefeningsademhaling',
	},
	'breathing-prep-phase-2': {
		id: 'breathing-prep-phase-2',
		source: require('@/assets/audio/preparation/breathing-prep-phase-2.mp3'),
		category: 'exercise',
		durationMs: 7000,
		description: 'Tweede oefeningsademhaling',
	},
	'breathing-prep-phase-3': {
		id: 'breathing-prep-phase-3',
		source: require('@/assets/audio/preparation/breathing-prep-phase-3.mp3'),
		category: 'exercise',
		durationMs: 5000,
		description: 'Laatste inademen en vasthouden',
	},
	'debug-ping': {
		id: 'debug-ping',
		source: require('@/assets/audio/ui/debug-beep.mp3'),
		category: 'ui',
		durationMs: 1000,
		description: 'Debug pieptoon voor timing verificatie',
	},
};

/**
 * Pre-defined audio sequences for exercise phases
 */
export const AUDIO_SEQUENCES = {
	// First 3 breathing cycles: practice inhale-exhale pattern
	breathCycle: ['inhale-exhale', 'and-again'] as AudioId[],
	// Final inhale before holding breath
	finalInhale: ['inhale-deeply'] as AudioId[],
	// Start holding breath
	startHold: ['hold-breath'] as AudioId[],
	// Breathing preparation sequence (3 phases before exercise)
	breathingPreparation: [
		'breathing-prep-phase-1',
		'breathing-prep-phase-2',
		'breathing-prep-phase-3',
	] as AudioId[],
};

/**
 * Play debug ping sound for timing verification
 * Only plays in development mode (__DEV__)
 * Uses expo-audio directly to avoid interfering with instructional audio context
 * Gracefully fails if audio cannot be played
 */
export const playDebugPing = async () => {
	if (!__DEV__) return;

	try {
		const {createAudioPlayer, setAudioModeAsync} = require('expo-audio');

		// Configure audio to play in silent mode
		await setAudioModeAsync({
			playsInSilentModeIOS: true,
		});

		// Create player and play
		const player = createAudioPlayer(AUDIO_MANIFEST['debug-ping'].source);
		player.play();

		// Auto-cleanup when finished
		const subscription = player.addListener('playbackStatusUpdate', (status: any) => {
			if (status.didJustFinish) {
				subscription.remove();
				player.release();
			}
		});
	} catch (err) {
		console.error('[DEBUG] Failed to play debug-ping:', err);
	}
};
