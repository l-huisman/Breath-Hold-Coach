import { AudioId } from '@/types/audio';
import { IconName } from '@/components/icon';

/**
 * Configuration interface for individual instruction steps in the pre-instructions wizard.
 * Each step represents a preparation screen before the breathing exercise begins.
 */
export interface InstructionStep {
	/** Unique identifier for the step */
	id: string;
	/** Instruction text explaining what to do (Dutch) - shown below icon */
	description: string;
	/** Optional audio file to auto-play when step is shown */
	audioId?: AudioId;
	/** SF Symbol icon to display (large, 192x192 points) */
	icon: IconName;
	/** Accessibility label for screen readers (Dutch) */
	accessibilityLabel: string;
}

/**
 * Pre-instruction steps shown in wizard flow before exercise.
 * Users progress through these steps sequentially with voice guidance.
 *
 * Flow: Volume Check → Mindfulness Reminder → Laying Position → Ready Screen
 */
export const INSTRUCTION_STEPS: InstructionStep[] = [
	{
		id: 'volume-check',
		description: 'Zet uw volume op een comfortabele hoogte zodat u deze niet meer hoeft aan te passen tijdens de oefening',
		audioId: 'volume-check',
		icon: 'speaker.wave.2.fill',
		accessibilityLabel: 'Stap 1 van 3: Volume controle. Zet uw volume op een comfortabele hoogte zodat u deze niet meer hoeft aan te passen tijdens de oefening',
	},
	{
		id: 'mindfulness-reminder',
		description: 'Heb je de mindfulness oefening al gedaan? Dit helpt om tot rust te komen voor de ademhalingsoefening',
		audioId: 'mindfulness-reminder',
		icon: 'brain.head.profile',
		accessibilityLabel: 'Stap 2 van 3: Mindfulness herinnering. Heb je de mindfulness oefening al gedaan? Dit helpt om tot rust te komen voor de ademhalingsoefening',
	},
	{
		id: 'laying-position',
		description: 'Ga comfortabel liggen op uw rug en plaats uw telefoon zodra de oefening van start gaat op uw borstkas',
		audioId: 'laying-position',
		icon: 'figure.mind.and.body',
		accessibilityLabel: 'Stap 3 van 3: Liggende positie. Ga comfortabel liggen op uw rug en plaats uw telefoon zodra de oefening van start gaat op uw borstkas',
	},
];
