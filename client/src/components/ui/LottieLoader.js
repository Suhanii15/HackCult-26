import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import LottieView from 'lottie-react-native';
import { COLORS, TYPOGRAPHY, SPACING } from '../../theme';
import loadingAnimation from '../../../assets/loading.json';

export default function LottieLoader({
  size = 130,
  message,
  fullscreen = false,
  style,
}) {
  return (
    <View style={[styles.container, fullscreen && styles.fullscreen, style]}>
      <LottieView
        source={loadingAnimation}
        autoPlay
        loop
        style={{ width: size, height: size }}
      />
      {message ? <Text style={styles.message}>{message}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.xl,
  },
  fullscreen: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.88)',
    zIndex: 999,
  },
  message: {
    ...TYPOGRAPHY.subtext,
    color: COLORS.textSecondary,
    fontWeight: '600',
    marginTop: SPACING.xs,
  },
});
