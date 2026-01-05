// filepath: /Users/lh/Documents/School/HBO/HBO 2526/Minor App Design & Development/Frontend Development/Breath-Hold-Coach/app/practice/_layout.tsx
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Slot, usePathname } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BackButton } from '@/components/back-button';
import { Navbar } from '@/components/navbar';
import { Colors } from '@/constants/theme';

/**
 * Layout for the practice module.
 * Conditionally renders navigation chrome based on current route.
 * Full-screen routes (exercise, paused) have no back button or navbar.
 * Standard routes (index, ready, finish) include back button and navbar.
 */
export default function PracticeLayout() {
    const insets = useSafeAreaInsets();
    const pathname = usePathname();

    // Determine if current screen should be full-screen (no chrome)
    // Use exact pathname matching to avoid false positives
    const isFullScreen = pathname === '/practice/exercise' || pathname === '/practice/paused';

    return (
        <View style={[styles.container, { paddingTop: isFullScreen ? 0 : insets.top }]}>
            {/* Back Button - hidden on full-screen routes */}
            {!isFullScreen && (
                <View style={styles.backButtonContainer}>
                    <BackButton />
                </View>
            )}

            {/* Screen Content */}
            <View style={styles.content}>
                <Slot />
            </View>

            {/* Bottom Navigation - hidden on full-screen routes */}
            {!isFullScreen && <Navbar />}
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
