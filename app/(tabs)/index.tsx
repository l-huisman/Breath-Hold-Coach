import {StyleSheet, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {ThemedText} from '@/components/themed-text';
import {ThemedView} from '@/components/themed-view';
import {ProgressIndicator} from '@/components/progress-indicator';
import {Icon} from '@/components/icon';
import {Button} from '@/components/button';
import {Separator} from '@/components/separator';

export default function HomeScreen() {
    return (
        <SafeAreaView style={styles.safeArea} edges={['top']}>
            <ThemedView style={styles.container}>
                <ThemedText type="title" style={styles.title}>Home</ThemedText>

                {/* Progress Indicator Examples */}
                <ThemedView style={styles.section}>
                    <ProgressIndicator
                        seconds={12}
                        maxSeconds={45}
                        label="Adem ingehouden"
                        icon={<Icon name="timer"/>}
                    />

                    <ProgressIndicator
                        seconds={30}
                        maxSeconds={45}
                        label="Ademhalingstechnieken"
                        icon={<Icon name="lungs.fill"/>}
                    />

                    <ProgressIndicator
                        seconds={45}
                        maxSeconds={45}
                        label="Voltooide oefeningen"
                        icon={<Icon name="target"/>}
                    />
                </ThemedView>

                {/* Spacer to push button to bottom */}
                <View style={styles.spacer} />

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
    section: {
        gap: 16,
    },
    spacer: {
        flex: 1,
    },
    buttonSection: {
        gap: 24,
        paddingBottom: 24,
    },
});
