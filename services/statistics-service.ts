/**
 * Statistics Service
 * Manages local persistence of exercise session data using AsyncStorage.
 *
 * Privacy: All data stored locally only, no PII, GDPR/AVG compliant.
 * Storage: @breathhold/exercise-history key in AsyncStorage
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

// ============================================================================
// Constants
// ============================================================================

const STORAGE_KEY = '@breathhold/exercise-history';
const MAX_SESSIONS = 100; // Limit stored sessions to prevent storage quota issues

// ============================================================================
// Type Definitions
// ============================================================================

export interface ExerciseSession {
    id: string;                    // Unique session ID (timestamp-based)
    date: string;                  // ISO date string (YYYY-MM-DD)
    startTime: string;             // ISO timestamp
    endTime: string;               // ISO timestamp
    breathHoldDuration: number;    // Seconds held (best in session)
    targetDuration: number;        // Goal at time of exercise
    wasCompleted: boolean;         // true if finished, false if abandoned
    wasSkipped: boolean;           // Were pre-instructions skipped?
}

export interface ExerciseHistory {
    sessions: ExerciseSession[];
    totalSessions: number;
    completedSessions: number;
    averageHoldDuration: number;
    bestHoldDuration: number;
    lastSessionDate: string | null;
}

export interface ExerciseStatistics {
    totalSessions: number;
    completedSessions: number;
    averageHoldDuration: number;
    bestHoldDuration: number;
    currentStreak: number;        // Days in a row with at least one session
}

// Input type for saving a session (id is generated)
export type NewExerciseSession = Omit<ExerciseSession, 'id'>;

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Generate unique session ID based on timestamp
 */
function generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Calculate current streak (consecutive days with sessions)
 */
function calculateStreak(sessions: ExerciseSession[]): number {
    if (sessions.length === 0) return 0;

    // Sort sessions by date descending (newest first)
    const sortedSessions = [...sessions].sort((a, b) =>
        new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    // Get unique dates
    const uniqueDates = Array.from(new Set(sortedSessions.map(s => s.date))).sort((a, b) =>
        new Date(b).getTime() - new Date(a).getTime()
    );

    if (uniqueDates.length === 0) return 0;

    let streak = 1;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Check if most recent session is today or yesterday
    const mostRecent = new Date(uniqueDates[0]);
    mostRecent.setHours(0, 0, 0, 0);

    const daysDiff = Math.floor((today.getTime() - mostRecent.getTime()) / (1000 * 60 * 60 * 24));

    // Streak broken if more than 1 day gap
    if (daysDiff > 1) return 0;

    // Count consecutive days
    for (let i = 1; i < uniqueDates.length; i++) {
        const current = new Date(uniqueDates[i - 1]);
        const previous = new Date(uniqueDates[i]);
        current.setHours(0, 0, 0, 0);
        previous.setHours(0, 0, 0, 0);

        const diff = Math.floor((current.getTime() - previous.getTime()) / (1000 * 60 * 60 * 24));

        if (diff === 1) {
            streak++;
        } else {
            break;
        }
    }

    return streak;
}

/**
 * Calculate aggregate statistics from sessions
 */
function calculateAggregates(sessions: ExerciseSession[]): Omit<ExerciseHistory, 'sessions'> {
    if (sessions.length === 0) {
        return {
            totalSessions: 0,
            completedSessions: 0,
            averageHoldDuration: 0,
            bestHoldDuration: 0,
            lastSessionDate: null,
        };
    }

    const completedSessions = sessions.filter(s => s.wasCompleted).length;
    const totalHoldDuration = sessions.reduce((sum, s) => sum + s.breathHoldDuration, 0);
    const averageHoldDuration = Math.round(totalHoldDuration / sessions.length);
    const bestHoldDuration = Math.max(...sessions.map(s => s.breathHoldDuration));

    // Get most recent session date
    const sortedByDate = [...sessions].sort((a, b) =>
        new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    const lastSessionDate = sortedByDate[0]?.date || null;

    return {
        totalSessions: sessions.length,
        completedSessions,
        averageHoldDuration,
        bestHoldDuration,
        lastSessionDate,
    };
}

// ============================================================================
// Core Service Functions
// ============================================================================

/**
 * Save a new exercise session to local storage
 * Automatically prunes old sessions if limit exceeded
 */
export async function saveSession(session: NewExerciseSession): Promise<void> {
    try {
        // Generate ID for new session
        const newSession: ExerciseSession = {
            id: generateSessionId(),
            ...session,
        };

        // Load existing sessions
        const existing = await loadSessionsFromStorage();

        // Add new session
        const updatedSessions = [newSession, ...existing];

        // Prune if exceeds limit (keep most recent)
        const prunedSessions = updatedSessions
            .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())
            .slice(0, MAX_SESSIONS);

        // Save back to storage
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(prunedSessions));
    } catch (error) {
        // Log error but don't crash app
        console.error('Failed to save exercise session:', error);
        throw error;
    }
}

