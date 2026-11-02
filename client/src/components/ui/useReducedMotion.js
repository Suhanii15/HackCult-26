import { useState, useEffect } from 'react';
import { AccessibilityInfo, Platform } from 'react-native';

export function useReducedMotion() {
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    let mounted = true;

    if (Platform.OS === 'web') {
      try {
        if (typeof window !== 'undefined' && window.matchMedia) {
          const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
          setReduceMotion(mediaQuery.matches);
          const listener = (event) => {
            if (mounted) setReduceMotion(event.matches);
          };
          if (mediaQuery.addEventListener) {
            mediaQuery.addEventListener('change', listener);
            return () => {
              mounted = false;
              mediaQuery.removeEventListener('change', listener);
            };
          }
        }
      } catch (e) {
        // fallback
      }
      return () => { mounted = false; };
    }

    // Native platforms
    AccessibilityInfo.isReduceMotionEnabled()
      .then((enabled) => {
        if (mounted) setReduceMotion(Boolean(enabled));
      })
      .catch(() => {});

    const subscription = AccessibilityInfo.addEventListener(
      'reduceMotionChanged',
      (enabled) => {
        if (mounted) setReduceMotion(Boolean(enabled));
      }
    );

    return () => {
      mounted = false;
      if (subscription?.remove) {
        subscription.remove();
      }
    };
  }, []);

  return reduceMotion;
}
