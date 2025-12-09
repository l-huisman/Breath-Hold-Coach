// filepath: /Users/lh/Documents/School/HBO/HBO 2526/Minor App Design & Development/Frontend Development/Breath-Hold-Coach/constants/explanation-topics.ts
import { IconName } from '@/components/icon';

/**
 * Represents an explanation topic about DIBH (Deep Inspiration Breath Hold)
 */
export interface ExplanationTopic {
    /** Unique identifier for the topic */
    id: string;
    /** Topic heading in Dutch */
    title: string;
    /** Brief description in Dutch */
    description: string;
    /** Icon name to display as visual placeholder */
    iconName: IconName;
}

/**
 * Explanation topics for the DIBH technique.
 * Content is in Dutch as per app requirements.
 * Full content is fetched from server when viewing detail page.
 */
export const EXPLANATION_TOPICS: ExplanationTopic[] = [
    {
        id: 'what-is-dibh',
        title: 'Wat is DIBH en waarom?',
        description: 'Leer de basis en waarom deze techniek uw hart beschermt.',
        iconName: 'questionmark.circle.fill',
    },
    {
        id: 'how-to-practice',
        title: 'Hoe oefent u?',
        description: 'Stapsgewijze instructies en ademhalingstechnieken.',
        iconName: 'lungs.fill',
    },
    {
        id: 'practice-tips',
        title: 'Tips voor thuis',
        description: 'Handige tips om effectiever te oefenen.',
        iconName: 'house.fill',
    },
    {
        id: 'during-treatment',
        title: 'Tijdens de behandeling',
        description: 'Wat u kunt verwachten tijdens de bestraling.',
        iconName: 'timer',
    },
    {
        id: 'preparation',
        title: 'Voorbereiding',
        description: 'Hoe u zich het beste kunt voorbereiden.',
        iconName: 'leaf.fill',
    },
    {
        id: 'faq',
        title: 'Veelgestelde vragen',
        description: 'Antwoorden op veelgestelde vragen.',
        iconName: 'info.circle.fill',
    },
];

