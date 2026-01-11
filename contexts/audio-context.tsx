/**
 * Audio context for managing audio playback throughout the practice module.
 * Provides centralized audio state management and AudioPlayer instance lifecycle.
 *
 * Uses expo-audio (SDK 54+) instead of deprecated expo-av.
 */

import React, { createContext, useContext, useState, useCallback, useRef, useEffect, ReactNode } from 'react';
import { createAudioPlayer, setAudioModeAsync } from 'expo-audio';
import type { AudioPlayer, AudioStatus } from 'expo-audio';
import { AUDIO_MANIFEST } from '@/constants/audio';
import { AudioId } from '@/types/audio';

/**
 * Audio context value interface
 * Matches AudioService interface from types/audio.ts
 */
interface AudioContextValue {
	play: (audioId: AudioId) => Promise<void>;
	playSequence: (audioIds: AudioId[]) => Promise<void>;
	pause: () => Promise<void>;
	resume: () => Promise<void>;
	stop: () => Promise<void>;
	replay: () => Promise<void>;
	isPlaying: boolean;
	currentAudioId: AudioId | null;
	error: string | null;
}

const AudioContext = createContext<AudioContextValue | undefined>(undefined);

interface AudioProviderProps {
	children: ReactNode;
}

/**
 * Audio provider component
 * Manages audio playback state and AudioPlayer instances for the practice module
 */
