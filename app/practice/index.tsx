// filepath: /Users/lh/Documents/School/HBO/HBO 2526/Minor App Design & Development/Frontend Development/Breath-Hold-Coach/app/practice/index.tsx
import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/button';
import { Icon, IconName } from '@/components/icon';
import { Colors, Fonts } from '@/constants/theme';

interface InstructionItemProps {
    icon: IconName;
    text: string;
}

function InstructionItem({ icon, text }: InstructionItemProps) {
    return (
        <View style={styles.instructionItem}>
            <View style={styles.iconContainer}>
                <Icon name={icon} size={32} color={Colors.light.primary} />
            </View>
            <ThemedText style={styles.instructionText}>{text}</ThemedText>
        </View>
    );
}

/**
 * Pre-instructions entry screen for practice module.
 * Provides preparatory information before starting the exercise.
 */
export default function PracticeIndexScreen() {
    const handleContinue = () => {
        router.push('/practice/ready' as any);
    };

    return (
        <SafeAreaView style={styles.safeArea} edges={['top']}>
            <ThemedView style={styles.container}>
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Header */}
                    <ThemedText
                        type="title"
                        style={styles.header}
                        accessibilityRole="header"
                    >
                        Oefening DIBH
                    </ThemedText>

                    {/* Instructions */}
                    <View style={styles.instructionsContainer}>
                        <InstructionItem
                            icon="person.fill"
                            text="Zoek een rustige plek zonder afleiding"
                        />
                        <InstructionItem
                            icon="house.fill"
                            text="Ga comfortabel zitten of staan"
                        />
                        <InstructionItem
                            icon="play.fill"
                            text="Zorg dat je geluid aan hebt staan"
                        />
                        <InstructionItem
                            icon="checkmark"
                            text="Volg de instructies en pauzeer indien nodig"
                        />
                    </View>

                    {/* Spacer */}
                    <View style={styles.spacer} />

                    {/* Continue Button */}
                    <Button
                        onPress={handleContinue}
                        accessibilityLabel="Ik ben klaar, ga naar volgende stap"
                        accessibilityHint="Tik om door te gaan naar de oefening"
                    >
                        Ik ben klaar
                    </Button>
                </ScrollView>
            </ThemedView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
    },
    container: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        padding: 20,
        gap: 24,
    },
    header: {
        fontSize: 28,
        fontFamily: Fonts.bold,
        color: Colors.light.text,
        textAlign: 'center',
        marginBottom: 8,
    },
    instructionsContainer: {
        gap: 20,
    },
    instructionItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 16,
    },
    iconContainer: {
        width: 32,
        height: 32,
        justifyContent: 'center',
        alignItems: 'center',
        flexShrink: 0,
    },
    instructionText: {
        flex: 1,
        fontSize: 16,
        fontFamily: Fonts.regular,
        color: Colors.light.text,
        lineHeight: 24,
    },
    spacer: {
        flex: 1,
    },
});
