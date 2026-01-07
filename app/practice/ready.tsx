/**
 * Ready confirmation screen before starting the exercise.
 * Matches Figma design with wave circles background.
 * Tap anywhere on screen to proceed to breathing preparation.
 */

import React, { useEffect } from 'react';
import { StyleSheet, View, Pressable } from 'react-native';
import { router } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { BreathingCircle } from '@/components/breathing-circle';
import { Colors, Fonts } from '@/constants/theme';
import { usePracticeSession } from '@/contexts/practice-session-context';

export default function PracticeReadyScreen() {
	const { setReady } = usePracticeSession();

	// Transition to ready state on mount
	useEffect(() => {
		setReady();
	}, [setReady]);

	const handleStart = () => {
		// Navigate to breathing preparation
		router.replace('/practice/preparation' as any);
	};

	return (
		<Pressable
			style={styles.container}
			onPress={handleStart}
			accessibilityRole="button"
			accessibilityLabel="Klaar om te beginnen"
			accessibilityHint="Tik ergens op het scherm om de oefening te starten"
		>
			{/* Wave circles background - static (not animated) */}
			<View style={styles.circleContainer}>
				<BreathingCircle phase="exhale" />

				{/* Red accent circle */}
				<View style={styles.accentCircle} />
			</View>

			{/* Center text */}
			<View style={styles.textContainer}>
				<ThemedText
					style={styles.readyText}
					accessibilityRole="header"
				>
					Klaar?
				</ThemedText>
			</View>

			{/* Bottom instruction */}
			<View style={styles.bottomContainer}>
				<ThemedText style={styles.bottomText}>
					Tik ergens op het scherm om te pauzeren
				</ThemedText>
			</View>
		</Pressable>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#97DDF4', // Light cyan from Figma
	},
	circleContainer: {
		position: 'absolute',
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		justifyContent: 'center',
		alignItems: 'center',
	},
	accentCircle: {
		position: 'absolute',
		width: 208,
		height: 208,
		borderRadius: 104,
		borderWidth: 3,
		borderColor: Colors.light.accent, // Red accent
		backgroundColor: 'transparent',
	},
	textContainer: {
		position: 'absolute',
		top: '50%',
		left: '50%',
		transform: [{ translateX: -104 }, { translateY: -12 }], // Center the text
		width: 208,
	},
	readyText: {
		fontSize: 24,
		fontFamily: Fonts.semiBold,
		color: Colors.light.text,
		textAlign: 'center',
	},
	bottomContainer: {
		position: 'absolute',
		bottom: 120, // Above navigation bar
		left: 0,
		right: 0,
		paddingHorizontal: 24,
	},
	bottomText: {
		fontSize: 16,
		fontFamily: Fonts.semiBold,
		color: Colors.light.text,
		textAlign: 'center',
	},
});
