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
		useSharedValue: jest.fn(() => ({ value: 0.33 })),
		useAnimatedStyle: jest.fn(() => ({})),
		withTiming: jest.fn((value) => value),
		Easing: {
			inOut: jest.fn((fn) => fn),
			ease: jest.fn(),
		},
	};
});

describe('BreathingCircle', () => {
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
