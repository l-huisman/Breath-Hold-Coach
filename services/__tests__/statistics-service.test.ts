/**
 * Tests for Statistics Service
 * Verifies AsyncStorage operations, calculations, and error handling
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import {
    saveSession,
    getHistory,
    getSessions,
    getStatistics,
    clearHistory,
    exportData,
    ExerciseSession,
    NewExerciseSession,
} from '../statistics-service';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
}));

const mockAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;

describe('StatisticsService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('saveSession', () => {
        it('should save a new session with generated ID', async () => {
            mockAsyncStorage.getItem.mockResolvedValue(null);
            mockAsyncStorage.setItem.mockResolvedValue();

            const newSession: NewExerciseSession = {
                date: '2026-01-11',
                startTime: '2026-01-11T10:00:00Z',
                endTime: '2026-01-11T10:05:00Z',
                breathHoldDuration: 35,
                targetDuration: 40,
                wasCompleted: true,
                wasSkipped: false,
            };

            await saveSession(newSession);

            expect(mockAsyncStorage.setItem).toHaveBeenCalledTimes(1);

            const savedData = JSON.parse(mockAsyncStorage.setItem.mock.calls[0][1]);
            expect(savedData).toHaveLength(1);
            expect(savedData[0]).toMatchObject(newSession);
            expect(savedData[0].id).toBeDefined();
            expect(savedData[0].id).toMatch(/^session_\d+_/);
        });

        it('should append to existing sessions', async () => {
            const existingSessions: ExerciseSession[] = [
                {
                    id: 'session_1',
                    date: '2026-01-10',
                    startTime: '2026-01-10T10:00:00Z',
                    endTime: '2026-01-10T10:05:00Z',
                    breathHoldDuration: 30,
                    targetDuration: 40,
                    wasCompleted: true,
                    wasSkipped: false,
                },
            ];

            mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(existingSessions));
            mockAsyncStorage.setItem.mockResolvedValue();

            const newSession: NewExerciseSession = {
                date: '2026-01-11',
                startTime: '2026-01-11T10:00:00Z',
                endTime: '2026-01-11T10:05:00Z',
                breathHoldDuration: 35,
                targetDuration: 40,
                wasCompleted: true,
                wasSkipped: false,
            };

            await saveSession(newSession);

            const savedData = JSON.parse(mockAsyncStorage.setItem.mock.calls[0][1]);
            expect(savedData).toHaveLength(2);
        });

        it('should handle storage errors gracefully', async () => {
            mockAsyncStorage.getItem.mockRejectedValue(new Error('Storage error'));
            mockAsyncStorage.setItem.mockRejectedValue(new Error('Save error'));

            const newSession: NewExerciseSession = {
                date: '2026-01-11',
                startTime: '2026-01-11T10:00:00Z',
                endTime: '2026-01-11T10:05:00Z',
                breathHoldDuration: 35,
                targetDuration: 40,
                wasCompleted: true,
                wasSkipped: false,
            };

            // Should throw error when setItem fails (load error is handled gracefully with empty array)
            await expect(saveSession(newSession)).rejects.toThrow('Save error');
        });
    });

    describe('getHistory', () => {
        it('should return empty history when no sessions', async () => {
            mockAsyncStorage.getItem.mockResolvedValue(null);

            const history = await getHistory();

            expect(history).toEqual({
                sessions: [],
                totalSessions: 0,
                completedSessions: 0,
                averageHoldDuration: 0,
                bestHoldDuration: 0,
                lastSessionDate: null,
            });
        });

        it('should calculate aggregates correctly', async () => {
            const sessions: ExerciseSession[] = [
                {
                    id: 'session_1',
                    date: '2026-01-10',
                    startTime: '2026-01-10T10:00:00Z',
                    endTime: '2026-01-10T10:05:00Z',
                    breathHoldDuration: 30,
                    targetDuration: 40,
                    wasCompleted: true,
                    wasSkipped: false,
                },
                {
                    id: 'session_2',
                    date: '2026-01-11',
                    startTime: '2026-01-11T10:00:00Z',
                    endTime: '2026-01-11T10:05:00Z',
                    breathHoldDuration: 40,
                    targetDuration: 40,
                    wasCompleted: true,
                    wasSkipped: false,
                },
                {
                    id: 'session_3',
                    date: '2026-01-11',
                    startTime: '2026-01-11T15:00:00Z',
                    endTime: '2026-01-11T15:05:00Z',
                    breathHoldDuration: 20,
                    targetDuration: 40,
                    wasCompleted: false,
                    wasSkipped: true,
                },
            ];

            mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(sessions));

            const history = await getHistory();

            expect(history.totalSessions).toBe(3);
            expect(history.completedSessions).toBe(2);
            expect(history.averageHoldDuration).toBe(30); // (30 + 40 + 20) / 3 = 30
            expect(history.bestHoldDuration).toBe(40);
            expect(history.lastSessionDate).toBe('2026-01-11');
            expect(history.sessions).toHaveLength(3);
        });

        it('should handle corrupted data gracefully', async () => {
            mockAsyncStorage.getItem.mockResolvedValue('invalid json');

            const history = await getHistory();

            expect(history.sessions).toEqual([]);
            expect(history.totalSessions).toBe(0);
        });
    });

    describe('getSessions', () => {
        it('should return all sessions when no limit', async () => {
            const sessions: ExerciseSession[] = [
                {
                    id: 'session_1',
                    date: '2026-01-10',
                    startTime: '2026-01-10T10:00:00Z',
                    endTime: '2026-01-10T10:05:00Z',
                    breathHoldDuration: 30,
                    targetDuration: 40,
                    wasCompleted: true,
                    wasSkipped: false,
                },
                {
                    id: 'session_2',
                    date: '2026-01-11',
                    startTime: '2026-01-11T10:00:00Z',
                    endTime: '2026-01-11T10:05:00Z',
                    breathHoldDuration: 40,
                    targetDuration: 40,
                    wasCompleted: true,
                    wasSkipped: false,
                },
            ];

            mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(sessions));

            const result = await getSessions();

            expect(result).toHaveLength(2);
        });

        it('should limit sessions when limit provided', async () => {
            const sessions: ExerciseSession[] = [
                {
                    id: 'session_1',
                    date: '2026-01-10',
                    startTime: '2026-01-10T10:00:00Z',
                    endTime: '2026-01-10T10:05:00Z',
                    breathHoldDuration: 30,
                    targetDuration: 40,
                    wasCompleted: true,
                    wasSkipped: false,
                },
                {
                    id: 'session_2',
                    date: '2026-01-11',
                    startTime: '2026-01-11T10:00:00Z',
                    endTime: '2026-01-11T10:05:00Z',
                    breathHoldDuration: 40,
                    targetDuration: 40,
                    wasCompleted: true,
                    wasSkipped: false,
                },
            ];

            mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(sessions));

            const result = await getSessions(1);

            expect(result).toHaveLength(1);
        });
    });

    describe('getStatistics', () => {
        it('should calculate streak correctly for consecutive days', async () => {
            const today = new Date();
            const yesterday = new Date(today);
            yesterday.setDate(yesterday.getDate() - 1);
            const twoDaysAgo = new Date(today);
            twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

            const sessions: ExerciseSession[] = [
                {
                    id: 'session_1',
                    date: twoDaysAgo.toISOString().split('T')[0],
                    startTime: twoDaysAgo.toISOString(),
                    endTime: twoDaysAgo.toISOString(),
                    breathHoldDuration: 30,
                    targetDuration: 40,
                    wasCompleted: true,
                    wasSkipped: false,
                },
                {
                    id: 'session_2',
                    date: yesterday.toISOString().split('T')[0],
                    startTime: yesterday.toISOString(),
                    endTime: yesterday.toISOString(),
                    breathHoldDuration: 35,
                    targetDuration: 40,
                    wasCompleted: true,
                    wasSkipped: false,
                },
                {
                    id: 'session_3',
                    date: today.toISOString().split('T')[0],
                    startTime: today.toISOString(),
                    endTime: today.toISOString(),
                    breathHoldDuration: 40,
                    targetDuration: 40,
                    wasCompleted: true,
                    wasSkipped: false,
                },
            ];

            mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(sessions));

            const stats = await getStatistics();

            expect(stats.currentStreak).toBe(3);
        });

        it('should return zero streak when gap exists', async () => {
            const today = new Date();
            const threeDaysAgo = new Date(today);
            threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

            const sessions: ExerciseSession[] = [
                {
                    id: 'session_1',
                    date: threeDaysAgo.toISOString().split('T')[0],
                    startTime: threeDaysAgo.toISOString(),
                    endTime: threeDaysAgo.toISOString(),
                    breathHoldDuration: 30,
                    targetDuration: 40,
                    wasCompleted: true,
                    wasSkipped: false,
                },
            ];

            mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(sessions));

            const stats = await getStatistics();

            expect(stats.currentStreak).toBe(0);
        });
    });

    describe('clearHistory', () => {
        it('should remove storage key', async () => {
            mockAsyncStorage.removeItem.mockResolvedValue();

            await clearHistory();

            expect(mockAsyncStorage.removeItem).toHaveBeenCalledWith('@breathhold/exercise-history');
        });

        it('should throw error if removal fails', async () => {
            mockAsyncStorage.removeItem.mockRejectedValue(new Error('Removal failed'));

            await expect(clearHistory()).rejects.toThrow();
        });
    });

    describe('exportData', () => {
        it('should export history as JSON string', async () => {
            const sessions: ExerciseSession[] = [
                {
                    id: 'session_1',
                    date: '2026-01-11',
                    startTime: '2026-01-11T10:00:00Z',
                    endTime: '2026-01-11T10:05:00Z',
                    breathHoldDuration: 35,
                    targetDuration: 40,
                    wasCompleted: true,
                    wasSkipped: false,
                },
            ];

            mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(sessions));

            const exported = await exportData();
            const parsed = JSON.parse(exported);

            expect(parsed.sessions).toHaveLength(1);
            expect(parsed.totalSessions).toBe(1);
        });

        it('should handle export errors gracefully', async () => {
            mockAsyncStorage.getItem.mockRejectedValue(new Error('Export failed'));

            const exported = await exportData();
            const parsed = JSON.parse(exported);

            // Should return empty history on error (graceful degradation)
            expect(parsed.sessions).toEqual([]);
            expect(parsed.totalSessions).toBe(0);
        });
    });
});
