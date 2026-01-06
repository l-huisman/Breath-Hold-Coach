/**
 * Audio context for managing audio playback throughout the practice module.
 * Provides centralized audio state management and Sound instance lifecycle.
 */

import React, { createContext, useContext, useState, useCallback, useRef, useEffect, ReactNode } from 'react';
import { Audio, AVPlaybackStatus } from 'expo-av';
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
 * Manages audio playback state and Sound instances for the practice module
 */
export function AudioProvider({ children }: AudioProviderProps) {
	const [isPlaying, setIsPlaying] = useState(false);
	const [currentAudioId, setCurrentAudioId] = useState<AudioId | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [queue, setQueue] = useState<AudioId[]>([]);

	// Use ref to avoid re-renders when Sound instance changes
	const soundRef = useRef<Audio.Sound | null>(null);
	const lastPlayedAudioIdRef = useRef<AudioId | null>(null);

	// Initialize audio mode on mount
	useEffect(() => {
		const initializeAudio = async () => {
			try {
				await Audio.setAudioModeAsync({
					playsInSilentModeIOS: true, // Critical: Medical app needs audio in silent mode
					staysActiveInBackground: false, // Don't play audio when app is backgrounded
					shouldDuckAndroid: true, // Lower other apps' audio when playing
				});
			} catch (error) {
				console.error('Failed to initialize audio mode:', (error as Error).message);
			}
		};

		initializeAudio();

		// Cleanup on unmount
		return () => {
			if (soundRef.current) {
				soundRef.current.unloadAsync().catch((error) => {
					console.error('Failed to unload sound on unmount:', (error as Error).message);
				});
			}
		};
	}, []);

	/**
	 * Playback status update callback
	 * Handles sequence playback and state updates
	 */
	const onPlaybackStatusUpdate = useCallback((status: AVPlaybackStatus) => {
		if (!status.isLoaded) {
			setIsPlaying(false);
			return;
		}

		setIsPlaying(status.isPlaying);

		// Handle sequence: play next audio when current finishes
		if (status.didJustFinish) {
			// Unload finished sound
			if (soundRef.current) {
				soundRef.current.unloadAsync().catch((error) => {
					console.error('Failed to unload finished sound:', (error as Error).message);
				});
				soundRef.current = null;
			}

			// Play next in queue if available
			if (queue.length > 0) {
				const nextAudioId = queue[0];
				setQueue((q) => q.slice(1));
				playAudio(nextAudioId);
			} else {
				setCurrentAudioId(null);
			}
		}
	}, [queue]);

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

			// Unload previous sound if exists
			if (soundRef.current) {
				await soundRef.current.unloadAsync();
				soundRef.current = null;
			}

			// Load and play new sound
			const { sound } = await Audio.Sound.createAsync(
				audioMetadata.source,
				{ shouldPlay: true },
				onPlaybackStatusUpdate
			);

			soundRef.current = sound;
			setCurrentAudioId(audioId);
			lastPlayedAudioIdRef.current = audioId;
			setIsPlaying(true);
		} catch (error) {
			console.error('Audio playback failed:', (error as Error).message);
			setError('Audio kon niet worden afgespeeld');
			setIsPlaying(false);
			setCurrentAudioId(null);

			// Graceful degradation: Clear queue on error
			setQueue([]);
		}
	}, [onPlaybackStatusUpdate]);

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
			if (soundRef.current) {
				await soundRef.current.pauseAsync();
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
			if (soundRef.current) {
				await soundRef.current.playAsync();
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
			if (soundRef.current) {
				await soundRef.current.stopAsync();
				await soundRef.current.unloadAsync();
				soundRef.current = null;
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
