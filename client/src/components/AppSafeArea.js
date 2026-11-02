import React from 'react';
import { View, StyleSheet } from 'react-native';

/**
 * AppSafeArea
 * Clean flex container matching the root SafeAreaView bounds.
 * Prevents overlapping with top camera notches and bottom gesture/navigation bars on Android and iOS.
 */
export default function AppSafeArea({ children, style }) {
  return (
    <View style={[styles.container, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
});
