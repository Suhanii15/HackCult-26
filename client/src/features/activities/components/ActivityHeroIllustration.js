import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, {
  Path,
  Rect,
  Circle,
  Ellipse,
  G,
  Defs,
  LinearGradient,
  RadialGradient,
  Stop,
  Mask,
} from 'react-native-svg';

/**
 * ActivityHeroIllustration
 *
 * Immersive, stylized vector illustration for Mission LiFE activity details.
 * Selects an activity-specific scene (e.g. AC cooling, cycling, composting, water saving)
 * or a category-appropriate visual narrative with deep forest greens (#064E3B)
 * and luminous mint highlights (#A7F3D0).
 */
export default function ActivityHeroIllustration({
  activityId = '',
  category = 'energy',
  height = 230,
}) {
  const normId = (activityId || '').toLowerCase();
  const cat = (category || '').toLowerCase();

  // Determine illustration theme
  let theme = 'general';
  if (normId.includes('ac') || normId.includes('cool')) {
    theme = 'ac';
  } else if (normId.includes('cycle') || normId.includes('bike')) {
    theme = 'cycling';
  } else if (
    normId.includes('bus') ||
    normId.includes('train') ||
    normId.includes('metro') ||
    normId.includes('public_transport') ||
    normId.includes('carpool') ||
    cat === 'transport'
  ) {
    theme = normId.includes('cycle') ? 'cycling' : 'transport';
  } else if (
    normId.includes('compost') ||
    normId.includes('food_waste') ||
    normId.includes('organic')
  ) {
    theme = 'compost';
  } else if (
    normId.includes('plastic') ||
    normId.includes('bag') ||
    normId.includes('bottle') ||
    normId.includes('recycle') ||
    cat === 'waste'
  ) {
    theme = normId.includes('compost') ? 'compost' : 'waste';
  } else if (
    normId.includes('water') ||
    normId.includes('leak') ||
    normId.includes('tap') ||
    normId.includes('shower') ||
    normId.includes('aerator') ||
    cat === 'water'
  ) {
    theme = 'water';
  } else if (
    normId.includes('led') ||
    normId.includes('bulb') ||
    normId.includes('light') ||
    normId.includes('switch_off')
  ) {
    theme = 'lighting';
  } else if (cat === 'energy') {
    theme = 'energy';
  }

  return (
    <View style={[styles.container, { height }]}>
      <Svg width="100%" height={height} viewBox="0 0 380 230" preserveAspectRatio="xMidYMid slice">
        <Defs>
          {/* Background Gradients */}
          <LinearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#022C22" />
            <Stop offset="55%" stopColor="#064E3B" />
            <Stop offset="100%" stopColor="#043927" />
          </LinearGradient>

          <RadialGradient id="glowMint" cx="50%" cy="40%" r="55%">
            <Stop offset="0%" stopColor="#34D399" stopOpacity="0.28" />
            <Stop offset="60%" stopColor="#10B981" stopOpacity="0.10" />
            <Stop offset="100%" stopColor="#064E3B" stopOpacity="0" />
          </RadialGradient>

          <LinearGradient id="mintGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <Stop offset="0%" stopColor="#6EE7B7" />
            <Stop offset="100%" stopColor="#A7F3D0" />
          </LinearGradient>

          <LinearGradient id="leafGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <Stop offset="0%" stopColor="#34D399" />
            <Stop offset="100%" stopColor="#059669" />
          </LinearGradient>
        </Defs>

        {/* Backdrop Surface */}
        <Rect x="0" y="0" width="380" height="230" fill="url(#bgGrad)" />

        {/* Ambient Halo Glow */}
        <Circle cx="190" cy="110" r="115" fill="url(#glowMint)" />

        {/* Background Minimalist Geometry */}
        <Path
          d="M-20,180 Q100,140 200,165 T400,140 L400,230 L-20,230 Z"
          fill="#065F46"
          opacity="0.35"
        />
        <Path
          d="M-20,200 Q90,175 190,190 T400,170 L400,230 L-20,230 Z"
          fill="#022C22"
          opacity="0.55"
        />

        {/* SCENE SPECIFIC VECTORS */}
        {theme === 'ac' && (
          <G>
            {/* Split AC Unit */}
            <Rect x="90" y="38" width="200" height="64" rx="10" fill="#0F766E" stroke="#2DD4BF" strokeWidth="2.2" />
            <Rect x="105" y="82" width="170" height="8" rx="4" fill="#042F2E" />
            {/* Display on AC */}
            <Rect x="235" y="48" width="40" height="20" rx="4" fill="#042F2E" />
            <Circle cx="245" cy="58" r="2.5" fill="#34D399" />
            <Path d="M255,54 L267,54 M255,58 L267,58 M255,62 L263,62" stroke="#6EE7B7" strokeWidth="1.8" strokeLinecap="round" />

            {/* Cool Wave Breezes */}
            <Path
              d="M125,98 C120,120 110,135 95,150"
              stroke="#6EE7B7"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeDasharray="4 4"
              opacity="0.85"
            />
            <Path
              d="M190,98 C190,125 185,145 180,165"
              stroke="#A7F3D0"
              strokeWidth="3.2"
              strokeLinecap="round"
              strokeDasharray="5 5"
              opacity="0.9"
            />
            <Path
              d="M255,98 C260,120 270,135 285,150"
              stroke="#6EE7B7"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeDasharray="4 4"
              opacity="0.85"
            />

            {/* Indoor Plant & Pot */}
            <Path d="M60,170 L80,170 L76,195 L64,195 Z" fill="#D97706" />
            <Circle cx="70" cy="155" r="14" fill="#10B981" />
            <Circle cx="62" cy="148" r="10" fill="#34D399" />
            <Circle cx="78" cy="148" r="10" fill="#059669" />

            {/* Smart Remote Control */}
            <Rect x="290" y="145" width="28" height="50" rx="6" fill="#1E293B" stroke="#64748B" strokeWidth="1.5" />
            <Rect x="294" y="150" width="20" height="15" rx="3" fill="#022C22" />
            <Circle cx="304" cy="174" r="4" fill="#10B981" />
            <Circle cx="304" cy="186" r="3" fill="#64748B" />
          </G>
        )}

        {theme === 'cycling' && (
          <G transform="translate(45, 20)">
            {/* Road path */}
            <Path d="M-20,165 Q150,150 320,165" stroke="#34D399" strokeWidth="2.5" strokeDasharray="6 4" opacity="0.6" />

            {/* Rear Wheel */}
            <Circle cx="60" cy="130" r="34" fill="none" stroke="#A7F3D0" strokeWidth="4" />
            <Circle cx="60" cy="130" r="4" fill="#A7F3D0" />
            <Path d="M60,96 L60,164 M26,130 L94,130" stroke="#34D399" strokeWidth="1.5" opacity="0.6" />

            {/* Front Wheel */}
            <Circle cx="210" cy="130" r="34" fill="none" stroke="#A7F3D0" strokeWidth="4" />
            <Circle cx="210" cy="130" r="4" fill="#A7F3D0" />
            <Path d="M210,96 L210,164 M176,130 L244,130" stroke="#34D399" strokeWidth="1.5" opacity="0.6" />

            {/* Bike Frame */}
            <Path
              d="M60,130 L115,130 L175,85 L105,85 Z"
              fill="none"
              stroke="#10B981"
              strokeWidth="4"
              strokeLinejoin="round"
            />
            <Path d="M115,130 L102,68" stroke="#10B981" strokeWidth="4" strokeLinecap="round" />
            {/* Saddle */}
            <Path d="M88,68 L114,68" stroke="#F59E0B" strokeWidth="5" strokeLinecap="round" />

            {/* Fork & Handlebars */}
            <Path d="M210,130 L172,62" stroke="#10B981" strokeWidth="4" strokeLinecap="round" />
            <Path d="M162,60 L182,60 M182,60 C187,60 190,66 186,72" stroke="#F59E0B" strokeWidth="3.5" fill="none" strokeLinecap="round" />

            {/* Pedal Sprocket */}
            <Circle cx="115" cy="130" r="10" fill="#064E3B" stroke="#A7F3D0" strokeWidth="2" />

            {/* Floating Energy Leaves */}
            <Path d="M245,75 C255,60 270,70 265,85 C255,85 245,85 245,75 Z" fill="#6EE7B7" />
            <Path d="M35,65 C45,55 58,62 54,75 C45,75 35,75 35,65 Z" fill="#34D399" />
          </G>
        )}

        {theme === 'transport' && (
          <G transform="translate(60, 25)">
            {/* High Speed Electric Metro/Bus */}
            <Rect x="20" y="55" width="220" height="90" rx="18" fill="#047857" stroke="#6EE7B7" strokeWidth="2.5" />
            <Path d="M20,105 L240,105" stroke="#064E3B" strokeWidth="3" />

            {/* Aerodynamic Front Nose */}
            <Path d="M200,55 Q245,60 250,110 L240,145 L200,145 Z" fill="#065F46" />

            {/* Streamlined Windows */}
            <Rect x="40" y="70" width="38" height="26" rx="5" fill="#A7F3D0" opacity="0.9" />
            <Rect x="90" y="70" width="38" height="26" rx="5" fill="#A7F3D0" opacity="0.9" />
            <Rect x="140" y="70" width="38" height="26" rx="5" fill="#A7F3D0" opacity="0.9" />
            <Rect x="190" y="70" width="46" height="26" rx="6" fill="#CCFBF1" opacity="0.95" />

            {/* Headlights */}
            <Circle cx="238" cy="125" r="5" fill="#FEF08A" />
            <Path d="M243,123 L280,115 L280,135 Z" fill="#FEF08A" opacity="0.25" />

            {/* Track Line */}
            <Path d="M-30,160 L290,160" stroke="#34D399" strokeWidth="4" strokeLinecap="round" />
            <Path d="M0,165 L260,165" stroke="#059669" strokeWidth="2" strokeDasharray="8 6" />

            {/* Green Power Pantograph */}
            <Path d="M110,55 L125,32 L150,32" stroke="#A7F3D0" strokeWidth="2.5" fill="none" />
            <Path d="M120,30 L155,30" stroke="#FDE047" strokeWidth="3" strokeLinecap="round" />
          </G>
        )}

        {theme === 'compost' && (
          <G transform="translate(65, 20)">
            {/* Composting Wooden / Aerated Bin */}
            <Rect x="80" y="60" width="100" height="95" rx="8" fill="#78350F" stroke="#B45309" strokeWidth="2" />
            <Path d="M80,82 L180,82 M80,105 L180,105 M80,128 L180,128" stroke="#451A03" strokeWidth="3" />

            {/* Rich Earth Pile Inside */}
            <Path d="M85,60 Q130,40 175,60" fill="#292524" />

            {/* Sprouting Seedling & Leaves */}
            <Path d="M130,50 Q130,22 130,15" stroke="#34D399" strokeWidth="3.5" strokeLinecap="round" />
            <Path d="M130,20 C118,12 115,28 130,28 Z" fill="#6EE7B7" />
            <Path d="M130,26 C144,18 145,34 130,34 Z" fill="#34D399" />

            {/* Apple Core / Organics falling */}
            <Path d="M40,90 C32,80 40,65 52,70 C60,75 58,95 48,95 Z" fill="#EF4444" opacity="0.9" />
            <Path d="M48,65 Q52,58 55,58" stroke="#15803D" strokeWidth="2" fill="none" />

            {/* Nutrient Cycling Circular Arrows */}
            <Path
              d="M205,80 A30,30 0 1,1 215,115"
              stroke="#A7F3D0"
              strokeWidth="2.8"
              fill="none"
              strokeLinecap="round"
              strokeDasharray="5 3"
            />
            <Path d="M218,110 L215,119 L206,114" fill="#A7F3D0" />
            <Circle cx="205" cy="100" r="4" fill="#34D399" />
          </G>
        )}

        {theme === 'waste' && (
          <G transform="translate(60, 20)">
            {/* Reusable Canvas Tote & Steel Bottle */}
            <Path d="M60,65 L120,65 L115,145 L65,145 Z" fill="#FEF3C7" stroke="#D97706" strokeWidth="2" />
            {/* Bag Handles */}
            <Path d="M75,65 C75,40 105,40 105,65" stroke="#D97706" strokeWidth="3" fill="none" />
            {/* Eco Leaf Stamp on Bag */}
            <Circle cx="90" cy="105" r="14" fill="#059669" />
            <Path d="M90,96 C84,103 86,112 90,114 C94,112 96,103 90,96 Z" fill="#A7F3D0" />

            {/* Reusable Stainless Steel Bottle */}
            <Rect x="150" y="55" width="30" height="90" rx="10" fill="#94A3B8" stroke="#E2E8F0" strokeWidth="2" />
            <Rect x="156" y="42" width="18" height="15" rx="3" fill="#64748B" />
            <Circle cx="165" cy="38" r="4" fill="#475569" />
            {/* Bottle Mint Silicone Band */}
            <Rect x="150" y="85" width="30" height="20" fill="#10B981" />

            {/* Banished Plastic Cross Badge */}
            <Circle cx="215" cy="85" r="20" fill="#7F1D1D" stroke="#EF4444" strokeWidth="2" />
            <Path d="M203,73 L227,97 M227,73 L203,97" stroke="#FEF2F2" strokeWidth="3" strokeLinecap="round" />
          </G>
        )}

        {theme === 'water' && (
          <G transform="translate(65, 15)">
            {/* Modern Clean Tap Aerator */}
            <Path d="M40,55 L90,55 C115,55 125,70 125,95 L125,105" stroke="#CBD5E1" strokeWidth="12" fill="none" strokeLinecap="round" />
            <Rect x="117" y="102" width="16" height="12" rx="2" fill="#0EA5E9" />

            {/* Crystal Water Drops */}
            <Path
              d="M125,125 C120,132 118,140 125,146 C132,140 130,132 125,125 Z"
              fill="#38BDF8"
            />
            <Circle cx="125" cy="116" r="2.5" fill="#7DD3FC" />

            {/* Water Ripple Circles */}
            <Ellipse cx="160" cy="165" rx="50" ry="12" fill="none" stroke="#38BDF8" strokeWidth="2.5" opacity="0.8" />
            <Ellipse cx="160" cy="165" rx="32" ry="8" fill="none" stroke="#7DD3FC" strokeWidth="2" opacity="0.6" />
            <Ellipse cx="160" cy="165" rx="15" ry="4" fill="#0284C7" opacity="0.5" />

            {/* Floating Pure Leaf */}
            <Path d="M195,120 C185,110 185,135 205,132 C210,122 205,115 195,120 Z" fill="#34D399" />
            <Path d="M195,120 L205,132" stroke="#064E3B" strokeWidth="1.2" />
          </G>
        )}

        {theme === 'lighting' && (
          <G transform="translate(75, 15)">
            {/* Modern LED Bulb Base */}
            <Path d="M115,45 C90,45 75,70 85,95 C90,108 98,118 100,130 L130,130 C132,118 140,108 145,95 C155,70 140,45 115,45 Z" fill="#065F46" stroke="#34D399" strokeWidth="2.5" />
            {/* Screw base */}
            <Rect x="102" y="130" width="26" height="16" rx="2" fill="#64748B" />
            <Path d="M102,135 L128,135 M102,140 L128,140" stroke="#94A3B8" strokeWidth="2" />
            <Path d="M107,146 L123,146 L118,152 L112,152 Z" fill="#475569" />

            {/* Glowing Filament & Stars */}
            <Path d="M110,80 L115,70 L120,80" stroke="#FEF08A" strokeWidth="3" fill="none" strokeLinecap="round" />
            <Circle cx="115" cy="72" r="18" fill="#FDE047" opacity="0.25" />

            {/* Energy Star Badge */}
            <Circle cx="180" cy="75" r="18" fill="#047857" stroke="#A7F3D0" strokeWidth="1.8" />
            <Path d="M180,63 L183,72 L192,72 L185,78 L187,87 L180,82 L173,87 L175,78 L168,72 L177,72 Z" fill="#FDE047" />

            {/* Radiating Light Beams */}
            <Path d="M60,65 L45,55 M50,90 L35,92 M65,115 L50,125" stroke="#A7F3D0" strokeWidth="2" strokeLinecap="round" opacity="0.75" />
            <Path d="M170,45 L182,35 M150,30 L155,15" stroke="#A7F3D0" strokeWidth="2" strokeLinecap="round" opacity="0.75" />
          </G>
        )}

        {(theme === 'energy' || theme === 'general') && (
          <G transform="translate(65, 15)">
            {/* Stylized LiFE Green Earth */}
            <Circle cx="125" cy="100" r="48" fill="#047857" stroke="#34D399" strokeWidth="2.5" />
            {/* Continents */}
            <Path d="M105,75 Q125,65 140,80 Q130,95 110,95 Z" fill="#34D399" opacity="0.9" />
            <Path d="M115,110 Q145,100 155,120 Q135,135 115,125 Z" fill="#6EE7B7" opacity="0.85" />

            {/* Orbiting Eco Ring */}
            <Ellipse cx="125" cy="100" rx="72" ry="24" fill="none" stroke="#A7F3D0" strokeWidth="2" strokeDasharray="6 4" opacity="0.85" />
            <Circle cx="185" cy="90" r="5" fill="#FDE047" />

            {/* Sprouting LiFE Plant on top */}
            <Path d="M125,52 Q125,32 125,25" stroke="#A7F3D0" strokeWidth="3.2" strokeLinecap="round" />
            <Path d="M125,32 C114,24 112,40 125,40 Z" fill="#34D399" />
            <Path d="M125,36 C138,28 138,44 125,44 Z" fill="#6EE7B7" />

            {/* Sun Aura */}
            <Circle cx="45" cy="45" r="14" fill="#FDE047" opacity="0.85" />
            <Circle cx="45" cy="45" r="22" fill="#FEF08A" opacity="0.2" />
          </G>
        )}

        {/* Bottom Fade Gradient for seamless transition to dark content */}
        <LinearGradient id="fadeBottom" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0%" stopColor="#022C22" stopOpacity="0" />
          <Stop offset="70%" stopColor="#022C22" stopOpacity="0.65" />
          <Stop offset="100%" stopColor="#064E3B" stopOpacity="1" />
        </LinearGradient>
        <Rect x="0" y="170" width="380" height="60" fill="url(#fadeBottom)" />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    overflow: 'hidden',
    backgroundColor: '#022C22',
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
});
