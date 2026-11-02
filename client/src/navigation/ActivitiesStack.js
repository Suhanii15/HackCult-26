import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ActivityCategoriesScreen from '../features/activities/screens/ActivityCategoriesScreen';
import ActivityListScreen from '../features/activities/screens/ActivityListScreen';
import ActivityDetailScreen from '../features/activities/screens/ActivityDetailScreen';
import ActiveActivitiesScreen from '../features/activities/screens/ActiveActivitiesScreen';

const Stack = createNativeStackNavigator();

export default function ActivitiesStack({ user }) {
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
