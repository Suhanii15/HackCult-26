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
 * Friendly Earth/Eco Guardian Mascot character with distinct poses for each step:
 * - 'welcome': Cheerful waving arm & smiling eyes
 * - 'adjust': Energy calculation, thumbs-up & pointing to controls
 * - 'survey': Roof measurement, holding ruler & inspecting area
 * - 'celebrate': Triumphant celebration, both arms raised with energy star
 * - 'partner': Verified partner handshake / shield presentation
 */
export function EcoMascotGraphic({ size = 110, pose = 'welcome' }) {
  const isCelebrate = pose === 'celebrate';
  const isAdjust = pose === 'adjust';
  const isSurvey = pose === 'survey';
  const isPartner = pose === 'partner';
  const isWelcome = !isCelebrate && !isAdjust && !isSurvey && !isPartner;

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

        {/* Golden star gradient */}
        <LinearGradient id="goldGrad" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0%" stopColor="#FDE047" />
          <Stop offset="100%" stopColor="#EAB308" />
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

      {/* 3. Cheerful Eyes according to Pose */}
      {isCelebrate ? (
        // Closed joyful curved eyes
        <>
          <Path d="M35 46 Q 41 40 47 46" stroke="#0F172A" strokeWidth="2.8" strokeLinecap="round" fill="none" />
          <Path d="M53 46 Q 59 40 65 46" stroke="#0F172A" strokeWidth="2.8" strokeLinecap="round" fill="none" />
        </>
      ) : isSurvey ? (
        // Surveying expression: left eye wide, right eye observant
        <>
          <Ellipse cx="40" cy="46" rx="6" ry="7.5" fill="#FFFFFF" />
          <Circle cx="41.5" cy="46" r="3.5" fill="#0F172A" />
          <Circle cx="43" cy="44" r="1.5" fill="#FFFFFF" />

          <Ellipse cx="60" cy="47" rx="5" ry="5.5" fill="#FFFFFF" />
          <Circle cx="59.5" cy="47" r="2.8" fill="#0F172A" />
          <Circle cx="60.5" cy="45.5" r="1.2" fill="#FFFFFF" />
        </>
      ) : isAdjust ? (
        // Winking cheerful eye
        <>
          <Ellipse cx="40" cy="46" rx="5.5" ry="7.5" fill="#FFFFFF" />
          <Circle cx="41.5" cy="46" r="3.5" fill="#0F172A" />
          <Circle cx="43" cy="44" r="1.5" fill="#FFFFFF" />

          {/* Right eye wink */}
          <Path d="M55 47 Q 60 42 65 47" stroke="#0F172A" strokeWidth="2.8" strokeLinecap="round" fill="none" />
        </>
      ) : (
        // Default / Welcome / Partner: Wide open sparkling eyes
        <>
          <Ellipse cx="40" cy="46" rx="5.5" ry="7.5" fill="#FFFFFF" />
          <Circle cx="41.5" cy="46" r="3.5" fill="#0F172A" />
          <Circle cx="43" cy="44" r="1.5" fill="#FFFFFF" />

          <Ellipse cx="60" cy="46" rx="5.5" ry="7.5" fill="#FFFFFF" />
          <Circle cx="58.5" cy="46" r="3.5" fill="#0F172A" />
          <Circle cx="60" cy="44" r="1.5" fill="#FFFFFF" />
        </>
      )}

      {/* Rosy Cheeks */}
      <Circle cx="32" cy="54" r="4.5" fill="url(#blushGrad)" />
      <Circle cx="68" cy="54" r="4.5" fill="url(#blushGrad)" />

      {/* 4. Smile */}
      {isCelebrate ? (
        // Big open joyous smile
        <>
          <Path d="M40 54 Q 50 67 60 54" stroke="#0F172A" strokeWidth="2.8" strokeLinecap="round" fill="none" />
          <Path d="M43 57 Q 50 66 57 57 Z" fill="#EF4444" />
        </>
      ) : (
        // Friendly smile
        <>
          <Path d="M42 56 Q 50 63 58 56" stroke="#0F172A" strokeWidth="2.8" strokeLinecap="round" fill="none" />
          <Path d="M45 58 Q 50 63 55 58 Z" fill="#EF4444" />
        </>
      )}

      {/* 5. Sprout Headband / Little Plant Hair */}
      <Path d="M50 16 C 50 10, 52 8, 52 4 C 47 6, 46 11, 48 16 Z" fill="url(#sproutGrad)" />
      <Path d="M50 16 C 52 11, 58 10, 60 7 C 58 14, 53 16, 50 16 Z" fill="url(#sproutGrad)" />
      <Circle cx="50" cy="17" r="2.5" fill="#15803D" />

      {/* 6. Cartoon Gloved Arms & Props per Pose */}
      {isCelebrate ? (
        // CELEBRATE POSE: Both arms raised high, glowing star
        <G>
          {/* Left Arm Raised */}
          <Path d="M20 48 Q 12 36 12 22" stroke="#1E3A8A" strokeWidth="4.5" strokeLinecap="round" />
          <Circle cx="12" cy="20" r="5" fill="#FFFFFF" stroke="#94A3B8" strokeWidth="1" />

          {/* Right Arm Raised */}
          <Path d="M80 48 Q 88 36 88 22" stroke="#1E3A8A" strokeWidth="4.5" strokeLinecap="round" />
          <Circle cx="88" cy="20" r="5" fill="#FFFFFF" stroke="#94A3B8" strokeWidth="1" />

          {/* Celebration Golden Sparkle Star */}
          <Path
            d="M88 4 L90 10 L96 10 L91 14 L93 20 L88 16 L83 20 L85 14 L80 10 L86 10 Z"
            fill="url(#goldGrad)"
          />
        </G>
      ) : isAdjust ? (
        // ADJUST POSE: Left hand pointing at slider, Right arm Thumbs Up
        <G>
          {/* Left Arm Pointing Forward to Slider */}
          <Path d="M20 48 Q 10 52 4 56" stroke="#1E3A8A" strokeWidth="4.5" strokeLinecap="round" />
          <Circle cx="4" cy="56" r="4.5" fill="#FFFFFF" stroke="#94A3B8" strokeWidth="1" />
          <Path d="M4 56 L-2 56" stroke="#1E3A8A" strokeWidth="2.5" strokeLinecap="round" />

          {/* Right Arm Thumbs Up */}
          <Path d="M80 48 Q 88 56 86 64" stroke="#1E3A8A" strokeWidth="4.5" strokeLinecap="round" />
          <Circle cx="87" cy="65" r="4.5" fill="#FFFFFF" stroke="#94A3B8" strokeWidth="1" />
          <Path d="M87 65 L87 58" stroke="#1E3A8A" strokeWidth="3" strokeLinecap="round" />
        </G>
      ) : isSurvey ? (
        // SURVEY POSE: Left hand holding yellow ruler, Right hand shading eye/measuring
        <G>
          {/* Left Arm Holding Measuring Ruler */}
          <Path d="M20 48 Q 14 56 22 66" stroke="#1E3A8A" strokeWidth="4.5" strokeLinecap="round" />
          <Circle cx="22" cy="67" r="4.5" fill="#FFFFFF" stroke="#94A3B8" strokeWidth="1" />
          {/* Yellow Measuring Ruler */}
          <Rect x="14" y="62" width="22" height="6" rx="2" fill="#FBBF24" stroke="#D97706" strokeWidth="0.8" />
          <Path d="M18 62 L18 65 M22 62 L22 66 M26 62 L26 65 M30 62 L30 66" stroke="#78350F" strokeWidth="0.8" />

          {/* Right Hand Shading Brow / Measuring */}
          <Path d="M80 48 Q 86 38 78 32" stroke="#1E3A8A" strokeWidth="4.5" strokeLinecap="round" />
          <Circle cx="76" cy="31" r="4.5" fill="#FFFFFF" stroke="#94A3B8" strokeWidth="1" />
        </G>
      ) : isPartner ? (
        // PARTNER POSE: Left hand holding green verified badge, Right arm welcoming
        <G>
          {/* Left Arm Holding Verified Badge */}
          <Path d="M20 48 Q 12 56 18 64" stroke="#1E3A8A" strokeWidth="4.5" strokeLinecap="round" />
          <Circle cx="18" cy="65" r="4.5" fill="#FFFFFF" stroke="#94A3B8" strokeWidth="1" />
          {/* Verified Green Shield */}
          <Path d="M12 60 L18 57 L24 60 C 24 67, 18 71, 18 71 C 18 71, 12 67, 12 60 Z" fill="#10B981" />
          <Path d="M15 64 L17 66 L21 62" stroke="#FFFFFF" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />

          {/* Right Arm Open Welcoming */}
          <Path d="M80 48 Q 92 52 96 58" stroke="#1E3A8A" strokeWidth="4.5" strokeLinecap="round" />
          <Circle cx="96" cy="58" r="4.5" fill="#FFFFFF" stroke="#94A3B8" strokeWidth="1" />
        </G>
      ) : (
        // WELCOME POSE (Default): Left arm on hip, Right arm waving high
        <G>
          {/* Left Arm Resting on Hip */}
          <Path d="M20 48 Q 12 56 16 64" stroke="#1E3A8A" strokeWidth="4.5" strokeLinecap="round" />
          <Circle cx="17" cy="65" r="4.5" fill="#FFFFFF" stroke="#94A3B8" strokeWidth="1" />

          {/* Right Arm Waving */}
          <Path d="M80 48 Q 90 42 94 36" stroke="#1E3A8A" strokeWidth="4.5" strokeLinecap="round" />
          <Circle cx="95" cy="34" r="4.5" fill="#FFFFFF" stroke="#94A3B8" strokeWidth="1" />
          <Path d="M93 30 L97 34" stroke="#94A3B8" strokeWidth="1.2" strokeLinecap="round" />
        </G>
      )}
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
  pose = 'welcome',
}) {
  return (
    <View style={styles.container}>
      {/* Earth Mascot Character with dynamic pose */}
      <View style={styles.mascotWrapper}>
        <EcoMascotGraphic size={95} pose={pose} />
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
