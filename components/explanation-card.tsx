// filepath: /Users/lh/Documents/School/HBO/HBO 2526/Minor App Design & Development/Frontend Development/Breath-Hold-Coach/components/explanation-card.tsx
import React from 'react';
import { StyleSheet, View, Pressable } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { Icon, IconName } from '@/components/icon';
import { Colors } from '@/constants/theme';

interface ExplanationCardProps {
    /** Topic heading */
    title: string;
    /** Brief description text */
    description: string;
    /** Icon name to display */
    iconName: IconName;
    /** Optional callback when card is pressed */
    onPress?: () => void;
}

/**
 * A card component displaying an explanation topic about DIBH.
 * Layout: Icon on the left, title and description on the right.
 * Designed for accessibility with adequate text sizes and contrast for users aged 50-75.
 */
export const ExplanationCard = ({
    title,
    description,
    iconName,
    onPress,
}: ExplanationCardProps) => {
    return (
        <Pressable
            style={({ pressed }) => [
                styles.card,
                pressed && styles.cardPressed,
            ]}
            onPress={onPress}
            accessibilityRole="button"
            accessibilityLabel={`${title}. ${description}`}
            accessibilityHint="Tik voor meer informatie"
        >
            {/* Icon Container */}
            <View style={styles.iconContainer}>
                <Icon name={iconName} size={40} color={Colors.light.primary} />
            </View>

            {/* Text Content */}
            <View style={styles.textContainer}>
                <ThemedText type="subtitle" style={styles.title}>
                    {title}
                </ThemedText>
                <ThemedText style={styles.description}>
                    {description}
                </ThemedText>
            </View>

            {/* Chevron indicator */}
            <View style={styles.chevronContainer}>
                <Icon name="chevron.right" size={20} color={Colors.light.primaryMuted} />
            </View>
        </Pressable>
    );
};

const styles = StyleSheet.create({
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.light.background,
        borderRadius: 12,
        padding: 16,
        gap: 16,
        // Card shadow
        shadowColor: 'rgba(0, 0, 0, 0.1)',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 1,
        shadowRadius: 4,
        elevation: 2,
        // Border for extra visibility
        borderWidth: 1,
        borderColor: Colors.light.primaryMuted,
    },
    cardPressed: {
        opacity: 0.8,
        backgroundColor: Colors.light.cardPressedBackground,
    },
    iconContainer: {
        width: 64,
        height: 64,
        borderRadius: 12,
        backgroundColor: Colors.light.iconBackground,
        justifyContent: 'center',
        alignItems: 'center',
        flexShrink: 0,
    },
    textContainer: {
        flex: 1,
        gap: 4,
    },
    title: {
        fontSize: 18,
        fontWeight: '600',
        color: Colors.light.text,
    },
    description: {
        fontSize: 14,
        lineHeight: 20,
        color: Colors.light.textMuted,
    },
    chevronContainer: {
        flexShrink: 0,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

