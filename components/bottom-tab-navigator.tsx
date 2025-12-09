import React from 'react';
import {Pressable, StyleSheet, Text, TextStyle, View, ViewStyle} from 'react-native';
import {BottomTabBarProps} from '@react-navigation/bottom-tabs';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {Colors, Fonts} from '@/constants/theme';
import {useColorScheme} from '@/hooks/use-color-scheme';

export function CustomBottomTabBar(props: BottomTabBarProps) {
    const {state, descriptors, navigation} = props;
    const insets = useSafeAreaInsets();
    const colorScheme = useColorScheme() ?? 'light';

    return (
        <View style={[styles.container, {paddingBottom: insets.bottom, backgroundColor: Colors[colorScheme].background}]}>
            <View style={styles.content}>
                {state.routes.map((route, index) => {
                    const isFocused = state.index === index;
                    const descriptor = descriptors[route.key];
                    const options = descriptor.options;

                    const label: string | undefined =
                        options.tabBarLabel !== undefined
                            ? (options.tabBarLabel as string)
                            : options.title !== undefined
                                ? options.title
                                : route.name;

                    const accessibilityLabel = options.tabBarAccessibilityLabel;
                    const icon = options.tabBarIcon?.({
                        focused: isFocused,
                        color: isFocused ? Colors[colorScheme].accent : Colors[colorScheme].text,
                        size: 32,
                    });

                    const onPress = () => {
                        const event = navigation.emit({
                            type: 'tabPress',
                            target: route.key,
                            canPreventDefault: true,
                        });
                        if (!isFocused && !event.defaultPrevented) {
                            navigation.navigate(route.name, route.params);
                        }
                    };

                    const onLongPress = () => {
                        navigation.emit({type: 'tabLongPress', target: route.key});
                    };

                    return (
                        <Pressable
                            key={route.key}
                            accessibilityRole="button"
                            accessibilityState={isFocused ? {selected: true} : {}}
                            accessibilityLabel={accessibilityLabel}
                            onPress={onPress}
                            onLongPress={onLongPress}
                            style={[styles.tab]}
                        >
                            {icon && <View style={styles.iconContainer}>{icon}</View>}
                            {label ? (
                                <Text
                                    style={[styles.label, {color: Colors[colorScheme].text}]}
                                    adjustsFontSizeToFit={true}
                                    numberOfLines={1}
                                    minimumFontScale={0.8}
                                >
                                    {label}
                                </Text>
                            ) : null}
                        </Pressable>
                    );
                })}
            </View>
        </View>
    );
}


// Style types and definitions
interface Styles {
    container: ViewStyle;
    content: ViewStyle;
    tab: ViewStyle;
    iconContainer: ViewStyle;
    label: TextStyle;
}

const styles = StyleSheet.create<Styles>({
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
