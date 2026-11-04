import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, {
  Circle,
  Path,
  Rect,
  Ellipse,
  Defs,
  LinearGradient,
  Stop,
  G,
} from 'react-native-svg';

/**
 * Friendly Earth/Eco Guardian Mascot character
 * Replaces the blue solar panel mascot with an adorable, personified Earth character
 */
export function EcoMascotGraphic({ size = 110 }) {
  return (
    <Svg width={size} height={size * 1.15} viewBox="0 0 100 115" fill="none">
      <Defs>
        {/* Globe body gradient */}
        <LinearGradient id="earthGrad" x1="0" y1="0" x2="100" y2="100">
          <Stop offset="0%" stopColor="#60A5FA" />
          <Stop offset="50%" stopColor="#3B82F6" />
          <Stop offset="100%" stopColor="#1D4ED8" />
        </LinearGradient>

        {/* Leaf sprout gradient */}
        <LinearGradient id="sproutGrad" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0%" stopColor="#4ADE80" />
          <Stop offset="100%" stopColor="#16A34A" />
        </LinearGradient>

        {/* Cheek blush */}
        <LinearGradient id="blushGrad" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0%" stopColor="#F472B6" stopOpacity="0.6" />
          <Stop offset="100%" stopColor="#FB7185" stopOpacity="0.2" />
        </LinearGradient>

        {/* Sneaker gradient */}
        <LinearGradient id="sneakerGrad" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0%" stopColor="#FFFFFF" />
          <Stop offset="100%" stopColor="#CBD5E1" />
        </LinearGradient>
      </Defs>

      {/* 1. Legs and Sneakers */}
      {/* Left Leg */}
      <Rect x="36" y="76" width="7" height="18" rx="3.5" fill="#1E3A8A" />
      {/* Left Sneaker */}
      <Ellipse cx="38" cy="95" rx="10" ry="5.5" fill="url(#sneakerGrad)" />
      <Path d="M30 95 C 30 98, 46 98, 46 95 Z" fill="#00897B" />
      <Rect x="32" y="94" width="12" height="2" fill="#004D40" rx="1" />

      {/* Right Leg */}
      <Rect x="57" y="76" width="7" height="18" rx="3.5" fill="#1E3A8A" />
      {/* Right Sneaker */}
      <Ellipse cx="62" cy="95" rx="10" ry="5.5" fill="url(#sneakerGrad)" />
      <Path d="M54 95 C 54 98, 70 98, 70 95 Z" fill="#00897B" />
      <Rect x="56" y="94" width="12" height="2" fill="#004D40" rx="1" />

      {/* 2. Earth Globe Body */}
      <Circle cx="50" cy="48" r="32" fill="url(#earthGrad)" />

      {/* Continents (Green Patches) */}
      <Path
        d="M26 38 C 24 45, 30 54, 38 52 C 42 46, 38 34, 32 32 Z"
        fill="#22C55E"
      />
      <Path
        d="M60 26 C 68 28, 76 36, 74 44 C 68 46, 62 40, 60 32 Z"
        fill="#22C55E"
      />
      <Path
        d="M48 62 C 54 60, 64 64, 68 70 C 60 76, 44 76, 44 68 Z"
        fill="#22C55E"
      />

      {/* 3. Cheerful Eyes */}
      {/* Left Eye */}
      <Ellipse cx="40" cy="46" rx="5.5" ry="7.5" fill="#FFFFFF" />
      <Circle cx="41.5" cy="46" r="3.5" fill="#0F172A" />
      <Circle cx="43" cy="44" r="1.5" fill="#FFFFFF" />

      {/* Right Eye */}
      <Ellipse cx="60" cy="46" rx="5.5" ry="7.5" fill="#FFFFFF" />
      <Circle cx="58.5" cy="46" r="3.5" fill="#0F172A" />
      <Circle cx="60" cy="44" r="1.5" fill="#FFFFFF" />

      {/* Rosy Cheeks */}
      <Circle cx="32" cy="54" r="4.5" fill="url(#blushGrad)" />
      <Circle cx="68" cy="54" r="4.5" fill="url(#blushGrad)" />

      {/* 4. Warm Friendly Smile */}
      <Path
        d="M42 56 Q 50 63 58 56"
        stroke="#0F172A"
        strokeWidth="2.8"
        strokeLinecap="round"
        fill="none"
      />
      <Path
        d="M45 58 Q 50 63 55 58 Z"
        fill="#EF4444"
      />

      {/* 5. Sprout Headband / Little Plant Hair */}
      <Path
        d="M50 16 C 50 10, 52 8, 52 4 C 47 6, 46 11, 48 16 Z"
        fill="url(#sproutGrad)"
      />
      <Path
        d="M50 16 C 52 11, 58 10, 60 7 C 58 14, 53 16, 50 16 Z"
        fill="url(#sproutGrad)"
      />
      <Circle cx="50" cy="17" r="2.5" fill="#15803D" />

      {/* 6. Cartoon Gloved Arms */}
      {/* Left Arm Resting on Hip */}
      <Path
        d="M20 48 Q 12 56 16 64"
        stroke="#1E3A8A"
        strokeWidth="4.5"
        strokeLinecap="round"
      />
      <Circle cx="17" cy="65" r="4.5" fill="#FFFFFF" stroke="#94A3B8" strokeWidth="1" />

      {/* Right Arm Waving / Pointing to Speech */}
      <Path
        d="M80 48 Q 90 42 94 36"
        stroke="#1E3A8A"
        strokeWidth="4.5"
        strokeLinecap="round"
      />
      <Circle cx="95" cy="34" r="4.5" fill="#FFFFFF" stroke="#94A3B8" strokeWidth="1" />
      <Path d="M93 30 L97 34" stroke="#94A3B8" strokeWidth="1.2" strokeLinecap="round" />
    </Svg>
  );
}

