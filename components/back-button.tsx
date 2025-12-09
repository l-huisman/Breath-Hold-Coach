// filepath: /Users/lh/Documents/School/HBO/HBO 2526/Minor App Design & Development/Frontend Development/Breath-Hold-Coach/components/back-button.tsx
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { Icon } from '@/components/icon';
import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';

interface BackButtonProps {
    /** Custom label for the back button (default: "Terug") */
    label?: string;
    /** Custom onPress handler (default: router.back()) */
    onPress?: () => void;
}

/**
 * A custom back button component with icon and label.
 * Designed for accessibility with adequate touch target for users aged 50-75.
 */
export const BackButton = ({ label = 'Terug', onPress }: BackButtonProps) => {
    const handlePress = () => {
        if (onPress) {
            onPress();
        } else {
            router.back();
        }
    };

    return (
        <Pressable
            style={({ pressed }) => [
                styles.container,
                pressed && styles.pressed,
            ]}
            onPress={handlePress}
            accessibilityRole="button"
            accessibilityLabel={`${label}, ga terug`}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
            <View style={styles.iconContainer}>
                <Icon name="chevron.left" size={24} color={Colors.light.primary} />
            </View>
            <ThemedText style={styles.label}>{label}</ThemedText>
        </Pressable>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingVertical: 8,
        paddingRight: 16,
    },
    pressed: {
        opacity: 0.7,
    },
    iconContainer: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    label: {
        fontSize: 16,
        color: Colors.light.primary,
        fontWeight: '500',
    },
});

