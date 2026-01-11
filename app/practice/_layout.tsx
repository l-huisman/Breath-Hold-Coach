// filepath: /Users/lh/Documents/School/HBO/HBO 2526/Minor App Design & Development/Frontend Development/Breath-Hold-Coach/app/practice/_layout.tsx
import React, { useCallback } from 'react';
import { StyleSheet, View } from 'react-native';
import { Slot, usePathname } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BackButton } from '@/components/back-button';
import { Navbar } from '@/components/navbar';
import { Colors } from '@/constants/theme';
import { PracticeSessionProvider, SessionResults } from '@/contexts/practice-session-context';
import { AudioProvider } from '@/contexts/audio-context';
import { useUser } from '@/contexts/user-context';

/**
 * Layout for the practice module.
 * Conditionally renders navigation chrome based on current route.
 * Full-screen routes (exercise, paused) have no back button or navbar.
 * Standard routes (index, ready, finish) include back button and navbar.
 */
export default function PracticeLayout() {
    const insets = useSafeAreaInsets();
    const pathname = usePathname();
    const { updateProgress, progress } = useUser();

    // Determine if current screen should be full-screen (no chrome)
    // Use exact pathname matching to avoid false positives
    // Full-screen routes: ready, preparation, exercise, paused, finish
    const isFullScreen =
        pathname === '/practice/ready' ||
        pathname === '/practice/preparation' ||
        pathname === '/practice/exercise' ||
        pathname === '/practice/paused' ||
        pathname === '/practice/finish';

    // Handle session completion callback
    // NOTE: Includes 'progress' in dependencies to ensure fresh data.
    // This causes callback recreation on progress updates, but acceptable because:
    // - Progress updates are infrequent (only on session completion)
    // - Fresh progress data is critical for accurate streak calculation
    const handleSessionComplete = useCallback((results: SessionResults) => {
        if (!results.wasCompleted) return; // Don't save abandoned sessions

        const today = new Date().toISOString().split('T')[0];
        const lastPractice = progress.lastPracticeDate;

        // Calculate day streak
        let newStreakDays = 1;
        if (lastPractice) {
            const lastDate = new Date(lastPractice);
            const todayDate = new Date(today);
            const diffDays = Math.floor((todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));

            if (diffDays === 0) {
                // Same day - maintain streak
                newStreakDays = progress.streakDays;
            } else if (diffDays === 1) {
                // Next day - increment streak
                newStreakDays = progress.streakDays + 1;
            } else {
                // Gap > 1 day - reset to 1
                newStreakDays = 1;
            }
        }

        // Update user progress
        updateProgress({
            currentBreathHold: Math.max(progress.currentBreathHold, results.breathHoldDuration),
            completedExercises: progress.completedExercises + 1,
            lastPracticeDate: today,
            streakDays: newStreakDays,
        });
    }, [updateProgress, progress]);

    return (
        <PracticeSessionProvider onSessionComplete={handleSessionComplete}>
            <AudioProvider>
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
            </AudioProvider>
        </PracticeSessionProvider>
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
