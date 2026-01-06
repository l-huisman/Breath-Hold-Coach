import React from 'react';
import { View } from 'react-native';
import { render } from '@testing-library/react-native';
import { InstructionStep } from '../instruction-step';

// Mock the Icon component to avoid expo-symbols issues in tests
jest.mock('../icon', () => ({
	Icon: ({ name, size }: { name: string; size: number }) => {
		const { View, Text } = require('react-native');
		return (
			<View testID={`icon-${name}`}>
				<Text>{name}</Text>
			</View>
		);
	},
}));

// Mock ThemedText to simplify testing
jest.mock('../themed-text', () => ({
	ThemedText: ({ children, ...props }: any) => {
		const { Text } = require('react-native');
		return <Text {...props}>{children}</Text>;
	},
}));

describe('InstructionStep', () => {
	it('should render without crashing', () => {
		const { getByLabelText } = render(
			<InstructionStep
				description="Test Description"
				icon={<View />}
				accessibilityLabel="Test step"
			/>
		);
		expect(getByLabelText('Test step')).toBeTruthy();
	});

	it('should accept different accessibility labels', () => {
		const { getByLabelText } = render(
			<InstructionStep
				description="Zorg ervoor dat je geluid aan staat"
				icon={<View />}
				accessibilityLabel="Stap 1 van 3: Volume controle"
			/>
		);
		expect(getByLabelText('Stap 1 van 3: Volume controle')).toBeTruthy();
	});

	it('should render with mindfulness step label', () => {
		const { getByLabelText } = render(
			<InstructionStep
				description="Heb je de mindfulness oefening al gedaan?"
				icon={<View />}
				accessibilityLabel="Stap 2 van 3: Mindfulness herinnering"
			/>
		);
		expect(getByLabelText('Stap 2 van 3: Mindfulness herinnering')).toBeTruthy();
	});

	it('should render with position step label', () => {
		const { getByLabelText } = render(
			<InstructionStep
				description="Ga comfortabel liggen en plaats je telefoon op je borst"
				icon={<View />}
				accessibilityLabel="Stap 3 van 3: Liggende positie"
			/>
		);
		expect(getByLabelText('Stap 3 van 3: Liggende positie')).toBeTruthy();
	});

	it('should show tooltip when showTooltip is true', () => {
		const { toJSON } = render(
			<InstructionStep
				description="Test Description"
				icon={<View />}
				showTooltip={true}
				tooltipText="Tik op de luidspreker voor geluid"
				accessibilityLabel="Test step"
			/>
		);
		// Check that the tooltip text appears in the rendered JSON
		const json = JSON.stringify(toJSON());
		expect(json).toContain('Tik op de luidspreker voor geluid');
	});

	it('should not show tooltip when showTooltip is false', () => {
		const { queryByText } = render(
			<InstructionStep
				description="Test Description"
				icon={<View />}
				showTooltip={false}
				tooltipText="Tik op de luidspreker voor geluid"
				accessibilityLabel="Test step"
			/>
		);
		expect(queryByText('Tik op de luidspreker voor geluid')).toBeNull();
	});

	it('should support isPlayingAudio prop', () => {
		const { toJSON } = render(
			<InstructionStep
				description="Test Description"
				icon={<View />}
				isPlayingAudio={true}
				accessibilityLabel="Test step"
			/>
		);
		// Component should render without errors
		expect(toJSON()).toBeTruthy();
	});
});
