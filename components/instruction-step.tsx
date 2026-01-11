import React, { ReactNode } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { Colors, Fonts } from '@/constants/theme';

/**
 * Props for InstructionStep component
 */
export interface InstructionStepProps {
	/** Main heading for the instruction (Dutch) - removed as per new design */
	title?: string;
	/** Detailed description of what user should do (Dutch) */
	description: string;
	/** Icon or image component to display at top (ReactNode supports Icon, Image, etc.) */
	icon: ReactNode;
	/** Show blue tooltip banner above icon */
	showTooltip?: boolean;
	/** Tooltip text to display */
	tooltipText?: string;
	/** Optional press handler for icon (e.g., replay audio) */
	onIconPress?: () => void;
	/** Visual feedback: if true, shows audio is playing */
	isPlayingAudio?: boolean;
	/** Accessibility label for the entire step content */
	accessibilityLabel: string;
}

/**
 * Reusable component for displaying individual instruction step content.
 * Used in pre-instructions wizard to show consistent layout for each step.
 *
 * Layout: Optional Tooltip → Icon (centered, large) → Description
 *
 * @example
 * <InstructionStep
 *   description="Zorg ervoor dat..."
 *   icon={<Icon name="speaker.wave.2.fill" size={192} />}
 *   showTooltip={true}
 *   tooltipText="Tik op de luidspreker voor geluid"
 *   onIconPress={handleReplay}
 *   accessibilityLabel="Stap 1 van 3: Volume controle"
 * />
 */
export function InstructionStep({
	description,
	icon,
	showTooltip = false,
	tooltipText,
	onIconPress,
	isPlayingAudio = false,
	accessibilityLabel,
}: InstructionStepProps) {
	const IconContainer = onIconPress ? Pressable : View;

	return (
		<View
			style={styles.container}
			accessibilityRole="text"
			accessibilityLabel={accessibilityLabel}
		>
			{/* Tooltip Banner (shown for volume check) */}
			{showTooltip && tooltipText && (
				<View style={styles.tooltip}>
					<ThemedText style={styles.tooltipText}>{tooltipText}</ThemedText>
					<View style={styles.tooltipArrow} />
				</View>
			)}

			{/* Icon Container - Pressable if onIconPress provided */}
			<IconContainer
				style={[
					styles.iconContainer,
					isPlayingAudio && styles.iconContainerPlaying,
				]}
				{...(onIconPress && {
					onPress: onIconPress,
					accessibilityRole: 'button' as const,
					accessibilityLabel: 'Herhaal audio',
					accessibilityHint: 'Tik om de instructie audio opnieuw af te spelen',
					disabled: isPlayingAudio,
				})}
			>
				{icon}
			</IconContainer>

			{/* Description */}
			<ThemedText style={styles.description}>
				{description}
			</ThemedText>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		alignItems: 'center',
		width: '100%',
	},
	tooltip: {
		backgroundColor: Colors.light.primary,
		paddingVertical: 8,
		paddingHorizontal: 16,
		borderRadius: 8,
		marginBottom: 8,
		position: 'relative',
	},
	tooltipText: {
		fontSize: 14,
		fontFamily: Fonts.medium,
		color: Colors.light.textContrast,
		textAlign: 'center',
	},
	tooltipArrow: {
		position: 'absolute',
		bottom: -6,
		left: '50%',
		marginLeft: -6,
		width: 0,
		height: 0,
		backgroundColor: 'transparent',
		borderStyle: 'solid',
		borderLeftWidth: 6,
		borderRightWidth: 6,
		borderTopWidth: 6,
		borderLeftColor: 'transparent',
		borderRightColor: 'transparent',
		borderTopColor: Colors.light.primary,
	},
	iconContainer: {
		justifyContent: 'center',
		alignItems: 'center',
		marginBottom: 20,
	},
	iconContainerPlaying: {
		opacity: 0.6,
	},
	description: {
		fontSize: 16,
		fontFamily: Fonts.regular,
		color: Colors.light.text,
		textAlign: 'center',
		lineHeight: 24,
		paddingHorizontal: 20,
	},
});
