import React, {ReactNode} from 'react';
import {
    type KeyboardTypeOptions,
    Platform,
    StyleSheet,
    Text,
    TextInput as RNTextInput,
    type TextInputProps as RNTextInputProps,
    View,
} from 'react-native';
import {Colors, Fonts} from '@/constants/theme';

export interface TextInputProps extends Omit<RNTextInputProps, 'style'> {
    /**
     * Label text displayed above the input field
     */
    label: string;
    /**
     * Current value of the input
     */
    value: string;
    /**
     * Callback when text changes
     */
    onChangeText: (text: string) => void;
    /**
     * Placeholder text shown when input is empty
     */
    placeholder?: string;
    /**
     * Optional icon displayed on the right side
     */
    icon?: ReactNode;
    /**
     * Keyboard type for the input
     */
    keyboardType?: KeyboardTypeOptions;
    /**
     * Auto-capitalization behavior
     */
    autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
    /**
     * Whether the input is editable
     */
    editable?: boolean;
}

export function TextInput({
                              label,
                              value,
                              onChangeText,
                              placeholder = '',
                              icon,
                              keyboardType = 'default',
                              autoCapitalize = 'sentences',
                              editable = true,
                              ...rest
                          }: TextInputProps) {
    const isFilled = value.length > 0;

    return (
        <View style={styles.container}>
            {/* Label */}
            <Text style={styles.label}>{label}</Text>

            {/* Input Container */}
            <View style={styles.inputContainer}>
                {/* Text Input */}
                <RNTextInput
                    style={[
                        styles.input,
                        isFilled ? styles.inputFilled : styles.inputUnfilled,
                        !editable && styles.inputDisabled,
                    ]}
                    value={value}
                    onChangeText={onChangeText}
                    placeholder={placeholder}
                    placeholderTextColor={Colors.light.textMuted}
                    keyboardType={keyboardType}
                    autoCapitalize={autoCapitalize}
                    editable={editable}
                    accessibilityLabel={label}
                    accessibilityHint={editable ? `Voer ${label.toLowerCase()} in` : `${label} is niet aanpasbaar`}
                    {...rest}
                />

                {/* Icon Container */}
                {icon && (
                    <View style={styles.iconContainer}>
                        {icon}
                    </View>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
        // let the label size itself; give some vertical spacing
        paddingVertical: 6,
    },
    label: {
        fontFamily: Fonts.semiBold,
        fontSize: 12,
        lineHeight: 16,
        color: Colors.light.text,
        marginBottom: 6,
    },
    inputContainer: {
        height: 52, // fixed row height for consistent vertical centering
        flexDirection: 'row',
        alignItems: 'center', // vertical centering
        borderWidth: 1,
        borderColor: Colors.light.text,
        borderRadius: 10,
        overflow: 'hidden',
    },
    input: {
        flex: 1,
        height: '100%',
        paddingHorizontal: 16,
        fontFamily: Fonts.semiBold,
        fontSize: 16,
        lineHeight: 20,
        // ensure vertical centering on Android
        textAlignVertical: Platform.OS === 'android' ? 'center' : 'auto',
    },
    inputFilled: {
        color: Colors.light.text,
    },
    inputUnfilled: {
        color: Colors.light.textMuted,
    },
    inputDisabled: {
        opacity: 0.6,
        backgroundColor: Colors.light.progressBackground,
    },
    iconContainer: {
        width: 64,
        height: '100%',
        backgroundColor: Colors.light.primaryMuted,
        justifyContent: 'center',
        alignItems: 'center',
        flexShrink: 0,
    },
});