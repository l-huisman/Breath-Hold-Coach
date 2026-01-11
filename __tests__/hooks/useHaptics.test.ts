/**
 * Tests for useHaptics hook
 * Verifies haptic patterns are triggered correctly and error handling works
 */

import { renderHook, act } from '@testing-library/react-native';
import * as Haptics from 'expo-haptics';
import { useHaptics } from '@/hooks/useHaptics';

// Mock expo-haptics
jest.mock('expo-haptics', () => ({
	ImpactFeedbackStyle: {
		Light: 'light',
		Medium: 'medium',
		Heavy: 'heavy',
	},
	NotificationFeedbackType: {
		Success: 'success',
		Warning: 'warning',
		Error: 'error',
	},
	impactAsync: jest.fn(() => Promise.resolve()),
	notificationAsync: jest.fn(() => Promise.resolve()),
}));

describe('useHaptics', () => {
	beforeEach(() => {
		// Clear all mocks before each test
		jest.clearAllMocks();
	});

	describe('initialization', () => {
		it('should return all haptic pattern functions', () => {
			const { result } = renderHook(() => useHaptics());

			expect(result.current.phaseTransition).toBeDefined();
			expect(result.current.inhale).toBeDefined();
			expect(result.current.exhale).toBeDefined();
			expect(result.current.holdStart).toBeDefined();
			expect(result.current.tick).toBeDefined();
			expect(result.current.complete).toBeDefined();
			expect(typeof result.current.phaseTransition).toBe('function');
		});

		it('should be enabled by default', () => {
			const { result } = renderHook(() => useHaptics());

			expect(result.current.isEnabled).toBe(true);
		});

		it('should provide setEnabled function', () => {
			const { result } = renderHook(() => useHaptics());

			expect(result.current.setEnabled).toBeDefined();
			expect(typeof result.current.setEnabled).toBe('function');
		});
	});

	describe('haptic patterns', () => {
		it('should trigger double medium impact for phaseTransition', async () => {
			const { result } = renderHook(() => useHaptics());

			await act(async () => {
				await result.current.phaseTransition();
			});

			// Double-pulse pattern: Medium → 100ms delay → Medium
			expect(Haptics.impactAsync).toHaveBeenCalledTimes(2);
			expect(Haptics.impactAsync).toHaveBeenNthCalledWith(1, Haptics.ImpactFeedbackStyle.Medium);
			expect(Haptics.impactAsync).toHaveBeenNthCalledWith(2, Haptics.ImpactFeedbackStyle.Medium);
		});

		it('should trigger ascending intensity for inhale', async () => {
			const { result } = renderHook(() => useHaptics());

			await act(async () => {
				await result.current.inhale();
			});

			// Ascending pattern: Light → Medium
			expect(Haptics.impactAsync).toHaveBeenCalledTimes(2);
			expect(Haptics.impactAsync).toHaveBeenNthCalledWith(1, Haptics.ImpactFeedbackStyle.Light);
			expect(Haptics.impactAsync).toHaveBeenNthCalledWith(2, Haptics.ImpactFeedbackStyle.Medium);
		});

		it('should trigger descending intensity for exhale', async () => {
			const { result } = renderHook(() => useHaptics());

			await act(async () => {
				await result.current.exhale();
			});

			// Descending pattern: Medium → Light
			expect(Haptics.impactAsync).toHaveBeenCalledTimes(2);
			expect(Haptics.impactAsync).toHaveBeenNthCalledWith(1, Haptics.ImpactFeedbackStyle.Medium);
			expect(Haptics.impactAsync).toHaveBeenNthCalledWith(2, Haptics.ImpactFeedbackStyle.Light);
		});

		it('should trigger triple heavy impact for holdStart', async () => {
			const { result } = renderHook(() => useHaptics());

			await act(async () => {
				await result.current.holdStart();
			});

			// Triple-pulse pattern: Heavy → 150ms → Heavy → 150ms → Heavy
			expect(Haptics.impactAsync).toHaveBeenCalledTimes(3);
			expect(Haptics.impactAsync).toHaveBeenNthCalledWith(1, Haptics.ImpactFeedbackStyle.Heavy);
			expect(Haptics.impactAsync).toHaveBeenNthCalledWith(2, Haptics.ImpactFeedbackStyle.Heavy);
			expect(Haptics.impactAsync).toHaveBeenNthCalledWith(3, Haptics.ImpactFeedbackStyle.Heavy);
		});

		it('should trigger double medium impact for tick', async () => {
			const { result } = renderHook(() => useHaptics());

			await act(async () => {
				await result.current.tick();
			});

			// Double-pulse pattern: Medium → 100ms delay → Medium
			expect(Haptics.impactAsync).toHaveBeenCalledTimes(2);
			expect(Haptics.impactAsync).toHaveBeenNthCalledWith(1, Haptics.ImpactFeedbackStyle.Medium);
			expect(Haptics.impactAsync).toHaveBeenNthCalledWith(2, Haptics.ImpactFeedbackStyle.Medium);
		});

		it('should trigger quadruple heavy impact for complete', async () => {
			const { result } = renderHook(() => useHaptics());

			await act(async () => {
				await result.current.complete();
			});

			// Success celebration: Heavy → 100ms → Heavy → 100ms → Heavy → 200ms → Heavy
			expect(Haptics.impactAsync).toHaveBeenCalledTimes(4);
			expect(Haptics.impactAsync).toHaveBeenNthCalledWith(1, Haptics.ImpactFeedbackStyle.Heavy);
			expect(Haptics.impactAsync).toHaveBeenNthCalledWith(2, Haptics.ImpactFeedbackStyle.Heavy);
			expect(Haptics.impactAsync).toHaveBeenNthCalledWith(3, Haptics.ImpactFeedbackStyle.Heavy);
			expect(Haptics.impactAsync).toHaveBeenNthCalledWith(4, Haptics.ImpactFeedbackStyle.Heavy);
		});
	});

	describe('enable/disable functionality', () => {
		it('should allow disabling haptics', async () => {
			const { result } = renderHook(() => useHaptics());

			act(() => {
				result.current.setEnabled(false);
			});

			expect(result.current.isEnabled).toBe(false);
		});

		it('should not trigger haptics when disabled', async () => {
			const { result } = renderHook(() => useHaptics());

			act(() => {
				result.current.setEnabled(false);
			});

			await act(async () => {
				await result.current.phaseTransition();
				await result.current.inhale();
				await result.current.complete();
			});

			// All patterns use impactAsync now (no notificationAsync)
			expect(Haptics.impactAsync).not.toHaveBeenCalled();
		});

		it('should resume haptics when re-enabled', async () => {
			const { result } = renderHook(() => useHaptics());

			act(() => {
				result.current.setEnabled(false);
			});

			await act(async () => {
				await result.current.phaseTransition();
			});

			expect(Haptics.impactAsync).not.toHaveBeenCalled();

			act(() => {
				result.current.setEnabled(true);
			});

			await act(async () => {
				await result.current.phaseTransition();
			});

			// phaseTransition is double-pulse (2 medium impacts)
			expect(Haptics.impactAsync).toHaveBeenCalledTimes(2);
			expect(Haptics.impactAsync).toHaveBeenCalledWith(Haptics.ImpactFeedbackStyle.Medium);
		});
	});

	describe('error handling', () => {
		it('should handle haptic errors gracefully', async () => {
			const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
			const mockError = new Error('Haptic not supported');

			(Haptics.impactAsync as jest.Mock).mockRejectedValueOnce(mockError);

			const { result } = renderHook(() => useHaptics());

			await act(async () => {
				await result.current.phaseTransition();
			});

			// Should not throw error
			expect(consoleWarnSpy).toHaveBeenCalledWith(
				expect.stringContaining('Haptic feedback'),
				expect.stringContaining('Haptic not supported')
			);

			consoleWarnSpy.mockRestore();
		});

		it('should continue working after error', async () => {
			const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
			const mockError = new Error('Haptic failed');

			(Haptics.impactAsync as jest.Mock).mockRejectedValueOnce(mockError);

			const { result } = renderHook(() => useHaptics());

			// First call fails (phaseTransition tries first impact, fails, stops)
			await act(async () => {
				await result.current.phaseTransition();
			});

			expect(consoleWarnSpy).toHaveBeenCalled();

			// Second call should work (inhale is Light → Medium pattern)
			await act(async () => {
				await result.current.inhale();
			});

			expect(Haptics.impactAsync).toHaveBeenCalledWith(Haptics.ImpactFeedbackStyle.Light);

			consoleWarnSpy.mockRestore();
		});
	});

	describe('multiple patterns in sequence', () => {
		it('should handle multiple haptic calls in sequence', async () => {
			const { result } = renderHook(() => useHaptics());

			await act(async () => {
				await result.current.phaseTransition(); // 2 impacts (Medium, Medium)
				await result.current.inhale();          // 2 impacts (Light, Medium)
				await result.current.exhale();          // 2 impacts (Medium, Light)
				await result.current.holdStart();       // 3 impacts (Heavy, Heavy, Heavy)
			});

			// Total: 2 + 2 + 2 + 3 = 9 impacts
			expect(Haptics.impactAsync).toHaveBeenCalledTimes(9);
		});
	});
});
