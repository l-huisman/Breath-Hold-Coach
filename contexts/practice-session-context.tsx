import React, { createContext, useContext, useReducer, useCallback, ReactNode } from 'react';

// ============================================================================
// State Types
// ============================================================================

export type SessionState =
	| 'idle'            // Default state, session not started
	| 'pre-instructions' // User viewing pre-instructions (index.tsx)
	| 'ready'           // Ready confirmation screen (ready.tsx)
	| 'exercise'        // Active exercise in progress (exercise.tsx)
	| 'paused'          // Exercise paused (paused.tsx)
	| 'finished';       // Exercise completed (finish.tsx)

export type ExercisePhase =
	| 'idle'            // Not exercising
	| 'inhale'          // User instructed to inhale
	| 'exhale'          // User instructed to exhale
	| 'hold';           // User holding breath

// ============================================================================
// Session State Interface
// ============================================================================

export interface PracticeSessionState {
	// Primary session state
	currentState: SessionState;

	// Pre-instructions tracking (for future wizard - Issue #46)
	currentInstructionIndex: number;       // 0-based index, -1 if not in instructions
	instructionsSkipped: boolean;          // true if user skipped instructions

	// Exercise phase tracking
	exercisePhase: ExercisePhase;          // Current breathing phase

	// Breath hold timing
	breathHoldStartTime: Date | null;      // Timestamp when hold started
	breathHoldDuration: number;            // Duration in seconds (best hold)

	// Exercise progress
	breathingCyclesCompleted: number;      // Number of inhale-exhale-hold cycles

	// Session metadata
	sessionStartTime: Date | null;         // When session started (pre-instructions or ready)
	sessionEndTime: Date | null;           // When session finished
	wasCompleted: boolean;                 // true if finished normally, false if abandoned
}

// ============================================================================
// Session Results (passed to onSessionComplete callback)
// ============================================================================

export interface SessionResults {
	breathHoldDuration: number;            // Best breath hold in seconds
	breathingCyclesCompleted: number;      // Number of cycles completed
	totalSessionDuration: number;          // Total time from start to finish (seconds)
	wasCompleted: boolean;                 // true if finished, false if abandoned
	completionDate: Date;                  // When session ended
}

// ============================================================================
// Context Type
// ============================================================================

export interface PracticeSessionContextType {
	// State
	session: PracticeSessionState;

	// Session lifecycle
	startSession: () => void;              // Transitions to 'pre-instructions'
	setReady: () => void;                  // Transitions to 'ready'
	startExercise: () => void;             // Transitions to 'exercise', sets sessionStartTime
	finishExercise: () => void;            // Transitions to 'finished', invokes callback
	abandonSession: () => void;            // Transitions to 'finished' with wasCompleted=false
	resetSession: () => void;              // Returns to 'idle', clears all state

	// Pre-instructions
	nextInstruction: () => void;           // Increments currentInstructionIndex
	previousInstruction: () => void;       // Decrements currentInstructionIndex
	skipInstructions: () => void;          // Sets instructionsSkipped=true, transitions to 'ready'

	// Exercise control
	setExercisePhase: (phase: ExercisePhase) => void;  // Updates current phase
	startBreathHold: () => void;           // Sets breathHoldStartTime to now, phase to 'hold'
	endBreathHold: () => void;             // Calculates duration, increments cycle
	pauseExercise: () => void;             // Transitions to 'paused'
	resumeExercise: () => void;            // Transitions back to 'exercise'

	// Computed properties
	getCurrentBreathHoldDuration: () => number;  // Real-time duration if holding
}

// ============================================================================
// Provider Props
// ============================================================================

export interface PracticeSessionProviderProps {
	children: ReactNode;
	onSessionComplete?: (results: SessionResults) => void;  // Optional callback
}

// ============================================================================
// State Machine - Valid Transitions
// ============================================================================

const VALID_TRANSITIONS: Record<SessionState, SessionState[]> = {
	'idle': ['pre-instructions'],
	'pre-instructions': ['ready', 'idle'],  // ready or abandon
	'ready': ['exercise', 'pre-instructions'], // start or go back
	'exercise': ['paused', 'finished'],
	'paused': ['exercise', 'finished'],     // resume or abandon
	'finished': ['idle'],                    // reset only
};

function isValidTransition(from: SessionState, to: SessionState): boolean {
	return VALID_TRANSITIONS[from]?.includes(to) ?? false;
}

// ============================================================================
// Default State
// ============================================================================

const defaultState: PracticeSessionState = {
	currentState: 'idle',
	currentInstructionIndex: -1,
	instructionsSkipped: false,
	exercisePhase: 'idle',
	breathHoldStartTime: null,
	breathHoldDuration: 0,
	breathingCyclesCompleted: 0,
	sessionStartTime: null,
	sessionEndTime: null,
	wasCompleted: false,
};

// ============================================================================
// Reducer Actions
// ============================================================================

