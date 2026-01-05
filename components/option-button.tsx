import React from 'react';
import {Pressable, type PressableProps, StyleSheet, Text,} from 'react-native';
import {Colors, Fonts} from '@/constants/theme';

export interface OptionButtonProps extends Omit<PressableProps, 'onPress'> {
    /**
     * Main title text of the option
     */
    title: string;
    /**
     * Optional description text providing more context
     */
    description?: string;
    /**
     * Whether this option is currently selected
     */
    selected: boolean;
    /**
     * Callback when the option is pressed
     */
    onPress: () => void;
}

export function OptionButton({
                                 title,
                                 description,
                                 selected,
                                 onPress,
                                 style,
                                 ...rest
                             }: OptionButtonProps) {
    return (
        <Pressable
            style={({pressed}) => [
                styles.button,
                selected ? styles.buttonSelected : styles.buttonUnselected,
                pressed && styles.buttonPressed,
                style as any,
            ]}
            onPress={onPress}
            accessibilityRole="button"
            accessibilityLabel={title}
            accessibilityHint={description || 'Tik om deze optie te selecteren'}
            accessibilityState={{selected}}
            {...rest}
        >
            {/* Title */}
            <Text
                style={[
                    styles.title,
                    selected ? styles.titleSelected : styles.titleUnselected,
                ]}
            >
                {title}
            </Text>

            {/* Description */}
            {description && (
                <Text
                    style={[
                        styles.description,
                        selected ? styles.descriptionSelected : styles.descriptionUnselected,
                    ]}
                >
                    {description}
                </Text>
            )}
        </Pressable>
    );
}

const styles = StyleSheet.create({
    button: {
        width: '100%',
        paddingVertical: 16,
        paddingHorizontal: 16,
        borderRadius: 10,
        gap: 16,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 4,
        borderColor: Colors.light.primary,
    },
    buttonSelected: {
        backgroundColor: Colors.light.primary,
    },
    buttonUnselected: {
        backgroundColor: Colors.light.background,
    },
    buttonPressed: {
    },
    title: {
        fontFamily: Fonts.semiBold,
        fontSize: 24,
        lineHeight: 24,
        textAlign: 'center',
        width: '100%',
    },
    titleSelected: {
        color: Colors.light.textContrast,
    },
    titleUnselected: {
        color: Colors.light.text,
    },
    description: {
        fontFamily: Fonts.semiBold,
        fontSize: 16,
        lineHeight: 16,
        textAlign: 'center',
        width: '100%',
    },
    descriptionSelected: {
        color: Colors.light.textContrast,
    },
    descriptionUnselected: {
        color: Colors.light.text,
    },
});