import React from 'react';
import { render } from '@testing-library/react-native';
import { View } from 'react-native';
import { ProgressDots } from '../progress-dots';

describe('ProgressDots', () => {
	it('should render without crashing', () => {
		const { getByLabelText } = render(
			<ProgressDots totalSteps={3} currentStep={0} accessibilityLabel="Stap 1 van 3" />
		);
		expect(getByLabelText('Stap 1 van 3')).toBeTruthy();
	});

	it('should render correct number of View components', () => {
		const { UNSAFE_getAllByType } = render(
			<ProgressDots totalSteps={3} currentStep={0} accessibilityLabel="Stap 1 van 3" />
		);
		// Get all View components (container + 3 dots)
		const views = UNSAFE_getAllByType(View);
		expect(views.length).toBe(4);
	});

	it('should have correct accessibility label for step 1', () => {
		const { getByLabelText } = render(
			<ProgressDots totalSteps={3} currentStep={0} accessibilityLabel="Stap 1 van 3" />
		);
		expect(getByLabelText('Stap 1 van 3')).toBeTruthy();
	});

	it('should have correct accessibility label for step 2', () => {
		const { getByLabelText } = render(
			<ProgressDots totalSteps={3} currentStep={1} accessibilityLabel="Stap 2 van 3" />
		);
		expect(getByLabelText('Stap 2 van 3')).toBeTruthy();
	});

	it('should have correct accessibility label for step 3', () => {
		const { getByLabelText } = render(
			<ProgressDots totalSteps={3} currentStep={2} accessibilityLabel="Stap 3 van 3" />
		);
		expect(getByLabelText('Stap 3 van 3')).toBeTruthy();
	});
});
