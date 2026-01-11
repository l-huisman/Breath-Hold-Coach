/**
 * Unit tests for AudioContext and useAudio hook
 */

import { renderHook, act, waitFor } from '@testing-library/react-native';
import { AudioProvider, useAudio } from '@/contexts/audio-context';

// Mock expo-audio - must use inline functions for jest.mock hoisting

jest.mock('expo-audio', () => ({
	createAudioPlayer: jest.fn(() => ({
		play: jest.fn(),
		pause: jest.fn(),
		release: jest.fn(),
		addListener: jest.fn().mockReturnValue({ remove: jest.fn() }),
	})),
	setAudioModeAsync: jest.fn().mockResolvedValue(undefined),
}));

// Get the mocked functions for assertions
const expoAudio = jest.requireMock('expo-audio');

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
	let mockPlayerInstance: {
		play: jest.Mock;
		pause: jest.Mock;
		release: jest.Mock;
		addListener: jest.Mock;
	};

	beforeEach(() => {
		jest.clearAllMocks();
		// Create fresh mock player instance for each test
		mockPlayerInstance = {
			play: jest.fn(),
			pause: jest.fn(),
			release: jest.fn(),
			addListener: jest.fn().mockReturnValue({ remove: jest.fn() }),
		};
		expoAudio.createAudioPlayer.mockReturnValue(mockPlayerInstance);
	});

	describe('AudioProvider', () => {
		it('should initialize audio mode on mount', async () => {
			renderHook(() => useAudio(), {
				wrapper: AudioProvider,
			});

			await waitFor(() => {
				expect(expoAudio.setAudioModeAsync).toHaveBeenCalledWith({
					playsInSilentMode: true,
					shouldRouteThroughEarpiece: false,
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

			expect(expoAudio.createAudioPlayer).toHaveBeenCalledWith({ uri: 'mock://volume-check.mp3' });
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
			expoAudio.createAudioPlayer.mockImplementationOnce(() => {
				throw mockError;
			});

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

			expect(expoAudio.createAudioPlayer).toHaveBeenCalledWith({ uri: 'mock://inhale-exhale.mp3' });
			expect(result.current.currentAudioId).toBe('inhale-exhale');
		});

		it('should handle empty sequence', async () => {
			const { result } = renderHook(() => useAudio(), {
				wrapper: AudioProvider,
			});

			await act(async () => {
				await result.current.playSequence([]);
			});

			expect(expoAudio.createAudioPlayer).not.toHaveBeenCalled();
		});
	});

	describe('pause', () => {
		it('should pause current audio', async () => {
			const { result } = renderHook(() => useAudio(), {
				wrapper: AudioProvider,
			});

			await act(async () => {
				await result.current.play('volume-check');
			});

			await act(async () => {
				await result.current.pause();
			});

			expect(mockPlayerInstance.pause).toHaveBeenCalled();
		});
	});

	describe('resume', () => {
		it('should resume paused audio', async () => {
			const { result } = renderHook(() => useAudio(), {
				wrapper: AudioProvider,
			});

			await act(async () => {
				await result.current.play('volume-check');
				await result.current.pause();
				await result.current.resume();
			});

			// play() is called during initial play AND during resume
			expect(mockPlayerInstance.play).toHaveBeenCalledTimes(2);
		});
	});

	describe('stop', () => {
		it('should stop and unload current audio', async () => {
			const { result } = renderHook(() => useAudio(), {
				wrapper: AudioProvider,
			});

			await act(async () => {
				await result.current.play('volume-check');
			});

			await act(async () => {
				await result.current.stop();
			});

			expect(mockPlayerInstance.release).toHaveBeenCalled();
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
			expoAudio.createAudioPlayer.mockClear();

			await act(async () => {
				await result.current.replay();
			});

			expect(expoAudio.createAudioPlayer).toHaveBeenCalledWith({ uri: 'mock://volume-check.mp3' });
		});

		it('should do nothing if no audio has been played', async () => {
			const { result } = renderHook(() => useAudio(), {
				wrapper: AudioProvider,
			});

			await act(async () => {
				await result.current.replay();
			});

			expect(expoAudio.createAudioPlayer).not.toHaveBeenCalled();
		});
	});

	describe('cleanup', () => {
		it('should unload sound on unmount', async () => {
			const { result, unmount } = renderHook(() => useAudio(), {
				wrapper: AudioProvider,
			});

			await act(async () => {
				await result.current.play('volume-check');
			});

			unmount();

			await waitFor(() => {
				expect(mockPlayerInstance.release).toHaveBeenCalled();
			});
		});
	});
});
