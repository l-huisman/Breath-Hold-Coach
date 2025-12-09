import {Tabs} from 'expo-router';
import React from 'react';

import {CustomBottomTabBar} from '@/components/bottom-tab-navigator';
import {HapticTab} from '@/components/haptic-tab';
import {IconSymbol} from '@/components/ui/icon-symbol';

export default function TabLayout() {
    return (
        <Tabs
            tabBar={(props) => <CustomBottomTabBar {...props} />}
            screenOptions={{
                headerShown: false,
                tabBarButton: HapticTab,
            }}>
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Home',
                    tabBarIcon: ({color}) => <IconSymbol size={32} name="house.fill" color={color}/>,
                }}
            />
            <Tabs.Screen
                name="relax"
                options={{
                    title: 'Ontspan',
                    tabBarIcon: ({color}) => <IconSymbol size={32} name="figure.mind.and.body" color={color}/>,
                }}
            />
            <Tabs.Screen
                name="messages"
                options={{
                    title: 'Berichten',
                    tabBarIcon: ({color}) => <IconSymbol size={32} name="envelope.fill" color={color}/>,
                }}
            />
            <Tabs.Screen
                name="agenda"
                options={{
                    title: 'Agenda',
                    tabBarIcon: ({color}) => <IconSymbol size={32} name="calendar" color={color}/>,
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    title: 'Profiel',
                    tabBarIcon: ({color}) => <IconSymbol size={32} name="person.fill" color={color}/>,
                }}
            />
        </Tabs>
    );
}
