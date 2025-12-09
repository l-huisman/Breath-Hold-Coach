// filepath: /Users/lh/Documents/School/HBO/HBO 2526/Minor App Design & Development/Frontend Development/Breath-Hold-Coach/app/explain/[id].tsx
import { useEffect, useState, useCallback } from 'react';
import { StyleSheet, ScrollView, View, ActivityIndicator } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Icon } from '@/components/icon';
import { EXPLANATION_TOPICS } from '@/constants/explanation-topics';
import { Colors } from '@/constants/theme';

/**
 * Content structure returned from the server.
 * Will be cached locally for offline reading in the future.
 */
interface ExplanationContent {
    id: string;
    title: string;
    introduction: string;
    sections: {
        heading: string;
        body: string;
    }[];
    lastUpdated: string;
}

/**
 * Mock function to simulate fetching content from server.
 * TODO: Replace with actual API call when backend is ready.
 */
const fetchExplanationContent = async (id: string): Promise<ExplanationContent> => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));

    // Mock content based on topic ID
    const mockContent: Record<string, ExplanationContent> = {
        'what-is-dibh': {
            id: 'what-is-dibh',
            title: 'Wat is DIBH?',
            introduction: 'Deep Inspiration Breath Hold (DIBH) is een ademhalingstechniek die wordt gebruikt tijdens bestralingsbehandelingen. Bij deze techniek ademt u diep in en houdt u uw adem vast terwijl de bestraling wordt gegeven.',
            sections: [
                {
                    heading: 'Hoe werkt het?',
                    body: 'Wanneer u diep inademt, zet uw borstkas uit en beweegt uw hart weg van de borstwand. Dit vergroot de afstand tussen uw hart en het bestraalde gebied, waardoor uw hart beter beschermd wordt tegen straling.',
                },
                {
                    heading: 'Wanneer wordt DIBH gebruikt?',
                    body: 'DIBH wordt vooral toegepast bij de behandeling van linkszijdige borstkanker, omdat het hart zich aan de linkerkant van het lichaam bevindt. Door de techniek te gebruiken kan de stralingsdosis op het hart aanzienlijk worden verminderd.',
                },
                {
                    heading: 'Is het moeilijk?',
                    body: 'De meeste patiënten kunnen de techniek goed leren. Met oefening thuis kunt u zich voorbereiden op de behandeling. Deze app helpt u daarbij.',
                },
            ],
            lastUpdated: '2024-12-01',
        },
        'why-dibh': {
            id: 'why-dibh',
            title: 'Waarom DIBH?',
            introduction: 'DIBH beschermt uw hart tijdens bestraling van linkszijdige borstkanker. Dit is belangrijk voor uw gezondheid op lange termijn.',
            sections: [
                {
                    heading: 'Bescherming van het hart',
                    body: 'Straling kan schade veroorzaken aan het hart en de bloedvaten. Door DIBH te gebruiken, wordt de stralingsdosis op het hart verminderd met gemiddeld 50% of meer.',
                },
                {
                    heading: 'Lange termijn voordelen',
                    body: 'Door het hart te beschermen tijdens de behandeling verkleint u het risico op hartproblemen in de toekomst, zoals hartfalen of hartritmestoornissen.',
                },
            ],
            lastUpdated: '2024-12-01',
        },
    };

    // Return mock content or generate generic content
    if (mockContent[id]) {
        return mockContent[id];
    }

    // Generic content for topics without specific mock data
    const topic = EXPLANATION_TOPICS.find(t => t.id === id);
    return {
        id,
        title: topic?.title ?? 'Uitleg',
        introduction: 'Deze informatie wordt geladen van de server. Neem contact op met uw zorgverlener voor de meest actuele informatie.',
        sections: [
            {
                heading: 'Meer informatie',
                body: 'De volledige inhoud van dit onderwerp wordt binnenkort beschikbaar gesteld. Raadpleeg in de tussentijd uw verpleegkundige of arts voor specifieke vragen.',
            },
        ],
        lastUpdated: new Date().toISOString().split('T')[0],
    };
};

export default function ExplanationDetailScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const [content, setContent] = useState<ExplanationContent | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const topic = EXPLANATION_TOPICS.find(t => t.id === id);

    const loadContent = useCallback(async () => {
        if (!id) return;

        setIsLoading(true);
        setError(null);

        try {
            const data = await fetchExplanationContent(id);
            setContent(data);
        } catch (err) {
            console.error('Failed to load explanation content:', err);
            setError('Kon de inhoud niet laden. Controleer uw internetverbinding en probeer het opnieuw.');
        } finally {
            setIsLoading(false);
        }
    }, [id]);

    useEffect(() => {
        loadContent();
    }, [loadContent]);

    return (
        <ThemedView style={styles.container}>
            {isLoading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={Colors.light.primary} />
                    <ThemedText style={styles.loadingText}>
                        Inhoud laden...
                    </ThemedText>
                </View>
            ) : error ? (
                <View style={styles.errorContainer}>
                    <Icon name="exclamationmark.triangle.fill" size={48} color={Colors.light.accent} />
                    <ThemedText style={styles.errorText}>{error}</ThemedText>
                </View>
            ) : content ? (
                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Header with icon */}
                    <View style={styles.header}>
                        {topic && (
                            <View style={styles.iconContainer}>
                                <Icon name={topic.iconName} size={48} color={Colors.light.primary} />
                            </View>
                        )}
                        <ThemedText type="title" accessibilityRole="header">
                            {content.title}
                        </ThemedText>
                    </View>

                    {/* Introduction */}
                    <ThemedText style={styles.introduction}>
                        {content.introduction}
                    </ThemedText>

                    {/* Content sections */}
                    {content.sections.map((section, index) => (
                        <View key={index} style={styles.section}>
                            <ThemedText type="subtitle" style={styles.sectionHeading}>
                                {section.heading}
                            </ThemedText>
                            <ThemedText style={styles.sectionBody}>
                                {section.body}
                            </ThemedText>
                        </View>
                    ))}

                    {/* Last updated footer */}
                    <View style={styles.footer}>
                        <ThemedText style={styles.footerText}>
                            Laatst bijgewerkt: {content.lastUpdated}
                        </ThemedText>
                    </View>
                </ScrollView>
            ) : null}
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 16,
    },
    loadingText: {
        fontSize: 16,
        color: Colors.light.textMuted,
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 32,
        gap: 16,
    },
    errorText: {
        fontSize: 16,
        color: Colors.light.textMuted,
        textAlign: 'center',
        lineHeight: 24,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 40,
    },
    header: {
        alignItems: 'center',
        marginBottom: 24,
        gap: 16,
    },
    iconContainer: {
        width: 80,
        height: 80,
        borderRadius: 20,
        backgroundColor: Colors.light.iconBackground,
        justifyContent: 'center',
        alignItems: 'center',
    },
    introduction: {
        fontSize: 18,
        lineHeight: 28,
        color: Colors.light.text,
        marginBottom: 24,
    },
    section: {
        marginBottom: 24,
        gap: 8,
    },
    sectionHeading: {
        fontSize: 20,
        fontWeight: '600',
        color: Colors.light.text,
    },
    sectionBody: {
        fontSize: 16,
        lineHeight: 26,
        color: Colors.light.textMuted,
    },
    footer: {
        marginTop: 16,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: Colors.light.primaryMuted,
    },
    footerText: {
        fontSize: 14,
        color: Colors.light.textMuted,
        textAlign: 'center',
    },
});
