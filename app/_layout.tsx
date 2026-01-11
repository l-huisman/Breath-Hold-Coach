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

// Prevent splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

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
