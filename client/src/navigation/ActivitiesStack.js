import React, { useLayoutEffect } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { getFocusedRouteNameFromRoute } from '@react-navigation/native';
import ActivityCategoriesScreen from '../features/activities/screens/ActivityCategoriesScreen';
import ActivityListScreen from '../features/activities/screens/ActivityListScreen';
import ActivityDetailScreen from '../features/activities/screens/ActivityDetailScreen';
import ActiveActivitiesScreen from '../features/activities/screens/ActiveActivitiesScreen';

const Stack = createNativeStackNavigator();

export default function ActivitiesStack({ navigation, route, user }) {
  useLayoutEffect(() => {
    const routeName = getFocusedRouteNameFromRoute(route) ?? 'ActivityCategories';
    // Hide the bottom navigation bar on full detail view so action buttons are never obstructed
    if (routeName === 'ActivityDetail') {
      navigation.setOptions({ tabBarStyle: { display: 'none' } });
    } else {
      navigation.setOptions({ tabBarStyle: undefined });
    }
  }, [navigation, route]);

  return (
    <Stack.Navigator
      initialRouteName="ActivityCategories"
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="ActivityCategories">
        {(props) => <ActivityCategoriesScreen {...props} user={user} />}
      </Stack.Screen>

      <Stack.Screen
        name="ActivityList"
        component={ActivityListScreen}
      />

      <Stack.Screen
        name="ActivityDetail"
        component={ActivityDetailScreen}
      />

      <Stack.Screen
        name="ActiveActivities"
        component={ActiveActivitiesScreen}
      />
    </Stack.Navigator>
  );
}
