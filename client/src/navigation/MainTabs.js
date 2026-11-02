import React from 'react';
import { StyleSheet, Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { COLORS } from '../theme';
import { useLanguage } from '../i18n/LanguageContext';
import CommunityScreen from '../features/community/screens/CommunityScreen';
import ActivitiesStack from './ActivitiesStack';
import HomeScreen from '../features/home/screens/HomeScreen';
import SolarScreen from '../features/solar/screens/SolarScreen';
import {
  CommunityIcon,
  ActivitiesIcon,
  HomeIcon,
  SolarIcon,
} from './TabIcons';

const Tab = createBottomTabNavigator();

// Order is defined in ONE array: Community, Activities, Home, Solar
const TAB_DEFINITIONS = [
  
  {
    name: 'Home',
    titleKey: 'tab_home',
    defaultLabel: 'Home',
    component: HomeScreen,
    icon: HomeIcon,
  },
  {
    name: 'Community',
    titleKey: 'tab_community',
    defaultLabel: 'Community',
    component: CommunityScreen,
    icon: CommunityIcon,
  },
  {
    name: 'Activities',
    titleKey: 'tab_activities',
    defaultLabel: 'Activities',
    component: ActivitiesStack,
    icon: ActivitiesIcon,
  },
  {
    name: 'Solar',
    titleKey: 'tab_solar',
    defaultLabel: 'Solar',
    component: SolarScreen,
    icon: SolarIcon,
  },
];

export default function MainTabs({ user }) {
  const { t } = useLanguage();

  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: COLORS.accent,
        tabBarInactiveTintColor: COLORS.textOnDarkMuted,
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabBarLabel,
        tabBarItemStyle: styles.tabBarItem,
      }}
    >
      {TAB_DEFINITIONS.map((tab) => {
        const IconComponent = tab.icon;
        const label = tab.titleKey && t(tab.titleKey) !== tab.titleKey
          ? t(tab.titleKey)
          : tab.defaultLabel;

        return (
          <Tab.Screen
            key={tab.name}
            name={tab.name}
            options={{
              tabBarLabel: label,
              tabBarIcon: ({ color, size }) => (
                <IconComponent color={color} size={size || 22} />
              ),
            }}
          >
            {(props) => {
              const ScreenComponent = tab.component;
              return <ScreenComponent {...props} user={user} />;
            }}
          </Tab.Screen>
        );
      })}
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: COLORS.darkSurface, // Dark surface tab bar
    borderTopColor: '#1F2937',
    borderTopWidth: 1,
    height: Platform.OS === 'ios' ? 88 : 64,
    paddingTop: 6,
    paddingBottom: Platform.OS === 'ios' ? 24 : 8,
  },
  tabBarLabel: {
    fontSize: 11,
    fontWeight: '700',
    marginTop: 2,
  },
  tabBarItem: {
    paddingVertical: 2,
  },
});
