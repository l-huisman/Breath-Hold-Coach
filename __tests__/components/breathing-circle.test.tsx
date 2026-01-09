import React from 'react';
import { render } from '@testing-library/react-native';
import { BreathingCircle } from '@/components/breathing-circle';

// Mock react-native-reanimated
jest.mock('react-native-reanimated', () => {
	const View = require('react-native').View;

	// Create a mock Animated object
	const Animated = {
		View,
		Text: View,
		ScrollView: View,
	};

	return {
		__esModule: true,
		default: Animated,
		useSharedValue: jest.fn(() => ({ value: 0 })),
		useAnimatedStyle: jest.fn(() => ({})),
		withTiming: jest.fn((value) => value),
		withSequence: jest.fn((...args) => args[0]),
		withRepeat: jest.fn((animation) => animation),
		cancelAnimation: jest.fn(),
		Easing: {
			inOut: jest.fn((fn) => fn),
			ease: jest.fn(),
		},
	};
});

describe('BreathingCircle', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	describe('rendering', () => {
		it('should render 6 circles', () => {
			const { UNSAFE_getAllByType } = render(<BreathingCircle phase="idle" />);
			const AnimatedView = require('react-native-reanimated').default.View;
			const animatedViews = UNSAFE_getAllByType(AnimatedView);
			// Container View may be included, so check for at least 6 circles
			expect(animatedViews.length).toBeGreaterThanOrEqual(6);
		});

		it('should render successfully with idle phase', () => {
			const { UNSAFE_root } = render(<BreathingCircle phase="idle" />);
			expect(UNSAFE_root).toBeTruthy();
		});

		it('should render successfully with inhale phase', () => {
			const { UNSAFE_root } = render(<BreathingCircle phase="inhale" />);
			expect(UNSAFE_root).toBeTruthy();
		});

		it('should render successfully with exhale phase', () => {
			const { UNSAFE_root } = render(<BreathingCircle phase="exhale" />);
			expect(UNSAFE_root).toBeTruthy();
		});

		it('should render successfully with hold phase', () => {
			const { UNSAFE_root } = render(<BreathingCircle phase="hold" />);
			expect(UNSAFE_root).toBeTruthy();
		});

		it('should call animation hooks on render', () => {
			const { useSharedValue, useAnimatedStyle } = require('react-native-reanimated');

			render(<BreathingCircle phase="inhale" />);

			expect(useSharedValue).toHaveBeenCalled();
			expect(useAnimatedStyle).toHaveBeenCalled();
		});
	});

	describe('phase transitions', () => {
		it('should handle transition from idle to inhale', () => {
			const { withRepeat, withSequence } = require('react-native-reanimated');
			const { rerender } = render(<BreathingCircle phase="idle" />);

			rerender(<BreathingCircle phase="inhale" />);

			expect(withRepeat).toHaveBeenCalled();
			expect(withSequence).toHaveBeenCalled();
		});

		it('should handle transition to hold phase', () => {
			const { cancelAnimation } = require('react-native-reanimated');
			const { rerender } = render(<BreathingCircle phase="inhale" />);

			rerender(<BreathingCircle phase="hold" />);

			expect(cancelAnimation).toHaveBeenCalled();
		});

		it('should handle transition from inhale to exhale', () => {
			const { withRepeat, withSequence } = require('react-native-reanimated');
			const { rerender } = render(<BreathingCircle phase="inhale" />);

			jest.clearAllMocks(); // Clear calls from inhale
			rerender(<BreathingCircle phase="exhale" />);

			expect(withRepeat).toHaveBeenCalled();
			expect(withSequence).toHaveBeenCalled();
		});
	});
});
