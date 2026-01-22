import {StyleSheet, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {ThemedText} from '@/components/themed-text';
import {ThemedView} from '@/components/themed-view';
import {Icon} from '@/components/icon';
import {Colors, Fonts} from '@/constants/theme';

export default function MessagesScreen() {
    return (
        <SafeAreaView style={styles.safeArea} edges={['top']}>
            <ThemedView style={styles.container}>
                <View style={styles.content}>
                    <Icon name="exclamationmark.triangle.fill" size={64} color={Colors.light.primaryMuted} />
                    <ThemedText type="title" style={styles.title}>Berichten</ThemedText>
                    <ThemedText style={styles.subtitle}>In ontwikkeling</ThemedText>
                    <ThemedText style={styles.description}>
                        Deze functie wordt binnenkort beschikbaar.
                    </ThemedText>
                </View>
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
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        alignItems: 'center',
        gap: 16,
        paddingHorizontal: 40,
    },
    title: {
        marginTop: 8,
    },
    subtitle: {
        fontSize: 18,
        fontFamily: Fonts.semiBold,
        color: Colors.light.primary,
    },
    description: {
        fontSize: 16,
        fontFamily: Fonts.regular,
        color: Colors.light.textMuted,
        textAlign: 'center',
    },
});

