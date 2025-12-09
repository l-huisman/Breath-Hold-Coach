// filepath: /Users/lh/Documents/School/HBO/HBO 2526/Minor App Design & Development/Frontend Development/Breath-Hold-Coach/app/explain/_layout.tsx
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Slot } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BackButton } from '@/components/back-button';
import { Navbar } from '@/components/navbar';
import { Colors } from '@/constants/theme';

/**
 * Layout for the explain section.
 * Includes custom back button header and bottom navigation.
 */
export default function ExplainLayout() {
    const insets = useSafeAreaInsets();

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            {/* Back Button */}
            <View style={styles.backButtonContainer}>
                <BackButton />
            </View>

            {/* Screen Content */}
            <View style={styles.content}>
                <Slot />
            </View>

            {/* Bottom Navigation */}
            <Navbar />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.light.background,
    },
    backButtonContainer: {
        paddingHorizontal: 8,
        paddingTop: 4,
    },
    content: {
        flex: 1,
    },
});