/**
 * Get complete exercise history with aggregates
 */
export async function getHistory(): Promise<ExerciseHistory> {
    try {
        const sessions = await loadSessionsFromStorage();
        const aggregates = calculateAggregates(sessions);

        return {
            sessions,
            ...aggregates,
        };
    } catch (error) {
        console.error('Failed to load exercise history:', error);
        // Return empty history on error
        return {
            sessions: [],
            totalSessions: 0,
            completedSessions: 0,
            averageHoldDuration: 0,
            bestHoldDuration: 0,
            lastSessionDate: null,
        };
    }
}

/**
 * Get raw sessions array (optionally limited)
 */
export async function getSessions(limit?: number): Promise<ExerciseSession[]> {
    try {
        const sessions = await loadSessionsFromStorage();

        if (limit && limit > 0) {
            return sessions.slice(0, limit);
        }

        return sessions;
    } catch (error) {
        console.error('Failed to load sessions:', error);
        return [];
    }
}

/**
 * Get aggregate statistics only
 */
export async function getStatistics(): Promise<ExerciseStatistics> {
    try {
        const sessions = await loadSessionsFromStorage();
        const aggregates = calculateAggregates(sessions);
        const currentStreak = calculateStreak(sessions);

        return {
            totalSessions: aggregates.totalSessions,
            completedSessions: aggregates.completedSessions,
            averageHoldDuration: aggregates.averageHoldDuration,
            bestHoldDuration: aggregates.bestHoldDuration,
            currentStreak,
        };
    } catch (error) {
        console.error('Failed to calculate statistics:', error);
        return {
            totalSessions: 0,
            completedSessions: 0,
            averageHoldDuration: 0,
            bestHoldDuration: 0,
            currentStreak: 0,
        };
    }
}

/**
 * Clear all exercise history (GDPR/AVG compliance)
 */
export async function clearHistory(): Promise<void> {
    try {
        await AsyncStorage.removeItem(STORAGE_KEY);
    } catch (error) {
        console.error('Failed to clear exercise history:', error);
        throw error;
    }
}

/**
 * Export all data as JSON string (user transparency)
 */
export async function exportData(): Promise<string> {
    try {
        const history = await getHistory();
        return JSON.stringify(history, null, 2);
    } catch (error) {
        console.error('Failed to export data:', error);
        return JSON.stringify({ error: 'Failed to export data' });
    }
}

// ============================================================================
// Internal Helper Functions
// ============================================================================

/**
 * Load sessions from AsyncStorage
 * Internal helper - use public API instead
 */
async function loadSessionsFromStorage(): Promise<ExerciseSession[]> {
    try {
        const data = await AsyncStorage.getItem(STORAGE_KEY);

        if (!data) {
            return [];
        }

        const parsed = JSON.parse(data);

        // Validate that it's an array
        if (!Array.isArray(parsed)) {
            console.warn('Invalid session data format, resetting to empty array');
            return [];
        }

        return parsed;
    } catch (error) {
        console.error('Failed to load sessions from storage:', error);
        return [];
    }
}