type Action =
	| { type: 'START_SESSION' }
	| { type: 'SET_READY' }
	| { type: 'START_EXERCISE' }
	| { type: 'FINISH_EXERCISE' }
	| { type: 'ABANDON_SESSION' }
	| { type: 'RESET_SESSION' }
	| { type: 'NEXT_INSTRUCTION' }
	| { type: 'PREVIOUS_INSTRUCTION' }
	| { type: 'SKIP_INSTRUCTIONS' }
	| { type: 'SET_EXERCISE_PHASE'; payload: ExercisePhase }
	| { type: 'START_BREATH_HOLD' }
	| { type: 'END_BREATH_HOLD' }
	| { type: 'PAUSE_EXERCISE' }
	| { type: 'RESUME_EXERCISE' };

// ============================================================================
// Reducer Function
// ============================================================================

function practiceSessionReducer(state: PracticeSessionState, action: Action): PracticeSessionState {
	switch (action.type) {
		case 'START_SESSION': {
			if (!isValidTransition(state.currentState, 'pre-instructions')) {
				console.warn(`Invalid transition: ${state.currentState} -> pre-instructions`);
				return state;
			}
			return {
				...state,
				currentState: 'pre-instructions',
				currentInstructionIndex: 0,
				sessionStartTime: new Date(),
			};
		}

		case 'SET_READY': {
			if (!isValidTransition(state.currentState, 'ready')) {
				console.warn(`Invalid transition: ${state.currentState} -> ready`);
				return state;
			}
			return {
				...state,
				currentState: 'ready',
			};
		}

		case 'START_EXERCISE': {
			if (!isValidTransition(state.currentState, 'exercise')) {
				console.warn(`Invalid transition: ${state.currentState} -> exercise`);
				return state;
			}
			return {
				...state,
				currentState: 'exercise',
				exercisePhase: 'inhale',
				sessionStartTime: state.sessionStartTime || new Date(),
			};
		}

		case 'FINISH_EXERCISE': {
			if (!isValidTransition(state.currentState, 'finished')) {
				console.warn(`Invalid transition: ${state.currentState} -> finished`);
				return state;
			}
			return {
				...state,
				currentState: 'finished',
				exercisePhase: 'idle',
				sessionEndTime: new Date(),
				wasCompleted: true,
			};
		}

		case 'ABANDON_SESSION': {
			if (!isValidTransition(state.currentState, 'finished')) {
				console.warn(`Invalid transition: ${state.currentState} -> finished (abandon)`);
				return state;
			}
			return {
				...state,
				currentState: 'finished',
				exercisePhase: 'idle',
				sessionEndTime: new Date(),
				wasCompleted: false,
			};
		}

		case 'RESET_SESSION': {
			if (!isValidTransition(state.currentState, 'idle')) {
				console.warn(`Invalid transition: ${state.currentState} -> idle`);
				return state;
			}
			// Explicitly reset all fields including breath hold data (like END_BREATH_HOLD does)
			// Use spread to create new object reference for proper re-renders
			return {
				...defaultState,
				breathHoldStartTime: null,
				breathHoldDuration: 0,
			};
		}

		case 'NEXT_INSTRUCTION': {
			if (state.currentState !== 'pre-instructions') {
				console.warn('nextInstruction called but not in pre-instructions state');
				return state;
			}
			return {
				...state,
				currentInstructionIndex: state.currentInstructionIndex + 1,
			};
		}

		case 'PREVIOUS_INSTRUCTION': {
			if (state.currentState !== 'pre-instructions') {
				console.warn('previousInstruction called but not in pre-instructions state');
				return state;
			}
			// Don't go below 0
			if (state.currentInstructionIndex <= 0) {
				return state;
			}
			return {
				...state,
				currentInstructionIndex: state.currentInstructionIndex - 1,
			};
		}

		case 'SKIP_INSTRUCTIONS': {
			if (state.currentState !== 'pre-instructions') {
				console.warn('skipInstructions called but not in pre-instructions state');
				return state;
			}
			if (!isValidTransition(state.currentState, 'ready')) {
				console.warn(`Invalid transition: ${state.currentState} -> ready`);
				return state;
			}
			return {
				...state,
				currentState: 'ready',
				instructionsSkipped: true,
			};
		}

		case 'SET_EXERCISE_PHASE': {
			if (state.currentState !== 'exercise') {
				console.warn('setExercisePhase called but not in exercise state');
				return state;
			}
			return {
				...state,
				exercisePhase: action.payload,
			};
		}

		case 'START_BREATH_HOLD': {
			if (state.currentState !== 'exercise') {
				console.warn('startBreathHold called but not in exercise state');
				return state;
			}
			return {
				...state,
				exercisePhase: 'hold',
				breathHoldStartTime: new Date(),
			};
		}

		case 'END_BREATH_HOLD': {
			if (state.currentState !== 'exercise') {
				console.warn('endBreathHold called but not in exercise state');
				return state;
			}

			// Calculate duration if hold was started
			let duration = state.breathHoldDuration;
			if (state.breathHoldStartTime) {
				const endTime = new Date();
				const holdDuration = Math.floor((endTime.getTime() - state.breathHoldStartTime.getTime()) / 1000);
				// Keep best (longest) duration
				duration = Math.max(duration, holdDuration);
			}

			return {
				...state,
				exercisePhase: 'idle',
				breathHoldStartTime: null,
				breathHoldDuration: duration,
				breathingCyclesCompleted: state.breathingCyclesCompleted + 1,
			};
		}

		case 'PAUSE_EXERCISE': {
			if (!isValidTransition(state.currentState, 'paused')) {
				console.warn(`Invalid transition: ${state.currentState} -> paused`);
				return state;
			}
			return {
				...state,
				currentState: 'paused',
			};
		}

		case 'RESUME_EXERCISE': {
			if (!isValidTransition(state.currentState, 'exercise')) {
				console.warn(`Invalid transition: ${state.currentState} -> exercise`);
				return state;
			}
			return {
				...state,
				currentState: 'exercise',
			};
		}

		default:
			return state;
	}
}

