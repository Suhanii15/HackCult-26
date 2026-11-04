import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function BrandLogo({ size = 'medium', color = '#FFFFFF', showTagline = false }) {
  const isSmall = size === 'small';
  const isLarge = size === 'large';
  const scale = isSmall ? 0.58 : isLarge ? 1.25 : 0.85;

  return (
    <View style={[styles.container, isSmall && styles.containerSmall]}>
      {/* Sun & Leaf Emblem */}
      <View style={[styles.emblemContainer, isSmall && styles.emblemContainerSmall, { transform: [{ scale }] }]}>
        {/* Top Sun Rays */}
        <View style={styles.raysContainer}>
          <View style={[styles.ray, styles.rayLeft, { backgroundColor: color }]} />
          <View style={[styles.ray, styles.rayCenter, { backgroundColor: color }]} />
          <View style={[styles.ray, styles.rayRight, { backgroundColor: color }]} />
        </View>

        {/* Center Sun Dome */}
        <View style={[styles.sunDome, { backgroundColor: color }]} />

        {/* Sprouting Leaves Cradle */}
        <View style={styles.leavesContainer}>
          <View style={[styles.leaf, styles.leafLeft, { borderColor: color }]} />
          <View style={[styles.leafCenterDot, { backgroundColor: color }]} />
          <View style={[styles.leaf, styles.leafRight, { borderColor: color }]} />
        </View>
      </View>

      {/* App Wordmark */}
      <Text
        style={[
          styles.brandText,
          isSmall && styles.brandTextSmall,
          isLarge && styles.brandTextLarge,
          { color },
        ]}
      >
        Eco<Text style={styles.boldLife}>Pulse</Text>
      </Text>

      {showTagline && !isSmall && (
        <Text style={[styles.tagline, { color: color === '#FFFFFF' ? 'rgba(255,255,255,0.85)' : '#6B7280' }]}>
          Lifestyle for Environment
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  containerSmall: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 2,
  },
  emblemContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  emblemContainerSmall: {
    marginBottom: -4,
    marginTop: -4,
  },
  raysContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    height: 12,
    marginBottom: 4,
    width: 48,
  },
  ray: {
    width: 3.5,
    height: 8,
    borderRadius: 2,
    marginHorizontal: 4,
  },
  rayLeft: {
    transform: [{ rotate: '-30deg' }],
  },
  rayCenter: {
    height: 11,
  },
  rayRight: {
    transform: [{ rotate: '30deg' }],
  },
  sunDome: {
    width: 26,
    height: 14,
    borderTopLeftRadius: 14,
    borderTopRightRadius: 14,
    marginBottom: 2,
  },
  leavesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -2,
  },
  leaf: {
    width: 22,
    height: 16,
    borderWidth: 3.5,
    borderRadius: 12,
  },
  leafLeft: {
    borderTopRightRadius: 0,
    transform: [{ rotate: '-18deg' }, { translateX: 2 }],
  },
  leafCenterDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginHorizontal: 1,
  },
  leafRight: {
    borderTopLeftRadius: 0,
    transform: [{ rotate: '18deg' }, { translateX: -2 }],
  },
  brandText: {
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  brandTextSmall: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  brandTextLarge: {
    fontSize: 34,
    letterSpacing: -0.8,
  },
  boldLife: {
    fontWeight: '900',
  },
  tagline: {
    fontSize: 13,
    fontWeight: '500',
    marginTop: 4,
    letterSpacing: 0.3,
  },
});
