import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS, RADII, SHADOWS, SPACING } from '../../theme';

export default function Card({
  children,
  onPress,
  style,
  elevation = 'subtle', // 'none' | 'subtle' | 'card' | 'elevated'
  ...props
}) {
  const Container = onPress ? TouchableOpacity : View;
  const shadowStyle = elevation !== 'none' ? SHADOWS[elevation] : {};

  return (
    <Container
      onPress={onPress}
      activeOpacity={0.8}
      style={[styles.card, shadowStyle, style]}
      {...props}
    >
      {children}
    </Container>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.card,
    borderRadius: RADII.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
});
