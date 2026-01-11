import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Colors } from '@/constants/theme';

/**
 * Props for ProgressDots component
 */
export interface ProgressDotsProps {
	/** Total number of steps in the wizard */
	totalSteps: number;
	/** Current step (0-based index) */
	currentStep: number;
	/** Accessibility label announcing progress (e.g., "Stap 2 van 3") */
	accessibilityLabel: string;
}

/**
 * Progress indicator showing current position in multi-step wizard flow.
 * Displays horizontal row of dots: filled for current/completed, outline for upcoming.
 *
 * Visual: ● ● ○  (showing step 2 of 3)
 *
 * @example
 * <ProgressDots
 *   totalSteps={3}
 *   currentStep={1}
 *   accessibilityLabel="Stap 2 van 3"
 * />
 */
export function ProgressDots({ totalSteps, currentStep, accessibilityLabel }: ProgressDotsProps) {
	return (
		<View
			style={styles.container}
			accessibilityRole="progressbar"
			accessibilityLabel={accessibilityLabel}
			accessibilityValue={{
				min: 1,
				max: totalSteps,
				now: currentStep + 1,
			}}
		>
			{Array.from({ length: totalSteps }).map((_, index) => {
				const isFilled = index <= currentStep;
				return (
					<View
						key={index}
						style={[styles.dot, isFilled ? styles.dotFilled : styles.dotEmpty]}
						accessibilityElementsHidden={true}
					/>
				);
			})}
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		gap: 12,
		paddingVertical: 8,
	},
	dot: {
		width: 12,
		height: 12,
		borderRadius: 6,
	},
	dotFilled: {
		backgroundColor: Colors.light.primary,
	},
	dotEmpty: {
		borderWidth: 2,
		borderColor: Colors.light.primary,
		backgroundColor: 'transparent',
	},
});
