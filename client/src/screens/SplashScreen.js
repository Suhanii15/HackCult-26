import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import BrandLogo from '../components/BrandLogo';
import { COLORS } from '../theme';
import { apiWarmup } from '../services/api';

export default function SplashScreen({ onFinish }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.92)).current;
  const pulseAnim = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    // 0. Trigger silent backend health warm-up call
    apiWarmup().catch(() => {});

    // 1. Smooth Fade-in and scale up
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 900,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 6,
        useNativeDriver: true,
      }),
    ]).start();

    // 2. Gentle pulsing animation for the loading glow
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.3,
          duration: 700,
          useNativeDriver: true,
        }),
      ])
    );
    pulseLoop.start();

    // 3. Auto-redirect to Welcome screen after 2.8 seconds
    const timer = setTimeout(() => {
      onFinish();
    }, 2800);

    return () => {
      clearTimeout(timer);
      pulseLoop.stop();
    };
  }, []);

  return (
    <TouchableOpacity
      activeOpacity={1}
      onPress={onFinish}
      style={styles.container}
    >
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />

      {/* Decorative background watermark icons */}
      <View style={styles.backgroundDecor} pointerEvents="none">
        <Text style={[styles.watermarkIcon, { top: '12%', left: '8%' }]}>☀️</Text>
        <Text style={[styles.watermarkIcon, { top: '18%', right: '10%' }]}>🌱</Text>
        <Text style={[styles.watermarkIcon, { top: '35%', left: '6%' }]}>⚡</Text>
        <Text style={[styles.watermarkIcon, { top: '65%', right: '8%' }]}>💧</Text>
        <Text style={[styles.watermarkIcon, { top: '78%', left: '12%' }]}>🚲</Text>
      </View>

      {/* Main Center Content */}
      <Animated.View
        style={[
          styles.centerBox,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <BrandLogo size="large" color={COLORS.white} />

        {/* Small Slogan / Quote */}
        <View style={styles.quoteContainer}>
          <Text style={styles.quoteTitle}>Lifestyle for Environment</Text>
          <Text style={styles.quoteText}>
            “Small daily actions create enduring planetary change.”
          </Text>
        </View>

        {/* Pulsing loading bar */}
        <View style={styles.loadingTrack}>
          <Animated.View style={[styles.loadingThumb, { opacity: pulseAnim }]} />
        </View>
      </Animated.View>

      {/* Bottom Authority Line (Reference style: "a ClearYst company") */}
      <Animated.View style={[styles.footer, { opacity: fadeAnim }]}>
        <Text style={styles.footerLead}>an initiative by</Text>
        <Text style={styles.footerOrg}>
          Gujarat Energy Development Agency (GEDA)
        </Text>
      </Animated.View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 50,
    paddingHorizontal: 24,
  },
  backgroundDecor: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.08,
  },
  watermarkIcon: {
    position: 'absolute',
    fontSize: 32,
    color: '#FFFFFF',
  },
  centerBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  quoteContainer: {
    marginTop: 24,
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  quoteTitle: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 6,
    opacity: 0.95,
  },
  quoteText: {
    color: COLORS.textOnPrimaryMuted,
    fontSize: 13,
    textAlign: 'center',
    fontStyle: 'italic',
    lineHeight: 18,
    maxWidth: 280,
  },
  loadingTrack: {
    width: 64,
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    borderRadius: 2,
    marginTop: 32,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingThumb: {
    width: '60%',
    height: '100%',
    backgroundColor: COLORS.white,
    borderRadius: 2,
  },
  footer: {
    alignItems: 'center',
    marginBottom: 10,
  },
  footerLead: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 12,
    fontWeight: '400',
    letterSpacing: 0.3,
  },
  footerOrg: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginTop: 2,
  },
});
