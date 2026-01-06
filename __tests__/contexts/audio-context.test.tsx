/**
 * Unit tests for AudioContext and useAudio hook
 */

import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react-native';
import { AudioProvider, useAudio } from '@/contexts/audio-context';
import { Audio } from 'expo-av';

// Mock expo-av
jest.mock('expo-av', () => {
	const mockSound = {
		playAsync: jest.fn().mockResolvedValue(undefined),
		pauseAsync: jest.fn().mockResolvedValue(undefined),
		stopAsync: jest.fn().mockResolvedValue(undefined),
		unloadAsync: jest.fn().mockResolvedValue(undefined),
		setOnPlaybackStatusUpdate: jest.fn(),
	};

	return {
		Audio: {
			Sound: {
				createAsync: jest.fn().mockResolvedValue({
					sound: mockSound,
				}),
			},
			setAudioModeAsync: jest.fn().mockResolvedValue(undefined),
		},
	};
});

// Mock audio manifest
jest.mock('@/constants/audio', () => ({
	AUDIO_MANIFEST: {
		'volume-check': {
			id: 'volume-check',
			source: { uri: 'mock://volume-check.mp3' },
			category: 'pre-instruction',
			durationMs: 1000,
			description: 'Controleer je geluidsvolume',
		},
		'inhale-exhale': {
			id: 'inhale-exhale',
			source: { uri: 'mock://inhale-exhale.mp3' },
			category: 'exercise',
			durationMs: 1000,
			description: 'Adem diep in en adem weer uit',
		},
		'and-again': {
			id: 'and-again',
			source: { uri: 'mock://and-again.mp3' },
			category: 'exercise',
			durationMs: 1000,
			description: 'En nog een keer',
		},
	},
	AUDIO_SEQUENCES: {
		breathCycle: ['inhale-exhale', 'and-again'],
	},
}));

