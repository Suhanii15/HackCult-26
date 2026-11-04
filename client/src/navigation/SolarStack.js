import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SolarCalcScreen from '../features/solar/screens/SolarCalcScreen';
import VendorDirectoryScreen from '../features/solar/screens/VendorDirectoryScreen';

const Stack = createNativeStackNavigator();

export default function SolarStack({ user }) {
  return (
    <Stack.Navigator
      initialRouteName="SolarCalc"
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="SolarCalc">
        {(props) => <SolarCalcScreen {...props} user={user} />}
      </Stack.Screen>

      <Stack.Screen
        name="VendorDirectory"
        component={VendorDirectoryScreen}
      />
    </Stack.Navigator>
  );
}