/**
 * Mascot with Speech Bubble Card matching the reference layout
 */
export default function EcoMascotSpeech({
  title = "Get your solar plan estimate",
  subtitle = "Please fill in your details",
  badgeText = null,
}) {
  return (
    <View style={styles.container}>
      {/* Earth Mascot Character */}
      <View style={styles.mascotWrapper}>
        <EcoMascotGraphic size={95} />
      </View>

      {/* Speech Bubble */}
      <View style={styles.speechCol}>
        <Text style={styles.speechTitle}>{title}</Text>
        <View style={styles.speechBubble}>
          {/* Small Speech Bubble pointer arrow */}
          <View style={styles.speechArrow} />
          <Text style={styles.speechSubtitle}>{subtitle}</Text>
          {badgeText && (
            <View style={styles.badgeRow}>
              <Text style={styles.badgeText}>{badgeText}</Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 6,
    marginBottom: 16,
  },
  mascotWrapper: {
    marginRight: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  speechCol: {
    flex: 1,
  },
  speechTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    lineHeight: 22,
    marginBottom: 6,
    letterSpacing: -0.3,
  },
  speechBubble: {
    backgroundColor: '#FEF3C7', // Solar soft amber from reference speech bubble
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#FDE68A',
    position: 'relative',
    shadowColor: '#D97706',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  speechArrow: {
    position: 'absolute',
    left: -7,
    top: 14,
    width: 0,
    height: 0,
    borderTopWidth: 6,
    borderTopColor: 'transparent',
    borderBottomWidth: 6,
    borderBottomColor: 'transparent',
    borderRightWidth: 8,
    borderRightColor: '#FEF3C7',
  },
  speechSubtitle: {
    fontSize: 12.5,
    color: '#92400E',
    fontWeight: '600',
    lineHeight: 17,
  },
  badgeRow: {
    marginTop: 4,
    alignSelf: 'flex-start',
    backgroundColor: '#FDE68A',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#78350F',
  },
});
