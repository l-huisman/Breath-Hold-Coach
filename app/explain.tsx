import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export default function ExplainScreen() {
    return (
        <SafeAreaView style={styles.safeArea} edges={['top']}>
            <ThemedView style={styles.container}>
                <ThemedText type="title">Uitleg DIBH</ThemedText>
                <ThemedText>
                    Deep Inspiration Breath Hold (DIBH) is een techniek waarbij je diep inademt
                    en je adem inhoudt tijdens de behandeling.
                </ThemedText>
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
        gap: 16,
    },
});

