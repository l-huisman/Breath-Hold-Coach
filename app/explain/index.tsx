import { useCallback } from 'react';
import { StyleSheet, FlatList, View } from 'react-native';
import { router } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { ExplanationCard } from '@/components/explanation-card';
import { EXPLANATION_TOPICS, ExplanationTopic } from '@/constants/explanation-topics';
import { Colors } from '@/constants/theme';

export default function ExplainScreen() {
    const renderItem = useCallback(({ item }: { item: ExplanationTopic }) => (
        <ExplanationCard
            title={item.title}
            description={item.description}
            iconName={item.iconName}
            onPress={() => {
                router.push(`/explain/${item.id}`);
            }}
        />
    ), []);

    const keyExtractor = useCallback((item: ExplanationTopic) => item.id, []);

    const ItemSeparator = useCallback(() => <View style={styles.separator} />, []);

    const ListHeader = useCallback(() => (
        <View style={styles.header}>
            <ThemedText type="title" accessibilityRole="header">
                Uitleg DIBH
            </ThemedText>
            <ThemedText style={styles.headerDescription}>
                Leer meer over de Deep Inspiration Breath Hold techniek en hoe u zich kunt voorbereiden op uw behandeling.
            </ThemedText>
        </View>
    ), []);

    return (
        <ThemedView style={styles.container}>
            <FlatList
                data={EXPLANATION_TOPICS}
                renderItem={renderItem}
                keyExtractor={keyExtractor}
                ItemSeparatorComponent={ItemSeparator}
                ListHeaderComponent={ListHeader}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                accessibilityRole="list"
                accessibilityLabel="Uitleg onderwerpen over DIBH"
            />
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    listContent: {
        padding: 20,
        paddingBottom: 40,
    },
    header: {
        marginBottom: 24,
        gap: 8,
    },
    headerDescription: {
        fontSize: 16,
        lineHeight: 24,
        color: Colors.light.textMuted,
    },
    separator: {
        height: 12,
    },
});