export function AudioProvider({ children }: AudioProviderProps) {
	const [isPlaying, setIsPlaying] = useState(false);
	const [currentAudioId, setCurrentAudioId] = useState<AudioId | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [queue, setQueue] = useState<AudioId[]>([]);

	// Use ref to avoid re-renders when AudioPlayer instance changes
	const playerRef = useRef<AudioPlayer | null>(null);
	const lastPlayedAudioIdRef = useRef<AudioId | null>(null);
	const queueRef = useRef<AudioId[]>([]);
	const playAudioRef = useRef<((audioId: AudioId) => Promise<void>) | null>(null);
	const statusSubscriptionRef = useRef<{ remove: () => void } | null>(null);

	// Sync queueRef with queue state
	useEffect(() => {
		queueRef.current = queue;
	}, [queue]);

	// Initialize audio mode on mount
	useEffect(() => {
		const initializeAudio = async () => {
			try {
				await setAudioModeAsync({
					playsInSilentMode: true, // Critical: Medical app needs audio in silent mode
					shouldRouteThroughEarpiece: false,
				});
			} catch (error) {
				console.error('Failed to initialize audio mode:', (error as Error).message);
			}
		};

		initializeAudio();

		// Cleanup on unmount
		return () => {
			if (statusSubscriptionRef.current) {
				statusSubscriptionRef.current.remove();
				statusSubscriptionRef.current = null;
			}
			if (playerRef.current) {
				playerRef.current.release();
				playerRef.current = null;
			}
		};
	}, []);

	/**
	 * Handle audio status updates
	 * Called when audio player status changes
	 */
	const handleStatusChange = useCallback((status: AudioStatus) => {
		setIsPlaying(status.playing);

		// Handle sequence: play next audio when current finishes
		if (status.didJustFinish) {
			// Release finished player
			if (statusSubscriptionRef.current) {
				statusSubscriptionRef.current.remove();
				statusSubscriptionRef.current = null;
			}
			if (playerRef.current) {
				playerRef.current.release();
				playerRef.current = null;
			}

			// Play next in queue if available
			const currentQueue = queueRef.current;
			if (currentQueue.length > 0) {
				const nextAudioId = currentQueue[0];
				setQueue((q) => q.slice(1));
				// Use ref to avoid circular dependency
				if (playAudioRef.current) {
					playAudioRef.current(nextAudioId);
				}
			} else {
				setCurrentAudioId(null);
			}
		}
	}, []);

	/**
	 * Internal function to play a single audio file
	 * @param audioId - Audio ID to play
	 */
	const playAudio = useCallback(async (audioId: AudioId) => {
		try {
			setError(null);

			// Validate audio exists in manifest
			const audioMetadata = AUDIO_MANIFEST[audioId];
			if (!audioMetadata) {
				throw new Error(`Audio ID "${audioId}" not found in manifest`);
			}

			// Release previous player if exists
			if (statusSubscriptionRef.current) {
				statusSubscriptionRef.current.remove();
				statusSubscriptionRef.current = null;
			}
			if (playerRef.current) {
				playerRef.current.release();
				playerRef.current = null;
			}

			// Create new audio player with the source using createAudioPlayer
			const player = createAudioPlayer(audioMetadata.source);

			// Subscribe to status updates
			statusSubscriptionRef.current = player.addListener('playbackStatusUpdate', handleStatusChange);

			// Store player reference
			playerRef.current = player;
			setCurrentAudioId(audioId);
			lastPlayedAudioIdRef.current = audioId;

			// Start playback
			player.play();
			setIsPlaying(true);
		} catch (error) {
			console.error('Audio playback failed:', (error as Error).message);
			setError('Audio kon niet worden afgespeeld');
			setIsPlaying(false);
			setCurrentAudioId(null);

			// Graceful degradation: Clear queue on error
			setQueue([]);
		}
	}, [handleStatusChange]);

	// Store playAudio in ref for use in handleStatusChange
	useEffect(() => {
		playAudioRef.current = playAudio;
	}, [playAudio]);

	/**
	 * Play a single audio file
	 * Stops any currently playing audio and clears queue
	 */
	const play = useCallback(async (audioId: AudioId) => {
		// Clear queue when explicitly playing single audio
		setQueue([]);
		await playAudio(audioId);
	}, [playAudio]);

	/**
	 * Play a sequence of audio files
	 * Audio files play one after another
	 */
	const playSequence = useCallback(async (audioIds: AudioId[]) => {
		if (audioIds.length === 0) {
			return;
		}

		// Set queue (excluding first audio which plays immediately)
		setQueue(audioIds.slice(1));

		// Play first audio
		await playAudio(audioIds[0]);
	}, [playAudio]);

	/**
	 * Pause current audio playback
	 */
	const pause = useCallback(async () => {
		try {
			if (playerRef.current) {
				playerRef.current.pause();
				setIsPlaying(false);
			}
		} catch (error) {
			console.error('Failed to pause audio:', (error as Error).message);
			setError('Audio kon niet worden gepauzeerd');
		}
	}, []);

	/**
	 * Resume paused audio playback
	 */
	const resume = useCallback(async () => {
		try {
			if (playerRef.current) {
				playerRef.current.play();
				setIsPlaying(true);
			}
		} catch (error) {
			console.error('Failed to resume audio:', (error as Error).message);
			setError('Audio kon niet worden hervat');
		}
	}, []);

	/**
	 * Stop current audio playback and clear queue
	 */
	const stop = useCallback(async () => {
		try {
			if (statusSubscriptionRef.current) {
				statusSubscriptionRef.current.remove();
				statusSubscriptionRef.current = null;
			}
			if (playerRef.current) {
				playerRef.current.release();
				playerRef.current = null;
			}
			setIsPlaying(false);
			setCurrentAudioId(null);
			setQueue([]);
		} catch (error) {
			console.error('Failed to stop audio:', (error as Error).message);
			setError('Audio kon niet worden gestopt');
		}
	}, []);

	/**
	 * Replay the last played audio
	 */
	const replay = useCallback(async () => {
		const lastAudioId = lastPlayedAudioIdRef.current;
		if (lastAudioId) {
			await play(lastAudioId);
		}
	}, [play]);

	const value: AudioContextValue = {
		play,
		playSequence,
		pause,
		resume,
		stop,
		replay,
		isPlaying,
		currentAudioId,
		error,
	};

	return <AudioContext.Provider value={value}>{children}</AudioContext.Provider>;
}

/**
 * Custom hook to access audio context
 * @throws Error if used outside AudioProvider
 */
export function useAudio() {
	const context = useContext(AudioContext);
	if (context === undefined) {
		throw new Error('useAudio must be used within AudioProvider');
	}
	return context;
}
