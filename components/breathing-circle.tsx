/**
 * BreathingCircle Component
 * Animated concentric circles that expand and contract to guide breathing rhythm.
 * Based on Figma wave animation design with 5 concentric circles.
 */

import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
	useSharedValue,
	useAnimatedStyle,
	withTiming,
	Easing,
} from 'react-native-reanimated';
import { Colors } from '@/constants/theme';

export interface BreathingCircleProps {
	/**
	 * Current breathing phase
	 * - inhale: Circles expand outward
	 * - exhale: Circles contract inward
	 * - hold: Circles stay at current size
	 */
	phase: 'inhale' | 'exhale' | 'hold';
}

/**
 * BreathingCircle - Animated concentric circles for breathing guidance
 *
 * Design specs from Figma:
 * - 5 concentric circles with different base sizes
 * - Smallest: 200px, largest: 600px when fully expanded
 * - Smooth expansion/contraction over 3.5 seconds
 * - Primary blue color with opacity variations for depth
 */
export function BreathingCircle({ phase }: BreathingCircleProps) {
	// Shared value for scale animation (0.33 = 200px, 1.0 = 600px)
	const scale = useSharedValue(0.33);

	// React to phase changes with smooth animation
	useEffect(() => {
		const animationConfig = {
			duration: 3500,
			easing: Easing.inOut(Easing.ease),
		};

		switch (phase) {
			case 'inhale':
				// Expand to full size
				scale.value = withTiming(1.0, animationConfig);
				break;
			case 'exhale':
				// Contract to small size
				scale.value = withTiming(0.33, animationConfig);
				break;
			case 'hold':
				// Stay at current size (no animation)
				break;
		}
	}, [phase, scale]);

	// Animated style for all circles
	const animatedStyle = useAnimatedStyle(() => ({
		transform: [{ scale: scale.value }],
	}));

	return (
		<View style={styles.container}>
			{/* 5 concentric circles - largest to smallest */}
			<Animated.View
				style={[styles.circle, styles.circle1, animatedStyle]}
				accessibilityElementsHidden
			/>
			<Animated.View
				style={[styles.circle, styles.circle2, animatedStyle]}
				accessibilityElementsHidden
			/>
			<Animated.View
				style={[styles.circle, styles.circle3, animatedStyle]}
				accessibilityElementsHidden
			/>
			<Animated.View
				style={[styles.circle, styles.circle4, animatedStyle]}
				accessibilityElementsHidden
			/>
			<Animated.View
				style={[styles.circle, styles.circle5, animatedStyle]}
				accessibilityElementsHidden
			/>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		width: 600,
		height: 600,
		justifyContent: 'center',
		alignItems: 'center',
		position: 'relative',
	},
	circle: {
		position: 'absolute',
		borderRadius: 9999,
		backgroundColor: Colors.light.primary,
	},
	// Largest circle (600px)
	circle1: {
		width: 600,
		height: 600,
		opacity: 0.1,
	},
	// Second largest (475px)
	circle2: {
		width: 475,
		height: 475,
		opacity: 0.15,
	},
	// Middle circle (375px)
	circle3: {
		width: 375,
		height: 375,
		opacity: 0.2,
	},
	// Second smallest (275px)
	circle4: {
		width: 275,
		height: 275,
		opacity: 0.3,
	},
	// Smallest circle (200px)
	circle5: {
		width: 200,
		height: 200,
		opacity: 0.4,
	},
});
