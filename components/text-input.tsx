import React, { ReactNode } from 'react';
import {
  StyleSheet,
  Text,
  TextInput as RNTextInput,
  View,
  type TextInputProps as RNTextInputProps,
  type KeyboardTypeOptions,
} from 'react-native';
import { Colors, Fonts } from '@/constants/theme';

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
    height: 76,
    gap: 3,
  },
  label: {
    fontFamily: Fonts.semiBold,
    fontSize: 12,
    lineHeight: 12,
    color: Colors.light.text,
  },
  inputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    borderWidth: 1,
    borderColor: Colors.light.text,
    borderRadius: 10,
    overflow: 'hidden',
  },
  input: {
    flex: 1,
    height: 48,
    paddingHorizontal: 16,
    fontFamily: Fonts.semiBold,
    fontSize: 16,
    lineHeight: 16,
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
    height: 48,
    backgroundColor: Colors.light.primaryMuted,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
});
