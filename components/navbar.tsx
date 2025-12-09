// filepath: /Users/lh/Documents/School/HBO/HBO 2526/Minor App Design & Development/Frontend Development/Breath-Hold-Coach/components/navbar.tsx
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, CommonActions } from '@react-navigation/native';
import { IconSymbol, IconSymbolName } from '@/components/ui/icon-symbol';
import { Colors, Fonts } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface NavItem {
    name: string;
    title: string;
    icon: IconSymbolName;
}

const NAV_ITEMS: NavItem[] = [
    { name: 'index', title: 'Home', icon: 'house.fill' },
    { name: 'relax', title: 'Ontspan', icon: 'figure.mind.and.body' },
    { name: 'messages', title: 'Berichten', icon: 'envelope.fill' },
    { name: 'agenda', title: 'Agenda', icon: 'calendar' },
    { name: 'profile', title: 'Profiel', icon: 'person.fill' },
];

interface NavbarProps {
    /** Currently active tab name (optional, none highlighted if not provided) */
    activeTab?: string;
}

/**
 * Standalone bottom navigation bar component.
 * Can be used outside of the Tabs navigator while maintaining consistent styling.
 */
export function Navbar({ activeTab }: NavbarProps) {
    const insets = useSafeAreaInsets();
    const colorScheme = useColorScheme() ?? 'light';
    const navigation = useNavigation();

    return (
        <View style={[styles.container, { paddingBottom: insets.bottom, backgroundColor: Colors[colorScheme].background }]}>
            <View style={styles.content}>
                {NAV_ITEMS.map((item) => {
                    const isFocused = activeTab === item.name;

                    const onPress = () => {
                        // Reset navigation state to instantly switch to tabs without animation
                        navigation.dispatch(
                            CommonActions.reset({
                                index: 0,
                                routes: [
                                    {
                                        name: '(tabs)',
                                        state: {
                                            index: NAV_ITEMS.findIndex(i => i.name === item.name),
                                            routes: NAV_ITEMS.map(i => ({ name: i.name })),
                                        },
                                    },
                                ],
                            })
                        );
                    };

                    return (
                        <Pressable
                            key={item.name}
                            accessibilityRole="button"
                            accessibilityState={isFocused ? { selected: true } : {}}
                            accessibilityLabel={`${item.title}, navigeer naar ${item.title}`}
                            onPress={onPress}
                            style={styles.tab}
                        >
                            <View style={styles.iconContainer}>
                                <IconSymbol
                                    size={32}
                                    name={item.icon}
                                    color={isFocused ? Colors[colorScheme].accent : Colors[colorScheme].text}
                                />
                            </View>
                            <Text
                                style={[styles.label, { color: Colors[colorScheme].text }]}
                                adjustsFontSizeToFit={true}
                                numberOfLines={1}
                                minimumFontScale={0.8}
                            >
                                {item.title}
                            </Text>
                        </Pressable>
                    );
                })}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        // backgroundColor applied dynamically
    },
    content: {
        flexDirection: 'row',
        width: '100%',
        minHeight: 90,
        paddingVertical: 16,
        paddingHorizontal: 20,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 24,
    },
    tab: {
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 12,
        flex: 1,
        minWidth: 0,
    },
    iconContainer: {
        width: 32,
        height: 32,
        aspectRatio: 1,
    },
    label: {
        fontSize: 12,
        textAlign: 'center',
        fontFamily: Fonts.semiBold,
    },
});
