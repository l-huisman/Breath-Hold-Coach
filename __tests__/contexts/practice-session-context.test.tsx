import { renderHook, act } from '@testing-library/react-native';
import {
	PracticeSessionProvider,
	usePracticeSession,
	SessionResults,
} from '@/contexts/practice-session-context';
import React from 'react';

describe('PracticeSessionContext', () => {
	// Helper wrapper component
	const wrapper = ({ children }: { children: React.ReactNode }) => (
		<PracticeSessionProvider>{children}</PracticeSessionProvider>
	);

	// ============================================================================
	// Initialization Tests
	// ============================================================================

	describe('initialization', () => {
		it('should provide default state', () => {
			const { result } = renderHook(() => usePracticeSession(), { wrapper });

			expect(result.current.session.currentState).toBe('idle');
			expect(result.current.session.currentInstructionIndex).toBe(-1);
			expect(result.current.session.instructionsSkipped).toBe(false);
			expect(result.current.session.exercisePhase).toBe('idle');
			expect(result.current.session.breathHoldStartTime).toBeNull();
			expect(result.current.session.breathHoldDuration).toBe(0);
			expect(result.current.session.breathingCyclesCompleted).toBe(0);
			expect(result.current.session.sessionStartTime).toBeNull();
			expect(result.current.session.sessionEndTime).toBeNull();
			expect(result.current.session.wasCompleted).toBe(false);
		});

		it('should throw error when used outside provider', () => {
			// Suppress console.error for this test
			const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

			expect(() => {
				renderHook(() => usePracticeSession());
			}).toThrow('usePracticeSession must be used within a PracticeSessionProvider');

			consoleSpy.mockRestore();
		});

		it('should accept optional onSessionComplete callback', () => {
			const onComplete = jest.fn();
			const wrapperWithCallback = ({ children }: { children: React.ReactNode }) => (
				<PracticeSessionProvider onSessionComplete={onComplete}>
					{children}
				</PracticeSessionProvider>
			);

			const { result } = renderHook(() => usePracticeSession(), { wrapper: wrapperWithCallback });

			expect(result.current.session.currentState).toBe('idle');
			expect(onComplete).not.toHaveBeenCalled();
		});
	});

	// ============================================================================
	// Session Lifecycle Tests
	// ============================================================================

	describe('session lifecycle', () => {
		it('should transition from idle to pre-instructions on startSession', () => {
			const { result } = renderHook(() => usePracticeSession(), { wrapper });

			act(() => {
				result.current.startSession();
			});

			expect(result.current.session.currentState).toBe('pre-instructions');
			expect(result.current.session.currentInstructionIndex).toBe(0);
			expect(result.current.session.sessionStartTime).toBeInstanceOf(Date);
		});

		it('should transition through complete flow: idle → pre-instructions → ready → exercise → finished', () => {
			const { result } = renderHook(() => usePracticeSession(), { wrapper });

			// idle → pre-instructions
			act(() => {
				result.current.startSession();
			});
			expect(result.current.session.currentState).toBe('pre-instructions');

			// pre-instructions → ready
			act(() => {
				result.current.setReady();
			});
			expect(result.current.session.currentState).toBe('ready');

			// ready → exercise
			act(() => {
				result.current.startExercise();
			});
			expect(result.current.session.currentState).toBe('exercise');
			expect(result.current.session.exercisePhase).toBe('inhale');

			// exercise → finished
			act(() => {
				result.current.finishExercise();
			});
			expect(result.current.session.currentState).toBe('finished');
			expect(result.current.session.wasCompleted).toBe(true);
			expect(result.current.session.sessionEndTime).toBeInstanceOf(Date);
		});

		it('should handle abandoned sessions (wasCompleted=false)', () => {
			const { result } = renderHook(() => usePracticeSession(), { wrapper });

			act(() => {
				result.current.startSession();
				result.current.setReady();
				result.current.startExercise();
				result.current.abandonSession();
			});

			expect(result.current.session.currentState).toBe('finished');
			expect(result.current.session.wasCompleted).toBe(false);
		});

		it('should reset to idle after resetSession', () => {
			const { result } = renderHook(() => usePracticeSession(), { wrapper });

			act(() => {
				result.current.startSession();
				result.current.setReady();
				result.current.startExercise();
				result.current.finishExercise();
				result.current.resetSession();
			});

			expect(result.current.session.currentState).toBe('idle');
			expect(result.current.session.breathHoldDuration).toBe(0);
			expect(result.current.session.breathingCyclesCompleted).toBe(0);
			expect(result.current.session.sessionStartTime).toBeNull();
		});

		it('should invoke onSessionComplete callback on finish', () => {
			const onComplete = jest.fn();
			const wrapperWithCallback = ({ children }: { children: React.ReactNode }) => (
				<PracticeSessionProvider onSessionComplete={onComplete}>
					{children}
				</PracticeSessionProvider>
			);

			const { result } = renderHook(() => usePracticeSession(), { wrapper: wrapperWithCallback });

			act(() => {
				result.current.startSession();
				result.current.setReady();
				result.current.startExercise();
				result.current.finishExercise();
			});

			expect(onComplete).toHaveBeenCalledTimes(1);
			expect(onComplete).toHaveBeenCalledWith(
				expect.objectContaining({
					wasCompleted: true,
					breathHoldDuration: expect.any(Number),
					breathingCyclesCompleted: expect.any(Number),
					totalSessionDuration: expect.any(Number),
					completionDate: expect.any(Date),
				})
			);
		});

		it('should NOT invoke callback when session is abandoned', () => {
			const onComplete = jest.fn();
			const wrapperWithCallback = ({ children }: { children: React.ReactNode }) => (
				<PracticeSessionProvider onSessionComplete={onComplete}>
					{children}
				</PracticeSessionProvider>
			);

			const { result } = renderHook(() => usePracticeSession(), { wrapper: wrapperWithCallback });

			act(() => {
				result.current.startSession();
				result.current.setReady();
				result.current.startExercise();
				result.current.abandonSession();
			});

			expect(onComplete).not.toHaveBeenCalled();
		});
	});

	// ============================================================================
	// State Transition Validation Tests
	// ============================================================================

	describe('state transition validation', () => {
		it('should prevent invalid transition from idle to finished', () => {
			const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
			const { result } = renderHook(() => usePracticeSession(), { wrapper });

			act(() => {
				result.current.finishExercise();
			});

			expect(result.current.session.currentState).toBe('idle');
			expect(consoleWarnSpy).toHaveBeenCalledWith(expect.stringContaining('Invalid transition'));

			consoleWarnSpy.mockRestore();
		});

		it('should prevent invalid transition from idle to paused', () => {
			const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
			const { result } = renderHook(() => usePracticeSession(), { wrapper });

			act(() => {
				result.current.pauseExercise();
			});

			expect(result.current.session.currentState).toBe('idle');
			expect(consoleWarnSpy).toHaveBeenCalled();

			consoleWarnSpy.mockRestore();
		});

		it('should allow valid transition from pre-instructions to ready', () => {
			const { result } = renderHook(() => usePracticeSession(), { wrapper });

			act(() => {
				result.current.startSession();
				result.current.setReady();
			});

			expect(result.current.session.currentState).toBe('ready');
		});

		it('should allow valid transition from exercise to paused', () => {
			const { result } = renderHook(() => usePracticeSession(), { wrapper });

			act(() => {
				result.current.startSession();
				result.current.setReady();
				result.current.startExercise();
				result.current.pauseExercise();
			});

			expect(result.current.session.currentState).toBe('paused');
		});

		it('should allow valid transition from paused to exercise (resume)', () => {
			const { result } = renderHook(() => usePracticeSession(), { wrapper });

			act(() => {
				result.current.startSession();
				result.current.setReady();
				result.current.startExercise();
				result.current.pauseExercise();
				result.current.resumeExercise();
			});

			expect(result.current.session.currentState).toBe('exercise');
		});

		it('should allow valid transition from paused to finished (abandon)', () => {
			const { result } = renderHook(() => usePracticeSession(), { wrapper });

			act(() => {
				result.current.startSession();
				result.current.setReady();
				result.current.startExercise();
				result.current.pauseExercise();
				result.current.abandonSession();
			});

			expect(result.current.session.currentState).toBe('finished');
			expect(result.current.session.wasCompleted).toBe(false);
		});
	});

	// ============================================================================
	// Pre-Instructions Tests
	// ============================================================================

	describe('pre-instructions', () => {
		it('should increment currentInstructionIndex on nextInstruction', () => {
			const { result } = renderHook(() => usePracticeSession(), { wrapper });

			act(() => {
				result.current.startSession();
			});

			expect(result.current.session.currentInstructionIndex).toBe(0);

			act(() => {
				result.current.nextInstruction();
			});

			expect(result.current.session.currentInstructionIndex).toBe(1);

			act(() => {
				result.current.nextInstruction();
			});

			expect(result.current.session.currentInstructionIndex).toBe(2);
		});

		it('should set instructionsSkipped=true on skipInstructions', () => {
			const { result } = renderHook(() => usePracticeSession(), { wrapper });

			act(() => {
				result.current.startSession();
				result.current.skipInstructions();
			});

			expect(result.current.session.instructionsSkipped).toBe(true);
			expect(result.current.session.currentState).toBe('ready');
		});

		it('should not allow nextInstruction outside pre-instructions state', () => {
			const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
			const { result } = renderHook(() => usePracticeSession(), { wrapper });

			act(() => {
				result.current.nextInstruction();
			});

			expect(result.current.session.currentInstructionIndex).toBe(-1);
			expect(consoleWarnSpy).toHaveBeenCalled();

			consoleWarnSpy.mockRestore();
		});
	});

	// ============================================================================
	// Exercise Phase Tests
	// ============================================================================

	describe('exercise phase', () => {
		it('should update exercisePhase on setExercisePhase', () => {
			const { result } = renderHook(() => usePracticeSession(), { wrapper });

			act(() => {
				result.current.startSession();
				result.current.setReady();
				result.current.startExercise();
			});

			expect(result.current.session.exercisePhase).toBe('inhale');

			act(() => {
				result.current.setExercisePhase('exhale');
			});

			expect(result.current.session.exercisePhase).toBe('exhale');

			act(() => {
				result.current.setExercisePhase('hold');
			});

			expect(result.current.session.exercisePhase).toBe('hold');
		});

		it('should start breath hold with timestamp and set phase to hold', () => {
			const { result } = renderHook(() => usePracticeSession(), { wrapper });

			act(() => {
				result.current.startSession();
				result.current.setReady();
				result.current.startExercise();
				result.current.startBreathHold();
			});

			expect(result.current.session.exercisePhase).toBe('hold');
			expect(result.current.session.breathHoldStartTime).toBeInstanceOf(Date);
		});

		it('should end breath hold and increment cycle count', () => {
			const { result } = renderHook(() => usePracticeSession(), { wrapper });

			act(() => {
				result.current.startSession();
				result.current.setReady();
				result.current.startExercise();
				result.current.startBreathHold();
			});

			expect(result.current.session.breathingCyclesCompleted).toBe(0);

			act(() => {
				result.current.endBreathHold();
			});

			expect(result.current.session.exercisePhase).toBe('idle');
			expect(result.current.session.breathHoldStartTime).toBeNull();
			expect(result.current.session.breathingCyclesCompleted).toBe(1);
		});

		it('should calculate and store breath hold duration', () => {
			jest.useFakeTimers();
			try {
				const { result } = renderHook(() => usePracticeSession(), { wrapper });

				act(() => {
					result.current.startSession();
					result.current.setReady();
					result.current.startExercise();
					result.current.startBreathHold();
				});

				// Advance time by 5 seconds
				act(() => {
					jest.advanceTimersByTime(5000);
				});

				act(() => {
					result.current.endBreathHold();
				});

				expect(result.current.session.breathHoldDuration).toBe(5);
			} finally {
				jest.useRealTimers();
			}
		});

		it('should keep best (longest) breath hold duration across multiple holds', async () => {
			const { result } = renderHook(() => usePracticeSession(), { wrapper });

			act(() => {
				result.current.startSession();
				result.current.setReady();
				result.current.startExercise();
			});

			// First hold: small delay
			act(() => {
				result.current.startBreathHold();
			});

			await new Promise(resolve => setTimeout(resolve, 50));

			act(() => {
				result.current.endBreathHold();
			});

			const firstDuration = result.current.session.breathHoldDuration;
			expect(firstDuration).toBeGreaterThanOrEqual(0);
			expect(result.current.session.breathingCyclesCompleted).toBe(1);

			// Second hold: longer delay
			act(() => {
				result.current.startBreathHold();
			});

			await new Promise(resolve => setTimeout(resolve, 100));

			act(() => {
				result.current.endBreathHold();
			});

			const secondDuration = result.current.session.breathHoldDuration;
			expect(secondDuration).toBeGreaterThanOrEqual(firstDuration);
			expect(result.current.session.breathingCyclesCompleted).toBe(2);

			// Third hold: shorter than second (doesn't update best)
			act(() => {
				result.current.startBreathHold();
			});

			await new Promise(resolve => setTimeout(resolve, 30));

			act(() => {
				result.current.endBreathHold();
			});

			// Best duration should remain the same as secondDuration
			expect(result.current.session.breathHoldDuration).toBe(secondDuration);
			expect(result.current.session.breathingCyclesCompleted).toBe(3);
		});
	});

	// ============================================================================
	// Pause/Resume Tests
	// ============================================================================

	describe('pause and resume', () => {
		it('should transition to paused state', () => {
			const { result } = renderHook(() => usePracticeSession(), { wrapper });

			act(() => {
				result.current.startSession();
				result.current.setReady();
				result.current.startExercise();
				result.current.pauseExercise();
			});

			expect(result.current.session.currentState).toBe('paused');
		});

		it('should resume to exercise state', () => {
			const { result } = renderHook(() => usePracticeSession(), { wrapper });

			act(() => {
				result.current.startSession();
				result.current.setReady();
				result.current.startExercise();
				result.current.pauseExercise();
				result.current.resumeExercise();
			});

			expect(result.current.session.currentState).toBe('exercise');
		});

		it('should maintain state data across pause/resume', () => {
			const { result } = renderHook(() => usePracticeSession(), { wrapper });

			act(() => {
				result.current.startSession();
				result.current.setReady();
				result.current.startExercise();
			});

			const sessionStartTime = result.current.session.sessionStartTime;

			act(() => {
				result.current.pauseExercise();
			});

			expect(result.current.session.sessionStartTime).toBe(sessionStartTime);

			act(() => {
				result.current.resumeExercise();
			});

			expect(result.current.session.sessionStartTime).toBe(sessionStartTime);
		});
	});

	// ============================================================================
	// Timer Calculation Tests
	// ============================================================================

	describe('timer calculations', () => {
		beforeEach(() => {
			jest.useFakeTimers();
		});

		afterEach(() => {
			jest.useRealTimers();
		});

		it('should calculate real-time breath hold duration', () => {
			const { result } = renderHook(() => usePracticeSession(), { wrapper });

			act(() => {
				result.current.startSession();
				result.current.setReady();
				result.current.startExercise();
				result.current.startBreathHold();
			});

			expect(result.current.getCurrentBreathHoldDuration()).toBe(0);

			// Advance time by 5 seconds
			act(() => {
				jest.advanceTimersByTime(5000);
			});

			expect(result.current.getCurrentBreathHoldDuration()).toBe(5);

			// Advance another 3 seconds
			act(() => {
				jest.advanceTimersByTime(3000);
			});

			expect(result.current.getCurrentBreathHoldDuration()).toBe(8);
		});

		it('should return 0 if not holding breath', () => {
			const { result } = renderHook(() => usePracticeSession(), { wrapper });

			act(() => {
				result.current.startSession();
				result.current.setReady();
				result.current.startExercise();
			});

			expect(result.current.getCurrentBreathHoldDuration()).toBe(0);
		});

		it('should return 0 after ending breath hold', () => {
			const { result } = renderHook(() => usePracticeSession(), { wrapper });

			act(() => {
				result.current.startSession();
				result.current.setReady();
				result.current.startExercise();
				result.current.startBreathHold();
			});

			act(() => {
				jest.advanceTimersByTime(5000);
			});

			expect(result.current.getCurrentBreathHoldDuration()).toBe(5);

			act(() => {
				result.current.endBreathHold();
			});

			expect(result.current.getCurrentBreathHoldDuration()).toBe(0);
		});
	});

	// ============================================================================
	// Callback Integration Tests
	// ============================================================================

	describe('callback integration', () => {
		it('should invoke onSessionComplete with correct results', async () => {
			const onComplete = jest.fn();
			const wrapperWithCallback = ({ children }: { children: React.ReactNode }) => (
				<PracticeSessionProvider onSessionComplete={onComplete}>
					{children}
				</PracticeSessionProvider>
			);

			const { result } = renderHook(() => usePracticeSession(), { wrapper: wrapperWithCallback });

			act(() => {
				result.current.startSession();
				result.current.setReady();
				result.current.startExercise();
				result.current.startBreathHold();
			});

			// Wait a bit for breath hold
			await new Promise(resolve => setTimeout(resolve, 50));

			// End breath hold first (separate act to update state)
			act(() => {
				result.current.endBreathHold();
			});

			// Then finish exercise (reads updated state)
			act(() => {
				result.current.finishExercise();
			});

			expect(onComplete).toHaveBeenCalledWith(
				expect.objectContaining({
					breathHoldDuration: expect.any(Number),
					breathingCyclesCompleted: 1,
					wasCompleted: true,
					completionDate: expect.any(Date),
				})
			);
			expect(onComplete.mock.calls[0][0].breathHoldDuration).toBeGreaterThanOrEqual(0);
		});

		it('should include all session metadata in callback', () => {
			const onComplete = jest.fn();
			const wrapperWithCallback = ({ children }: { children: React.ReactNode }) => (
				<PracticeSessionProvider onSessionComplete={onComplete}>
					{children}
				</PracticeSessionProvider>
			);

			const { result } = renderHook(() => usePracticeSession(), { wrapper: wrapperWithCallback });

			act(() => {
				result.current.startSession();
				result.current.setReady();
				result.current.startExercise();
				result.current.finishExercise();
			});

			const callbackArgs: SessionResults = onComplete.mock.calls[0][0];

			expect(callbackArgs).toHaveProperty('breathHoldDuration');
			expect(callbackArgs).toHaveProperty('breathingCyclesCompleted');
			expect(callbackArgs).toHaveProperty('totalSessionDuration');
			expect(callbackArgs).toHaveProperty('wasCompleted');
			expect(callbackArgs).toHaveProperty('completionDate');
		});

		it('should calculate totalSessionDuration correctly', async () => {
			const onComplete = jest.fn();
			const wrapperWithCallback = ({ children }: { children: React.ReactNode }) => (
				<PracticeSessionProvider onSessionComplete={onComplete}>
					{children}
				</PracticeSessionProvider>
			);

			const { result } = renderHook(() => usePracticeSession(), { wrapper: wrapperWithCallback });

			act(() => {
				result.current.startSession();
			});

			// Wait to accumulate > 1 second total duration
			await new Promise(resolve => setTimeout(resolve, 600));

			act(() => {
				result.current.setReady();
			});

			await new Promise(resolve => setTimeout(resolve, 300));

			act(() => {
				result.current.startExercise();
			});

			await new Promise(resolve => setTimeout(resolve, 200));

			act(() => {
				result.current.finishExercise();
			});

			const callbackArgs: SessionResults = onComplete.mock.calls[0][0];
			expect(callbackArgs.totalSessionDuration).toBeGreaterThanOrEqual(1);
		});

		it('should NOT invoke callback on abandoned sessions', () => {
			const onComplete = jest.fn();
			const wrapperWithCallback = ({ children }: { children: React.ReactNode }) => (
				<PracticeSessionProvider onSessionComplete={onComplete}>
					{children}
				</PracticeSessionProvider>
			);

			const { result } = renderHook(() => usePracticeSession(), { wrapper: wrapperWithCallback });

			act(() => {
				result.current.startSession();
				result.current.setReady();
				result.current.startExercise();
				result.current.abandonSession();
			});

			expect(onComplete).not.toHaveBeenCalled();
		});
	});
});
