import {DefaultTheme, ThemeProvider} from '@react-navigation/native';
import {Stack} from 'expo-router';
import {StatusBar} from 'expo-status-bar';
import 'react-native-reanimated';
import {Colors} from '@/constants/theme';
import {UserProvider} from '@/contexts/user-context';

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
    // Force light theme for now since dark theme is not designed yet

    return (
        <UserProvider>
            <ThemeProvider value={CustomTheme}>
                <Stack>
                    <Stack.Screen name="(tabs)" options={{headerShown: false}}/>
                    <Stack.Screen name="modal" options={{presentation: 'modal', title: 'Modal'}}/>
                </Stack>
                <StatusBar style="dark"/>
            </ThemeProvider>
        </UserProvider>
    );
}