// ============================================================================
// Context
// ============================================================================

const PracticeSessionContext = createContext<PracticeSessionContextType | undefined>(undefined);

// ============================================================================
// Provider Component
// ============================================================================

export function PracticeSessionProvider({ children, onSessionComplete }: PracticeSessionProviderProps) {
	const [session, dispatch] = useReducer(practiceSessionReducer, defaultState);

	// Session lifecycle methods
	const startSession = useCallback(() => {
		dispatch({ type: 'START_SESSION' });
	}, []);

	const setReady = useCallback(() => {
		dispatch({ type: 'SET_READY' });
	}, []);

	const startExercise = useCallback(() => {
		dispatch({ type: 'START_EXERCISE' });
	}, []);

	const finishExercise = useCallback(() => {
		// Calculate results BEFORE dispatching to avoid stale state
		const totalSessionDuration = session.sessionStartTime
			? Math.floor((new Date().getTime() - session.sessionStartTime.getTime()) / 1000)
			: 0;

		const results: SessionResults = {
			breathHoldDuration: session.breathHoldDuration,
			breathingCyclesCompleted: session.breathingCyclesCompleted,
			totalSessionDuration,
			wasCompleted: true,
			completionDate: new Date(),
		};

		// Dispatch state change
		dispatch({ type: 'FINISH_EXERCISE' });

		// Invoke callback if provided (after dispatch)
		if (onSessionComplete) {
			onSessionComplete(results);
		}
	}, [session, onSessionComplete]);

	const abandonSession = useCallback(() => {
		dispatch({ type: 'ABANDON_SESSION' });
		// Don't invoke callback for abandoned sessions
	}, []);

	const resetSession = useCallback(() => {
		dispatch({ type: 'RESET_SESSION' });
	}, []);

	// Pre-instructions methods
	const nextInstruction = useCallback(() => {
		dispatch({ type: 'NEXT_INSTRUCTION' });
	}, []);

	const previousInstruction = useCallback(() => {
		dispatch({ type: 'PREVIOUS_INSTRUCTION' });
	}, []);

	const skipInstructions = useCallback(() => {
		dispatch({ type: 'SKIP_INSTRUCTIONS' });
	}, []);

	// Exercise control methods
	const setExercisePhase = useCallback((phase: ExercisePhase) => {
		dispatch({ type: 'SET_EXERCISE_PHASE', payload: phase });
	}, []);

	const startBreathHold = useCallback(() => {
		dispatch({ type: 'START_BREATH_HOLD' });
	}, []);

	const endBreathHold = useCallback(() => {
		dispatch({ type: 'END_BREATH_HOLD' });
	}, []);

	const pauseExercise = useCallback(() => {
		dispatch({ type: 'PAUSE_EXERCISE' });
	}, []);

	const resumeExercise = useCallback(() => {
		dispatch({ type: 'RESUME_EXERCISE' });
	}, []);

	// Computed properties
	const getCurrentBreathHoldDuration = useCallback((): number => {
		if (!session.breathHoldStartTime || session.exercisePhase !== 'hold') {
			return 0;
		}
		const now = new Date();
		return Math.floor((now.getTime() - session.breathHoldStartTime.getTime()) / 1000);
	}, [session.breathHoldStartTime, session.exercisePhase]);

	const value: PracticeSessionContextType = {
		session,
		startSession,
		setReady,
		startExercise,
		finishExercise,
		abandonSession,
		resetSession,
		nextInstruction,
		previousInstruction,
		skipInstructions,
		setExercisePhase,
		startBreathHold,
		endBreathHold,
		pauseExercise,
		resumeExercise,
		getCurrentBreathHoldDuration,
	};

	return (
		<PracticeSessionContext.Provider value={value}>
			{children}
		</PracticeSessionContext.Provider>
	);
}

// ============================================================================
// Custom Hook
// ============================================================================

export function usePracticeSession() {
	const context = useContext(PracticeSessionContext);
	if (context === undefined) {
		throw new Error('usePracticeSession must be used within a PracticeSessionProvider');
	}
	return context;
}
