import {DefaultTheme, ThemeProvider} from '@react-navigation/native';
import {Stack} from 'expo-router';
import {StatusBar} from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import {useFonts} from 'expo-font';
import {useEffect} from 'react';
import 'react-native-reanimated';
import {
    Montserrat_400Regular,
    Montserrat_500Medium,
    Montserrat_600SemiBold,
    Montserrat_700Bold,
} from '@expo-google-fonts/montserrat';
import {Colors} from '@/constants/theme';
import {UserProvider} from '@/contexts/user-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

// TypeScript declaration for global dev flag
declare global {
    var __DEV_STORAGE_CLEARED__: boolean | undefined;
}

// Prevent splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

// Clear AsyncStorage on fresh dev launch (persists through hot reload)
if (__DEV__ && !global.__DEV_STORAGE_CLEARED__) {
    AsyncStorage.clear()
        .then(() => console.log('[DEV] AsyncStorage cleared on fresh launch'))
        .catch((err) => console.warn('[DEV] Failed to clear AsyncStorage:', err));
    global.__DEV_STORAGE_CLEARED__ = true;
}

export const unstable_settings = {
    anchor: '(tabs)',
};

// Custom navigation theme matching our design system
const CustomTheme = {
    ...DefaultTheme,
    colors: {
        ...DefaultTheme.colors,
        primary: Colors.light.primary,
        background: Colors.light.background,
        card: Colors.light.background,
        text: Colors.light.text,
        border: Colors.light.primaryMuted,
        notification: Colors.light.accent,
    },
};

export default function RootLayout() {
    const [fontsLoaded] = useFonts({
        Montserrat_400Regular,
        Montserrat_500Medium,
        Montserrat_600SemiBold,
        Montserrat_700Bold,
    });

    useEffect(() => {
        if (fontsLoaded) {
            SplashScreen.hideAsync();
        }
    }, [fontsLoaded]);

    if (!fontsLoaded) {
        return null;
    }

    return (
        <UserProvider>
            <ThemeProvider value={CustomTheme}>
                <Stack
                    screenOptions={{
                        animation: 'none',
                    }}
                >
                    <Stack.Screen name="(tabs)" options={{headerShown: false}}/>
                    <Stack.Screen name="explain" options={{headerShown: false}}/>
                    <Stack.Screen name="practice" options={{headerShown: false}}/>
                    <Stack.Screen name="modal" options={{presentation: 'modal', title: 'Modal', animation: 'default'}}/>
                </Stack>
                <StatusBar style="dark"/>
            </ThemeProvider>
        </UserProvider>
    );
}
