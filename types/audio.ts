/**
 * Audio type definitions for the practice module audio service.
 * Defines audio IDs, metadata, and service interfaces.
 */

/**
 * Audio ID type - union of all available audio file identifiers
 */
export type AudioId =
	// Pre-instructions
	| 'volume-check'
	| 'mindfulness-reminder'
	| 'laying-position'
	// Breathing cues
	| 'inhale'
	| 'exhale'
	| 'inhale-deep'
	| 'hold-breath'
	| 'breath-hold-starts'
	// Milestones
	| 'milestone-10s'
	| 'milestone-20s'
	| 'milestone-30s'
	| 'milestone-40s'
	// UI
	| 'countdown-beep'
	| 'debug-ping'
	// Backup/legacy
	| 'breath-hold-full'
	// Deprecated (kept for backwards compatibility)
	| 'inhale-exhale'
	| 'and-again'
	| 'inhale-deeply'
	| 'breathing-prep-phase-1'
	| 'breathing-prep-phase-2'
	| 'breathing-prep-phase-3';

/**
 * Audio category type - organizes audio by usage context
 */
export type AudioCategory = 'pre-instruction' | 'exercise' | 'milestone' | 'ui';

/**
 * Audio metadata interface
 * Maps audio IDs to their source files and metadata
 */
export interface AudioMetadata {
	id: AudioId;
	source: any; // require() result from React Native
	category: AudioCategory;
	durationMs: number;
	description: string; // Dutch description for accessibility
}

/**
 * Audio service interface
 * Defines the public API for audio playback
 */
export interface AudioService {
	// Playback control
	play: (audioId: AudioId) => Promise<void>;
	playSequence: (audioIds: AudioId[]) => Promise<void>;
	pause: () => Promise<void>;
	resume: () => Promise<void>;
	stop: () => Promise<void>;
	replay: () => Promise<void>;

	// State
	isPlaying: boolean;
	currentAudioId: AudioId | null;
	error: string | null;
}
