import React from 'react';
import {act, renderHook} from '@testing-library/react-native';
import {
    defaultPracticeMomentsAssistiveLearning,
    defaultPracticeMomentsNormalLearning,
    UserProvider,
    useUser,
} from '@/contexts/user-context';

// Wrapper component for providing context to hooks
const wrapper = ({children}: { children: React.ReactNode }) => (
    <UserProvider>{children}</UserProvider>
);

describe('UserContext', () => {
    describe('Default state initialization', () => {
        it('should initialize with default user details', () => {
            const {result} = renderHook(() => useUser(), {wrapper});

            expect(result.current.user).toEqual({
                name: 'Tineke',
                dateOfBirth: null,
                patientNumber: '123456',
                assistiveLearning: null,
            });
        });

        it('should initialize with default preferences for non-smoker', () => {
            const {result} = renderHook(() => useUser(), {wrapper});

            expect(result.current.preferences).toEqual({
                notifications: true,
                practiceMoments: defaultPracticeMomentsNormalLearning,
            });
        });

        it('should have correct default practice moments for non-smoker (2 sessions)', () => {
            const {result} = renderHook(() => useUser(), {wrapper});

            expect(result.current.preferences.practiceMoments).toHaveLength(2);
            expect(result.current.preferences.practiceMoments[0]).toEqual({
                id: '1',
                time: '09:00',
                enabled: true,
            });
            expect(result.current.preferences.practiceMoments[1]).toEqual({
                id: '2',
                time: '18:00',
                enabled: true,
            });
        });

        it('should initialize with default settings including dailyGoal for non-smoker', () => {
            const {result} = renderHook(() => useUser(), {wrapper});

            expect(result.current.settings).toEqual({
                breathHoldGoal: 45,
                dailyGoal: 5, // 5 seconds per day for non-smoker
                dailyReminder: false,
                dailyReminderTime: null,
            });
        });
    });

    describe('Smoker vs Non-Smoker defaults', () => {
        it('should have different practice moments for smokers (5 sessions)', () => {
            expect(defaultPracticeMomentsAssistiveLearning).toHaveLength(5);
            expect(defaultPracticeMomentsAssistiveLearning).toEqual([
                {id: '1', time: '08:00', enabled: true},
                {id: '2', time: '11:00', enabled: true},
                {id: '3', time: '14:00', enabled: true},
                {id: '4', time: '17:00', enabled: true},
                {id: '5', time: '20:00', enabled: true},
            ]);
        });

        it('should have fewer practice moments for non-smokers (2 sessions)', () => {
            expect(defaultPracticeMomentsNormalLearning).toHaveLength(2);
            expect(defaultPracticeMomentsNormalLearning).toEqual([
                {id: '1', time: '09:00', enabled: true},
                {id: '2', time: '18:00', enabled: true},
            ]);
        });
    });

    describe('updateUser function', () => {
        it('should update user name while preserving other fields', () => {
            const {result} = renderHook(() => useUser(), {wrapper});

            act(() => {
                result.current.updateUser({name: 'John'});
            });

            expect(result.current.user.name).toBe('John');
            expect(result.current.user.patientNumber).toBe('123456');
            expect(result.current.user.dateOfBirth).toBeNull();
            expect(result.current.user.assistiveLearning).toBeNull();
        });

        it('should update user dateOfBirth', () => {
            const {result} = renderHook(() => useUser(), {wrapper});
            const testDate = new Date('1990-05-15');

            act(() => {
                result.current.updateUser({dateOfBirth: testDate});
            });

            expect(result.current.user.dateOfBirth).toEqual(testDate);
        });

        it('should update isSmoker status', () => {
            const {result} = renderHook(() => useUser(), {wrapper});

            act(() => {
                result.current.updateUser({assistiveLearning: true});
            });

            expect(result.current.user.assistiveLearning).toBe(true);
        });

        it('should update multiple user fields at once', () => {
            const {result} = renderHook(() => useUser(), {wrapper});

            act(() => {
                result.current.updateUser({
                    name: 'Jane',
                    patientNumber: '654321',
                    assistiveLearning: false,
                });
            });

            expect(result.current.user.name).toBe('Jane');
            expect(result.current.user.patientNumber).toBe('654321');
            expect(result.current.user.assistiveLearning).toBe(false);
        });
    });

    describe('updatePreferences function', () => {
        it('should update notifications preference', () => {
            const {result} = renderHook(() => useUser(), {wrapper});

            act(() => {
                result.current.updatePreferences({notifications: false});
            });

            expect(result.current.preferences.notifications).toBe(false);
            expect(result.current.preferences.practiceMoments).toEqual(defaultPracticeMomentsNormalLearning);
        });

        it('should update practice moments to smoker schedule', () => {
            const {result} = renderHook(() => useUser(), {wrapper});

            act(() => {
                result.current.updatePreferences({practiceMoments: defaultPracticeMomentsAssistiveLearning});
            });

            expect(result.current.preferences.practiceMoments).toHaveLength(5);
            expect(result.current.preferences.practiceMoments).toEqual(defaultPracticeMomentsAssistiveLearning);
        });

        it('should allow user to customize individual practice moments', () => {
            const {result} = renderHook(() => useUser(), {wrapper});

            const customMoments = [
                {id: '1', time: '07:30', enabled: true},
                {id: '2', time: '12:00', enabled: true},
                {id: '3', time: '19:30', enabled: false},
            ];

            act(() => {
                result.current.updatePreferences({practiceMoments: customMoments});
            });

            expect(result.current.preferences.practiceMoments).toEqual(customMoments);
        });

        it('should allow user to disable specific practice moments', () => {
            const {result} = renderHook(() => useUser(), {wrapper});

            const momentsWithDisabled = [
                {id: '1', time: '09:00', enabled: false},
                {id: '2', time: '18:00', enabled: true},
            ];

            act(() => {
                result.current.updatePreferences({practiceMoments: momentsWithDisabled});
            });

            expect(result.current.preferences.practiceMoments[0].enabled).toBe(false);
            expect(result.current.preferences.practiceMoments[1].enabled).toBe(true);
        });
    });

    describe('updateSettings function', () => {
        it('should update breathHoldGoal setting', () => {
            const {result} = renderHook(() => useUser(), {wrapper});

            act(() => {
                result.current.updateSettings({breathHoldGoal: 60});
            });

            expect(result.current.settings.breathHoldGoal).toBe(60);
            expect(result.current.settings.dailyGoal).toBe(5);
        });

        it('should update dailyGoal setting', () => {
            const {result} = renderHook(() => useUser(), {wrapper});

            act(() => {
                result.current.updateSettings({dailyGoal: 2}); // smoker daily goal
            });

            expect(result.current.settings.dailyGoal).toBe(2);
        });

        it('should update dailyReminder setting', () => {
            const {result} = renderHook(() => useUser(), {wrapper});

            act(() => {
                result.current.updateSettings({dailyReminder: true});
            });

            expect(result.current.settings.dailyReminder).toBe(true);
        });

        it('should update dailyReminderTime setting', () => {
            const {result} = renderHook(() => useUser(), {wrapper});

            act(() => {
                result.current.updateSettings({dailyReminderTime: '09:00'});
            });

            expect(result.current.settings.dailyReminderTime).toBe('09:00');
        });

        it('should update multiple settings at once', () => {
            const {result} = renderHook(() => useUser(), {wrapper});

            act(() => {
                result.current.updateSettings({
                    breathHoldGoal: 90,
                    dailyGoal: 3,
                    dailyReminder: true,
                    dailyReminderTime: '08:30',
                });
            });

            expect(result.current.settings.breathHoldGoal).toBe(90);
            expect(result.current.settings.dailyGoal).toBe(3);
            expect(result.current.settings.dailyReminder).toBe(true);
            expect(result.current.settings.dailyReminderTime).toBe('08:30');
        });
    });

    describe('Error handling', () => {
        it('should throw error when useUser is called outside of UserProvider', () => {
            // Suppress console.error for this test since we expect an error
            const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {
            });

            expect(() => {
                renderHook(() => useUser());
            }).toThrow('useUser must be used within a UserProvider');

            consoleSpy.mockRestore();
        });
    });

    describe('State persistence across updates', () => {
        it('should maintain state across multiple sequential updates', () => {
            const {result} = renderHook(() => useUser(), {wrapper});

            act(() => {
                result.current.updateUser({name: 'Updated Name', assistiveLearning: true});
            });

            act(() => {
                result.current.updatePreferences({practiceMoments: defaultPracticeMomentsAssistiveLearning});
            });

            act(() => {
                result.current.updateSettings({breathHoldGoal: 120, dailyGoal: 2});
            });

            // Verify all updates persisted
            expect(result.current.user.name).toBe('Updated Name');
            expect(result.current.user.assistiveLearning).toBe(true);
            expect(result.current.preferences.practiceMoments).toEqual(defaultPracticeMomentsAssistiveLearning);
            expect(result.current.settings.breathHoldGoal).toBe(120);
            expect(result.current.settings.dailyGoal).toBe(2);

            // Verify other values remain at defaults
            expect(result.current.user.patientNumber).toBe('123456');
            expect(result.current.preferences.notifications).toBe(true);
        });

        it('should handle consecutive updates to the same state object', () => {
            const {result} = renderHook(() => useUser(), {wrapper});

            act(() => {
                result.current.updateUser({name: 'First'});
            });

            act(() => {
                result.current.updateUser({name: 'Second'});
            });

            act(() => {
                result.current.updateUser({name: 'Third'});
            });

            expect(result.current.user.name).toBe('Third');
        });
    });
});
