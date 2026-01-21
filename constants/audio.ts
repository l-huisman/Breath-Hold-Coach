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
	// Pre-instructions (updated to .m4a in root audio folder)
	'volume-check': {
		id: 'volume-check',
		source: require('@/assets/audio/volume-check.m4a'),
		category: 'pre-instruction',
		durationMs: 3000,
		description: 'Controleer je geluidsvolume',
	},
	'mindfulness-reminder': {
		id: 'mindfulness-reminder',
		source: require('@/assets/audio/mindfulness-reminder.m4a'),
		category: 'pre-instruction',
		durationMs: 5000,
		description: 'Herinnering voor mindfulness',
	},
	'laying-position': {
		id: 'laying-position',
		source: require('@/assets/audio/laying-position.m4a'),
		category: 'pre-instruction',
		durationMs: 4000,
		description: 'Instructie voor liggende positie',
	},
	// Breathing cues (new .m4a files)
	'inhale': {
		id: 'inhale',
		source: require('@/assets/audio/inhale.m4a'),
		category: 'exercise',
		durationMs: 2000,
		description: 'Adem in',
	},
	'exhale': {
		id: 'exhale',
		source: require('@/assets/audio/exhale.m4a'),
		category: 'exercise',
		durationMs: 2000,
		description: 'Adem uit',
	},
	'inhale-deep': {
		id: 'inhale-deep',
		source: require('@/assets/audio/inhale-deep.m4a'),
		category: 'exercise',
		durationMs: 2000,
		description: 'Adem diep in',
	},
	'hold-breath': {
		id: 'hold-breath',
		source: require('@/assets/audio/hold-breath.m4a'),
		category: 'exercise',
		durationMs: 2000,
		description: 'En houd je adem vast',
	},
	'breath-hold-starts': {
		id: 'breath-hold-starts',
		source: require('@/assets/audio/breath-hold-starts.m4a'),
		category: 'exercise',
		durationMs: 2000,
		description: 'De ademhouding begint',
	},
	// Milestone announcements (new .m4a files)
	'milestone-10s': {
		id: 'milestone-10s',
		source: require('@/assets/audio/10-seconds.m4a'),
		category: 'milestone',
		durationMs: 1500,
		description: '10 seconden',
	},
	'milestone-20s': {
		id: 'milestone-20s',
		source: require('@/assets/audio/20-seconds.m4a'),
		category: 'milestone',
		durationMs: 1500,
		description: '20 seconden',
	},
	'milestone-30s': {
		id: 'milestone-30s',
		source: require('@/assets/audio/30-seconds.m4a'),
		category: 'milestone',
		durationMs: 1500,
		description: '30 seconden',
	},
	'milestone-40s': {
		id: 'milestone-40s',
		source: require('@/assets/audio/40-seconds.m4a'),
		category: 'milestone',
		durationMs: 1500,
		description: '40 seconden',
	},
	// UI sounds
	'countdown-beep': {
		id: 'countdown-beep',
		source: require('@/assets/audio/ui/countdown-beep.mp3'),
		category: 'ui',
		durationMs: 1000,
		description: 'Countdown pieptoon',
	},
	'debug-ping': {
		id: 'debug-ping',
		source: require('@/assets/audio/ui/debug-beep.mp3'),
		category: 'ui',
		durationMs: 1000,
		description: 'Debug pieptoon voor timing verificatie',
	},
	// Backup/full sequence
	'breath-hold-full': {
		id: 'breath-hold-full',
		source: require('@/assets/audio/breath-hold-full.m4a'),
		category: 'exercise',
		durationMs: 30000,
		description: 'Volledige ademhalingsoefening sequentie',
	},
	// Deprecated (kept for backwards compatibility, pointing to new files)
	'inhale-exhale': {
		id: 'inhale-exhale',
		source: require('@/assets/audio/inhale.m4a'),
		category: 'exercise',
		durationMs: 2000,
		description: 'Adem diep in en adem weer uit (deprecated)',
	},
	'and-again': {
		id: 'and-again',
		source: require('@/assets/audio/inhale.m4a'),
		category: 'exercise',
		durationMs: 2000,
		description: 'En nog een keer (deprecated)',
	},
	'inhale-deeply': {
		id: 'inhale-deeply',
		source: require('@/assets/audio/inhale-deep.m4a'),
		category: 'exercise',
		durationMs: 2000,
		description: 'Adem diep in (deprecated)',
	},
	'breathing-prep-phase-1': {
		id: 'breathing-prep-phase-1',
		source: require('@/assets/audio/inhale.m4a'),
		category: 'exercise',
		durationMs: 7000,
		description: 'Eerste oefeningsademhaling (deprecated)',
	},
	'breathing-prep-phase-2': {
		id: 'breathing-prep-phase-2',
		source: require('@/assets/audio/inhale.m4a'),
		category: 'exercise',
		durationMs: 7000,
		description: 'Tweede oefeningsademhaling (deprecated)',
	},
	'breathing-prep-phase-3': {
		id: 'breathing-prep-phase-3',
		source: require('@/assets/audio/inhale-deep.m4a'),
		category: 'exercise',
		durationMs: 5000,
		description: 'Laatste inademen en vasthouden (deprecated)',
	},
};

/**
 * Milestone timing map - maps elapsed milliseconds to milestone audio IDs
 */
export const MILESTONE_TIMINGS: Record<number, AudioId> = {
	10000: 'milestone-10s',
	20000: 'milestone-20s',
	30000: 'milestone-30s',
	40000: 'milestone-40s',
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
