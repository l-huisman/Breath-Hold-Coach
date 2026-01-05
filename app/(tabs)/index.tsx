import {Pressable, StyleSheet, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {router} from 'expo-router';
import {ThemedText} from '@/components/themed-text';
import {ThemedView} from '@/components/themed-view';
import {ProgressIndicator} from '@/components/progress-indicator';
import {Icon} from '@/components/icon';
import {Button} from '@/components/button';
import {Separator} from '@/components/separator';
import {useUser} from '@/contexts/user-context';
import {Colors, Fonts} from '@/constants/theme';

export default function HomeScreen() {
    const {user, settings, progress} = useUser();

    const handleStartPractice = () => {
        router.push('/practice');
    };

    return (
        <SafeAreaView style={styles.safeArea} edges={['top']}>
            <ThemedView style={styles.container}>

                {/* Welcome Text */}
                <ThemedText type="title" style={styles.welcome}>
                    Hallo, {user.name} 👋
                </ThemedText>

                {/* Progress Indicator */}
                <ThemedView style={styles.section}>
                    <ProgressIndicator
                        seconds={progress.currentBreathHold}
                        maxSeconds={settings.breathHoldGoal}
                        label="Adem ingehouden"
                        icon={<Icon name="target"/>}
                    />
                </ThemedView>

                {/* Start Practice Section - centered in available space */}
                <View style={styles.startPracticeSection}>
                    <Pressable
                        style={({ pressed }) => [
                            styles.startButton,
                            pressed && styles.startButtonPressed,
                        ]}
                        onPress={handleStartPractice}
                        accessibilityRole="button"
                        accessibilityLabel="Start oefenen, tik om te beginnen met de ademhalingsoefening"
                    >
                        <Icon name="play" size={64} color={Colors.light.text} />
                    </Pressable>
                    <ThemedText style={styles.startButtonLabel}>Start Oefenen</ThemedText>
                </View>

                {/* Button Section */}
                <ThemedView style={styles.buttonSection}>
                    <Separator />
                    <Button href="/explain" icon={<Icon name="graduationcap.fill" color="#F2EEEB"/>}>
                        Uitleg DIBH
                    </Button>
                </ThemedView>
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
        padding: 20,
        gap: 20,
    },
    title: {
        marginBottom: 10,
    },
    welcome: {
        // No additional margin needed, container gap handles spacing
    },
    section: {
        gap: 16,
    },
    startPracticeSection: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 16,
    },
    startButton: {
        width: 200,
        height: 200,
        borderRadius: 100,
        backgroundColor: '#93D5E8', // Light blue/turquoise from Figma
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: 'rgba(0, 0, 0, 0.15)',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 1,
        shadowRadius: 8,
        elevation: 4,
    },
    startButtonPressed: {
        opacity: 0.85,
        transform: [{ scale: 0.95 }],
    },
    startButtonLabel: {
        fontSize: 24,
        fontFamily: Fonts.semiBold,
        color: Colors.light.text,
        textAlign: 'center',
    },
    buttonSection: {
        gap: 24,
        paddingBottom: 4,
    },
});