describe('AudioContext', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	describe('AudioProvider', () => {
		it('should initialize audio mode on mount', async () => {
			renderHook(() => useAudio(), {
				wrapper: AudioProvider,
			});

			await waitFor(() => {
				expect(Audio.setAudioModeAsync).toHaveBeenCalledWith({
					playsInSilentModeIOS: true,
					staysActiveInBackground: false,
					shouldDuckAndroid: true,
				});
			});
		});

		it('should provide default state', () => {
			const { result } = renderHook(() => useAudio(), {
				wrapper: AudioProvider,
			});

			expect(result.current.isPlaying).toBe(false);
			expect(result.current.currentAudioId).toBeNull();
			expect(result.current.error).toBeNull();
		});
	});

	describe('useAudio', () => {
		it('should throw error when used outside AudioProvider', () => {
			// Suppress console.error for this test
			const originalError = console.error;
			console.error = jest.fn();

			expect(() => {
				renderHook(() => useAudio());
			}).toThrow('useAudio must be used within AudioProvider');

			console.error = originalError;
		});
	});

	describe('play', () => {
		it('should play audio file', async () => {
			const { result } = renderHook(() => useAudio(), {
				wrapper: AudioProvider,
			});

			await act(async () => {
				await result.current.play('volume-check');
			});

			expect(Audio.Sound.createAsync).toHaveBeenCalledWith(
				{ uri: 'mock://volume-check.mp3' },
				{ shouldPlay: true },
				expect.any(Function)
			);
		});

		it('should update currentAudioId when playing', async () => {
			const { result } = renderHook(() => useAudio(), {
				wrapper: AudioProvider,
			});

			await act(async () => {
				await result.current.play('volume-check');
			});

			expect(result.current.currentAudioId).toBe('volume-check');
		});

		it('should handle audio file not found', async () => {
			const { result } = renderHook(() => useAudio(), {
				wrapper: AudioProvider,
			});

			await act(async () => {
				// @ts-expect-error Testing invalid audio ID
				await result.current.play('invalid-audio-id');
			});

			expect(result.current.error).toBeTruthy();
			expect(result.current.isPlaying).toBe(false);
		});

		it('should handle playback error gracefully', async () => {
			const mockError = new Error('Playback failed');
			(Audio.Sound.createAsync as jest.Mock).mockRejectedValueOnce(mockError);

			const { result } = renderHook(() => useAudio(), {
				wrapper: AudioProvider,
			});

			await act(async () => {
				await result.current.play('volume-check');
			});

			expect(result.current.error).toBe('Audio kon niet worden afgespeeld');
			expect(result.current.isPlaying).toBe(false);
		});
	});

	describe('playSequence', () => {
		it('should play first audio immediately', async () => {
			const { result } = renderHook(() => useAudio(), {
				wrapper: AudioProvider,
			});

			await act(async () => {
				await result.current.playSequence(['inhale-exhale', 'and-again']);
			});

			expect(Audio.Sound.createAsync).toHaveBeenCalledWith(
				{ uri: 'mock://inhale-exhale.mp3' },
				{ shouldPlay: true },
				expect.any(Function)
			);
			expect(result.current.currentAudioId).toBe('inhale-exhale');
		});

		it('should handle empty sequence', async () => {
			const { result } = renderHook(() => useAudio(), {
				wrapper: AudioProvider,
			});

			await act(async () => {
				await result.current.playSequence([]);
			});

			expect(Audio.Sound.createAsync).not.toHaveBeenCalled();
		});
	});

	describe('pause', () => {
		it('should pause current audio', async () => {
			const mockSound = {
				playAsync: jest.fn().mockResolvedValue(undefined),
				pauseAsync: jest.fn().mockResolvedValue(undefined),
				stopAsync: jest.fn().mockResolvedValue(undefined),
				unloadAsync: jest.fn().mockResolvedValue(undefined),
			};

			(Audio.Sound.createAsync as jest.Mock).mockResolvedValueOnce({
				sound: mockSound,
			});

			const { result } = renderHook(() => useAudio(), {
				wrapper: AudioProvider,
			});

			await act(async () => {
				await result.current.play('volume-check');
			});

			await act(async () => {
				await result.current.pause();
			});

			expect(mockSound.pauseAsync).toHaveBeenCalled();
		});
	});

	describe('resume', () => {
		it('should resume paused audio', async () => {
			const mockSound = {
				playAsync: jest.fn().mockResolvedValue(undefined),
				pauseAsync: jest.fn().mockResolvedValue(undefined),
				stopAsync: jest.fn().mockResolvedValue(undefined),
				unloadAsync: jest.fn().mockResolvedValue(undefined),
			};

			(Audio.Sound.createAsync as jest.Mock).mockResolvedValueOnce({
				sound: mockSound,
			});

			const { result } = renderHook(() => useAudio(), {
				wrapper: AudioProvider,
			});

			await act(async () => {
				await result.current.play('volume-check');
				await result.current.pause();
				await result.current.resume();
			});

			expect(mockSound.playAsync).toHaveBeenCalledTimes(1); // Called by resume, not play
		});
	});

	describe('stop', () => {
		it('should stop and unload current audio', async () => {
			const mockSound = {
				playAsync: jest.fn().mockResolvedValue(undefined),
				pauseAsync: jest.fn().mockResolvedValue(undefined),
				stopAsync: jest.fn().mockResolvedValue(undefined),
				unloadAsync: jest.fn().mockResolvedValue(undefined),
			};

			(Audio.Sound.createAsync as jest.Mock).mockResolvedValueOnce({
				sound: mockSound,
			});

			const { result } = renderHook(() => useAudio(), {
				wrapper: AudioProvider,
			});

			await act(async () => {
				await result.current.play('volume-check');
			});

			await act(async () => {
				await result.current.stop();
			});

			expect(mockSound.stopAsync).toHaveBeenCalled();
			expect(mockSound.unloadAsync).toHaveBeenCalled();
			expect(result.current.currentAudioId).toBeNull();
		});
	});

	describe('replay', () => {
		it('should replay last played audio', async () => {
			const { result } = renderHook(() => useAudio(), {
				wrapper: AudioProvider,
			});

			await act(async () => {
				await result.current.play('volume-check');
			});

			// Clear mock to verify replay calls it again
			(Audio.Sound.createAsync as jest.Mock).mockClear();

			await act(async () => {
				await result.current.replay();
			});

			expect(Audio.Sound.createAsync).toHaveBeenCalledWith(
				{ uri: 'mock://volume-check.mp3' },
				{ shouldPlay: true },
				expect.any(Function)
			);
		});

		it('should do nothing if no audio has been played', async () => {
			const { result } = renderHook(() => useAudio(), {
				wrapper: AudioProvider,
			});

			await act(async () => {
				await result.current.replay();
			});

			expect(Audio.Sound.createAsync).not.toHaveBeenCalled();
		});
	});

	describe('cleanup', () => {
		it('should unload sound on unmount', async () => {
			const mockSound = {
				playAsync: jest.fn().mockResolvedValue(undefined),
				pauseAsync: jest.fn().mockResolvedValue(undefined),
				stopAsync: jest.fn().mockResolvedValue(undefined),
				unloadAsync: jest.fn().mockResolvedValue(undefined),
			};

			(Audio.Sound.createAsync as jest.Mock).mockResolvedValueOnce({
				sound: mockSound,
			});

			const { result, unmount } = renderHook(() => useAudio(), {
				wrapper: AudioProvider,
			});

			await act(async () => {
				await result.current.play('volume-check');
			});

			unmount();

			await waitFor(() => {
				expect(mockSound.unloadAsync).toHaveBeenCalled();
			});
		});
	});
});
