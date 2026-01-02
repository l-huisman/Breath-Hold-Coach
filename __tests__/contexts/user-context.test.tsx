import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react-native';
import { UserProvider, useUser } from '@/contexts/user-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}));

describe('UserContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Default: no saved data
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <UserProvider>{children}</UserProvider>
  );

  describe('initialization', () => {
    it('should provide default user data', async () => {
      const { result } = renderHook(() => useUser(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.user).toEqual({
        name: 'Tineke',
        dateOfBirth: null,
        patientNumber: '123456',
        assistiveLearning: null,
      });
    });

    it('should provide default settings', async () => {
      const { result } = renderHook(() => useUser(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.settings).toEqual({
        breathHoldGoal: 45,
        dailyGoal: 5,
        dailyReminder: false,
        dailyReminderTime: null,
      });
    });

    it('should provide default progress', async () => {
      const { result } = renderHook(() => useUser(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.progress).toEqual({
        currentBreathHold: 12,
        completedExercises: 0,
        lastPracticeDate: null,
        streakDays: 0,
      });
    });

    it('should provide default preferences', async () => {
      const { result } = renderHook(() => useUser(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.preferences).toEqual({
        notifications: true,
        practiceMoments: [
          { id: '1', time: '09:00', enabled: true },
          { id: '2', time: '18:00', enabled: true },
        ],
      });
    });

    it('should start with isLoading true', () => {
      const { result } = renderHook(() => useUser(), { wrapper });

      expect(result.current.isLoading).toBe(true);
    });

    it('should set isLoading to false after loading', async () => {
      const { result } = renderHook(() => useUser(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
    });
  });

  describe('loading from AsyncStorage', () => {
    it('should load user data from storage', async () => {
      (AsyncStorage.getItem as jest.Mock).mockImplementation((key) => {
        if (key === '@breathhold:user') {
          return Promise.resolve(
            JSON.stringify({
              name: 'Jan',
              dateOfBirth: '1970-06-15T00:00:00.000Z',
              patientNumber: '789012',
              assistiveLearning: true,
            })
          );
        }
        return Promise.resolve(null);
      });

      const { result } = renderHook(() => useUser(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.user.name).toBe('Jan');
      expect(result.current.user.patientNumber).toBe('789012');
      expect(result.current.user.assistiveLearning).toBe(true);
      expect(result.current.user.dateOfBirth).toBeInstanceOf(Date);
    });

    it('should load settings from storage', async () => {
      (AsyncStorage.getItem as jest.Mock).mockImplementation((key) => {
        if (key === '@breathhold:settings') {
          return Promise.resolve(
            JSON.stringify({
              breathHoldGoal: 60,
              dailyGoal: 10,
              dailyReminder: true,
              dailyReminderTime: '09:00',
            })
          );
        }
        return Promise.resolve(null);
      });

      const { result } = renderHook(() => useUser(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.settings).toEqual({
        breathHoldGoal: 60,
        dailyGoal: 10,
        dailyReminder: true,
        dailyReminderTime: '09:00',
      });
    });

    it('should load progress from storage', async () => {
      (AsyncStorage.getItem as jest.Mock).mockImplementation((key) => {
        if (key === '@breathhold:progress') {
          return Promise.resolve(
            JSON.stringify({
              currentBreathHold: 25,
              completedExercises: 10,
              lastPracticeDate: '2024-01-15',
              streakDays: 5,
            })
          );
        }
        return Promise.resolve(null);
      });

      const { result } = renderHook(() => useUser(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.progress).toEqual({
        currentBreathHold: 25,
        completedExercises: 10,
        lastPracticeDate: '2024-01-15',
        streakDays: 5,
      });
    });

    it('should load preferences from storage', async () => {
      (AsyncStorage.getItem as jest.Mock).mockImplementation((key) => {
        if (key === '@breathhold:preferences') {
          return Promise.resolve(
            JSON.stringify({
              notifications: false,
              practiceMoments: [
                { id: '1', time: '08:00', enabled: true },
                { id: '2', time: '11:00', enabled: true },
                { id: '3', time: '14:00', enabled: true },
              ],
            })
          );
        }
        return Promise.resolve(null);
      });

      const { result } = renderHook(() => useUser(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.preferences.notifications).toBe(false);
      expect(result.current.preferences.practiceMoments).toHaveLength(3);
    });

    it('should use defaults when storage is empty', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

      const { result } = renderHook(() => useUser(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.user.name).toBe('Tineke');
      expect(result.current.settings.breathHoldGoal).toBe(45);
    });

    it('should handle storage errors gracefully', async () => {
      const consoleError = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {});
      (AsyncStorage.getItem as jest.Mock).mockRejectedValue(
        new Error('Storage error')
      );

      const { result } = renderHook(() => useUser(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Should use defaults on error
      expect(result.current.user.name).toBe('Tineke');
      expect(consoleError).toHaveBeenCalledWith(
        'Failed to load user data from storage:',
        expect.any(Error)
      );

      consoleError.mockRestore();
    });

    it('should load all data in parallel', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

      const { result } = renderHook(() => useUser(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // AsyncStorage.getItem should be called 4 times (user, preferences, settings, progress)
      expect(AsyncStorage.getItem).toHaveBeenCalledTimes(4);
      expect(AsyncStorage.getItem).toHaveBeenCalledWith('@breathhold:user');
      expect(AsyncStorage.getItem).toHaveBeenCalledWith(
        '@breathhold:preferences'
      );
      expect(AsyncStorage.getItem).toHaveBeenCalledWith('@breathhold:settings');
      expect(AsyncStorage.getItem).toHaveBeenCalledWith('@breathhold:progress');
    });
  });

  describe('updateUser', () => {
    it('should update user state', async () => {
      const { result } = renderHook(() => useUser(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.updateUser({ name: 'New Name' });
      });

      expect(result.current.user.name).toBe('New Name');
    });

    it('should persist user data to AsyncStorage', async () => {
      const { result } = renderHook(() => useUser(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.updateUser({ name: 'New Name' });
      });

      await waitFor(() => {
        expect(AsyncStorage.setItem).toHaveBeenCalledWith(
          '@breathhold:user',
          expect.stringContaining('New Name')
        );
      });
    });

    it('should handle partial updates', async () => {
      const { result } = renderHook(() => useUser(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const originalPatientNumber = result.current.user.patientNumber;

      await act(async () => {
        await result.current.updateUser({ name: 'Updated' });
      });

      expect(result.current.user.name).toBe('Updated');
      expect(result.current.user.patientNumber).toBe(originalPatientNumber);
    });

    it('should handle storage errors gracefully', async () => {
      const consoleError = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {});
      (AsyncStorage.setItem as jest.Mock).mockRejectedValue(
        new Error('Storage error')
      );

      const { result } = renderHook(() => useUser(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.updateUser({ name: 'New Name' });
      });

      // State should still update even if storage fails
      expect(result.current.user.name).toBe('New Name');
      expect(consoleError).toHaveBeenCalledWith(
        'Failed to save user data:',
        expect.any(Error)
      );

      consoleError.mockRestore();
    });
  });

  describe('updateSettings', () => {
    it('should update settings state', async () => {
      const { result } = renderHook(() => useUser(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.updateSettings({ breathHoldGoal: 60 });
      });

      expect(result.current.settings.breathHoldGoal).toBe(60);
    });

    it('should persist settings to AsyncStorage', async () => {
      const { result } = renderHook(() => useUser(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.updateSettings({ breathHoldGoal: 60 });
      });

      await waitFor(() => {
        expect(AsyncStorage.setItem).toHaveBeenCalledWith(
          '@breathhold:settings',
          expect.stringContaining('"breathHoldGoal":60')
        );
      });
    });
  });

  describe('updateProgress', () => {
    it('should update progress state', async () => {
      const { result } = renderHook(() => useUser(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.updateProgress({ currentBreathHold: 30 });
      });

      expect(result.current.progress.currentBreathHold).toBe(30);
    });

    it('should persist progress to AsyncStorage', async () => {
      const { result } = renderHook(() => useUser(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.updateProgress({ currentBreathHold: 30 });
      });

      await waitFor(() => {
        expect(AsyncStorage.setItem).toHaveBeenCalledWith(
          '@breathhold:progress',
          expect.stringContaining('"currentBreathHold":30')
        );
      });
    });
  });

  describe('updatePreferences', () => {
    it('should update preferences state', async () => {
      const { result } = renderHook(() => useUser(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.updatePreferences({ notifications: false });
      });

      expect(result.current.preferences.notifications).toBe(false);
    });

    it('should persist preferences to AsyncStorage', async () => {
      const { result } = renderHook(() => useUser(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.updatePreferences({ notifications: false });
      });

      await waitFor(() => {
        expect(AsyncStorage.setItem).toHaveBeenCalledWith(
          '@breathhold:preferences',
          expect.stringContaining('"notifications":false')
        );
      });
    });
  });

  describe('practice moments', () => {
    it('should provide normal learning practice moments by default', async () => {
      const { result } = renderHook(() => useUser(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.preferences.practiceMoments).toEqual([
        { id: '1', time: '09:00', enabled: true },
        { id: '2', time: '18:00', enabled: true },
      ]);
    });

    it('should update to assistive learning practice moments', async () => {
      const { result } = renderHook(() => useUser(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const assistiveMoments = [
        { id: '1', time: '08:00', enabled: true },
        { id: '2', time: '11:00', enabled: true },
        { id: '3', time: '14:00', enabled: true },
        { id: '4', time: '17:00', enabled: true },
        { id: '5', time: '20:00', enabled: true },
      ];

      await act(async () => {
        await result.current.updatePreferences({
          practiceMoments: assistiveMoments,
        });
      });

      expect(result.current.preferences.practiceMoments).toHaveLength(5);
      expect(result.current.preferences.practiceMoments).toEqual(
        assistiveMoments
      );
    });
  });

  describe('hook error handling', () => {
    it('should throw error when used outside provider', () => {
      // Suppress console error for this test
      const consoleError = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      expect(() => {
        renderHook(() => useUser());
      }).toThrow('useUser must be used within a UserProvider');

      consoleError.mockRestore();
    });
  });

  describe('date serialization', () => {
    it('should convert dateOfBirth string to Date object on load', async () => {
      (AsyncStorage.getItem as jest.Mock).mockImplementation((key) => {
        if (key === '@breathhold:user') {
          return Promise.resolve(
            JSON.stringify({
              name: 'Test',
              dateOfBirth: '1970-06-15T00:00:00.000Z',
              patientNumber: '123456',
              assistiveLearning: null,
            })
          );
        }
        return Promise.resolve(null);
      });

      const { result } = renderHook(() => useUser(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.user.dateOfBirth).toBeInstanceOf(Date);
      expect(result.current.user.dateOfBirth?.getFullYear()).toBe(1970);
    });

    it('should serialize Date object to string on save', async () => {
      const { result } = renderHook(() => useUser(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const testDate = new Date('1970-06-15');

      await act(async () => {
        await result.current.updateUser({ dateOfBirth: testDate });
      });

      await waitFor(() => {
        expect(AsyncStorage.setItem).toHaveBeenCalledWith(
          '@breathhold:user',
          expect.stringContaining('1970-06-15')
        );
      });
    });

    it('should handle null dateOfBirth', async () => {
      const { result } = renderHook(() => useUser(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.updateUser({ dateOfBirth: null });
      });

      expect(result.current.user.dateOfBirth).toBeNull();
    });
  });
});
