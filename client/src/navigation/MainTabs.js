import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useLanguage } from '../i18n/LanguageContext';
import LeaderboardScreen from '../screens/LeaderboardScreen';
import ActivitiesStack from './ActivitiesStack';
import HomeScreen from '../features/home/screens/HomeScreen';
import SolarScreen from '../features/solar/screens/SolarScreen';
import GlassEllipseTabBar from './GlassEllipseTabBar';
import {
  CommunityIcon,
  ActivitiesIcon,
  HomeIcon,
  SolarIcon,
} from './TabIcons';

const Tab = createBottomTabNavigator();

// Order is defined in ONE array: Home, Leaderboard, Activities, Solar
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
    titleKey: 'tab_leaderboard',
    defaultLabel: 'Leaderboard',
    component: LeaderboardScreen,
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
      tabBar={(props) => <GlassEllipseTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      {TAB_DEFINITIONS.map((tab) => {
        const label = tab.titleKey && t(tab.titleKey) !== tab.titleKey
          ? t(tab.titleKey)
          : tab.defaultLabel;

        return (
          <Tab.Screen
            key={tab.name}
            name={tab.name}
            options={{
              tabBarLabel: label,
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
