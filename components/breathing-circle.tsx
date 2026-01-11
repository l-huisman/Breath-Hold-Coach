/**
 * BreathingCircle Component
 * Animated concentric circles that create a continuous ripple effect to guide breathing.
 *
 * Animation behavior:
 * - 5 circles start at different sizes (200, 275, 375, 475, 600px)
 * - Each circle transforms into the next size state cyclically
 * - All animate simultaneously (no stagger)
 * - Inhale: ripple outward (200→275→375→475→600→200...)
 * - Exhale: ripple inward (reverse)
 * - Hold: freeze at current state
 * - Idle: static at initial positions
 */

import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
	useSharedValue,
	useAnimatedStyle,
	withTiming,
	withSequence,
	withRepeat,
	cancelAnimation,
	SharedValue,
	Easing,
} from 'react-native-reanimated';
import { Colors } from '@/constants/theme';

export type BreathingPhase = 'idle' | 'inhale' | 'hold' | 'exhale';

export interface BreathingCircleProps {
	/**
	 * Current breathing phase - controls animation behavior
	 */
	phase: BreathingPhase;
}

// Animation configuration
const CYCLE_DURATION = 7000; // 7 seconds for one full cycle
const NUM_STATES = 6;
const TRANSITION_DURATION = CYCLE_DURATION / (NUM_STATES - 1); // 1.4s per transition (5 animated + 1 instant reset)

// Circle states: size and opacity for each of 6 circles
const CIRCLE_STATES = [
	{ size: 200, opacity: 0.5 },   // Innermost
	{ size: 275, opacity: 0.5 },
	{ size: 375, opacity: 0.25 },
	{ size: 475, opacity: 0.15 },
	{ size: 600, opacity: 0.1 },
	{ size: 750, opacity: 0.05 },  // Outermost
];

/**
 * Animates a circle through all states in sequence, creating a continuous loop.
 *
 * @param sizeValue - Shared value for circle size
 * @param opacityValue - Shared value for circle opacity
 * @param startIndex - Initial state index (0-5)
 * @param isReverse - If true, animate in reverse (for exhale)
 */
const animateCircle = (
	sizeValue: SharedValue<number>,
	opacityValue: SharedValue<number>,
	startIndex: number,
	isReverse: boolean
) => {
	const sizeSequence = [];
	const opacitySequence = [];

	// Linear easing for continuous flow (no acceleration/deceleration per state)
	const timingConfig = {
		duration: TRANSITION_DURATION,
		easing: Easing.linear,
	};

	// Build sequence of 6 transitions (5 animated + 1 instant reset)
	for (let i = 0; i < NUM_STATES; i++) {
		// Calculate next state index based on direction
		let nextIndex;
		if (!isReverse) {
			// Forward: 0→1→2→3→4→5→0
			nextIndex = (startIndex + i + 1) % NUM_STATES;
		} else {
			// Reverse: 5→4→3→2→1→0→5
			nextIndex = (startIndex - i - 1 + NUM_STATES) % NUM_STATES;
		}

		// Reset is instant when returning to cycle boundary
		// Forward: reset when reaching innermost (0)
		// Reverse: reset when reaching outermost (5)
		const isReset = !isReverse ? nextIndex === 0 : nextIndex === NUM_STATES - 1;
		const duration = isReset ? 0 : TRANSITION_DURATION;

		sizeSequence.push(withTiming(CIRCLE_STATES[nextIndex].size, { ...timingConfig, duration }));
		opacitySequence.push(withTiming(CIRCLE_STATES[nextIndex].opacity, { ...timingConfig, duration }));
	}

	// Repeat infinitely
	sizeValue.value = withRepeat(withSequence(...sizeSequence), -1, false);
	opacityValue.value = withRepeat(withSequence(...opacitySequence), -1, false);
};

/**
 * BreathingCircle - Creates a continuous ripple effect with 6 concentric circles
 *
 * Each circle cycles through all size/opacity states to create a wave-like motion.
 * The effect resembles ripples in water, with circles continuously emanating from center.
 */
