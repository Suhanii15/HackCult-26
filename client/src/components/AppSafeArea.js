import React from 'react';
import { View, StyleSheet, Platform, StatusBar } from 'react-native';

/**
 * AppSafeArea
 * Replaces deprecated React Native SafeAreaView.
 * Prevents overlapping with top camera notches and bottom gesture/navigation bars on Android and iOS.
 */
export default function AppSafeArea({ children, style, edges = ['top', 'bottom'] }) {
  const topInset = edges.includes('top')
    ? (Platform.OS === 'android' ? (StatusBar.currentHeight || 28) : 44)
    : 0;

  const bottomInset = edges.includes('bottom')
    ? (Platform.OS === 'android' ? 16 : 34)
    : 0;

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: topInset,
          paddingBottom: bottomInset,
        },
        style,
      ]}
    >
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
