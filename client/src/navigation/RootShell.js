import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '../services/queryClient';
import MainTabs from './MainTabs';
import ProfileScreen from '../features/profile/screens/ProfileScreen';

const Stack = createNativeStackNavigator();

export default function RootShell({ user, onLogout }) {
  return (
    <QueryClientProvider client={queryClient}>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="MainTabs"
          screenOptions={{
            headerShown: false,
            animation: 'slide_from_right',
          }}
        >
          <Stack.Screen name="MainTabs">
            {(props) => <MainTabs {...props} user={user} />}
          </Stack.Screen>

          <Stack.Screen name="Profile">
            {(props) => <ProfileScreen {...props} user={user} onLogout={onLogout} />}
          </Stack.Screen>
        </Stack.Navigator>
      </NavigationContainer>
    </QueryClientProvider>
  );
}