export function BreathingCircle({ phase }: BreathingCircleProps) {
	// Shared values for each circle's size
	const circle0Size = useSharedValue(CIRCLE_STATES[0].size);
	const circle1Size = useSharedValue(CIRCLE_STATES[1].size);
	const circle2Size = useSharedValue(CIRCLE_STATES[2].size);
	const circle3Size = useSharedValue(CIRCLE_STATES[3].size);
	const circle4Size = useSharedValue(CIRCLE_STATES[4].size);
	const circle5Size = useSharedValue(CIRCLE_STATES[5].size);

	// Shared values for each circle's opacity
	const circle0Opacity = useSharedValue(CIRCLE_STATES[0].opacity);
	const circle1Opacity = useSharedValue(CIRCLE_STATES[1].opacity);
	const circle2Opacity = useSharedValue(CIRCLE_STATES[2].opacity);
	const circle3Opacity = useSharedValue(CIRCLE_STATES[3].opacity);
	const circle4Opacity = useSharedValue(CIRCLE_STATES[4].opacity);
	const circle5Opacity = useSharedValue(CIRCLE_STATES[5].opacity);

	// Group into arrays for easier iteration
	const circleSizes = [circle0Size, circle1Size, circle2Size, circle3Size, circle4Size, circle5Size];
	const circleOpacities = [circle0Opacity, circle1Opacity, circle2Opacity, circle3Opacity, circle4Opacity, circle5Opacity];

	// React to phase changes
	useEffect(() => {
		if (phase === 'inhale') {
			// Animate all circles outward (ripple effect)
			circleSizes.forEach((size, index) => {
				animateCircle(size, circleOpacities[index], index, false);
			});
		} else if (phase === 'exhale') {
			// Animate all circles inward (reverse ripple)
			circleSizes.forEach((size, index) => {
				animateCircle(size, circleOpacities[index], index, true);
			});
		} else if (phase === 'hold') {
			// Freeze at current position
			circleSizes.forEach(size => cancelAnimation(size));
			circleOpacities.forEach(opacity => cancelAnimation(opacity));
		} else {
			// idle - cancel animations and reset to initial state
			circleSizes.forEach((size, index) => {
				cancelAnimation(size);
				size.value = CIRCLE_STATES[index].size;
			});
			circleOpacities.forEach((opacity, index) => {
				cancelAnimation(opacity);
				opacity.value = CIRCLE_STATES[index].opacity;
			});
		}
		// ESLint disable: circleSizes/circleOpacities are recreated each render but contain
		// stable SharedValue refs. Including in deps would restart animations every render.
		// Only phase changes should trigger this effect.
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [phase]);

	// Create animated styles for each circle
	const animatedStyle0 = useAnimatedStyle(() => ({
		width: circle0Size.value,
		height: circle0Size.value,
		opacity: circle0Opacity.value,
	}));

	const animatedStyle1 = useAnimatedStyle(() => ({
		width: circle1Size.value,
		height: circle1Size.value,
		opacity: circle1Opacity.value,
	}));

	const animatedStyle2 = useAnimatedStyle(() => ({
		width: circle2Size.value,
		height: circle2Size.value,
		opacity: circle2Opacity.value,
	}));

	const animatedStyle3 = useAnimatedStyle(() => ({
		width: circle3Size.value,
		height: circle3Size.value,
		opacity: circle3Opacity.value,
	}));

	const animatedStyle4 = useAnimatedStyle(() => ({
		width: circle4Size.value,
		height: circle4Size.value,
		opacity: circle4Opacity.value,
	}));

	const animatedStyle5 = useAnimatedStyle(() => ({
		width: circle5Size.value,
		height: circle5Size.value,
		opacity: circle5Opacity.value,
	}));

	return (
		<View style={styles.container}>
			<Animated.View
				style={[styles.circle, animatedStyle0]}
				accessibilityElementsHidden
			/>
			<Animated.View
				style={[styles.circle, animatedStyle1]}
				accessibilityElementsHidden
			/>
			<Animated.View
				style={[styles.circle, animatedStyle2]}
				accessibilityElementsHidden
			/>
			<Animated.View
				style={[styles.circle, animatedStyle3]}
				accessibilityElementsHidden
			/>
			<Animated.View
				style={[styles.circle, animatedStyle4]}
				accessibilityElementsHidden
			/>
			<Animated.View
				style={[styles.circle, animatedStyle5]}
				accessibilityElementsHidden
			/>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		width: 750,
		height: 750,
		justifyContent: 'center',
		alignItems: 'center',
	},
	circle: {
		position: 'absolute',
		borderRadius: 9999,
		backgroundColor: Colors.light.background,
	},
});
