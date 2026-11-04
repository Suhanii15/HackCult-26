import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  StatusBar,
  Easing,
} from 'react-native';
import BrandLogo from '../components/BrandLogo';
import { COLORS } from '../theme';
import { apiWarmup } from '../services/api';

export default function SplashScreen({ onFinish }) {
  const logoFadeAnim = useRef(new Animated.Value(0)).current;
  const logoScaleAnim = useRef(new Animated.Value(0.92)).current;
  const pulseScaleAnim = useRef(new Animated.Value(1)).current;
  const pulseOpacityAnim = useRef(new Animated.Value(0)).current;
  const gedaFadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // 0. Trigger silent backend health warm-up call
    apiWarmup().catch(() => {});

    // Sequence:
    // 1. EcoPulse Logo & Name fade in and scale up slightly
    // 2. Subtle green pulse ring expands and settles
    // 3. GEDA branding appears beneath it
    Animated.parallel([
      Animated.timing(logoFadeAnim, {
        toValue: 1,
        duration: 750,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.spring(logoScaleAnim, {
        toValue: 1,
        friction: 7,
        tension: 40,
        useNativeDriver: true,
      }),
      // Pulse animation starts at 400ms
      Animated.sequence([
        Animated.delay(350),
        Animated.parallel([
          Animated.timing(pulseOpacityAnim, {
            toValue: 0.45,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(pulseScaleAnim, {
            toValue: 1.35,
            duration: 900,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
        Animated.timing(pulseOpacityAnim, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
      ]),
      // GEDA branding fades in smoothly
      Animated.sequence([
        Animated.delay(650),
        Animated.timing(gedaFadeAnim, {
          toValue: 1,
          duration: 700,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    // Auto-transition after 2.4 seconds
    const timer = setTimeout(() => {
      onFinish();
    }, 2400);

    return () => {
      clearTimeout(timer);
    };
  }, [logoFadeAnim, logoScaleAnim, pulseOpacityAnim, pulseScaleAnim, gedaFadeAnim, onFinish]);

  return (
    <TouchableOpacity
      activeOpacity={1}
      onPress={onFinish}
      style={styles.container}
      accessibilityRole="button"
      accessibilityLabel="EcoPulse Splash. Tap to skip."
    >
      <StatusBar barStyle="light-content" backgroundColor="#022C22" />

      {/* Main Center Content: EcoPulse Logo + Wordmark */}
      <View style={styles.centerContainer}>
        {/* Subtle Green Pulse Ring */}
        <Animated.View
          style={[
            styles.pulseRing,
            {
              transform: [{ scale: pulseScaleAnim }],
              opacity: pulseOpacityAnim,
            },
          ]}
        />

        {/* EcoPulse Emblem & Wordmark */}
        <Animated.View
          style={[
            styles.logoWrapper,
            {
              opacity: logoFadeAnim,
              transform: [{ scale: logoScaleAnim }],
            },
          ]}
        >
          <BrandLogo size="large" color="#FFFFFF" showTagline={false} />
        </Animated.View>
      </View>

      {/* Bottom Minimal Branded GEDA */}
      <Animated.View style={[styles.bottomContainer, { opacity: gedaFadeAnim }]}>
        <View style={styles.gedaBadge}>
          <Text style={styles.gedaText}>GEDA</Text>
        </View>
      </Animated.View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#022C22', // Deep premium forest green
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 56,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    width: '100%',
  },
  pulseRing: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#10B981',
  },
  logoWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 8,
  },
  gedaBadge: {
    borderTopWidth: 1,
    borderColor: 'rgba(52, 211, 153, 0.25)',
    paddingTop: 12,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  gedaText: {
    color: '#A7F3D0',
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 4.5,
    textTransform: 'uppercase',
  },
});
