import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, {
  Path,
  Rect,
  Circle,
  Polygon,
  Defs,
  LinearGradient,
  Stop,
  G,
} from 'react-native-svg';

/**
 * Premium Solar Energy Artwork Banner
 * Displayed at the top of the Solar tab landing view
 */
export default function SolarArtwork({ width = '100%', height = 210 }) {
  return (
    <View style={styles.container}>
      <Svg width={width} height={height} viewBox="0 0 380 210" fill="none">
        <Defs>
          {/* Sky Gradient */}
          <LinearGradient id="skyGrad" x1="190" y1="0" x2="190" y2="210">
            <Stop offset="0%" stopColor="#E0F2F1" stopOpacity="0.9" />
            <Stop offset="60%" stopColor="#B2DFDB" stopOpacity="0.7" />
            <Stop offset="100%" stopColor="#F8FAF9" />
          </LinearGradient>

          {/* Sun Glow */}
          <LinearGradient id="sunGlow" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0%" stopColor="#FDE047" />
            <Stop offset="50%" stopColor="#F59E0B" />
            <Stop offset="100%" stopColor="#D97706" />
          </LinearGradient>

          {/* Solar Panel Array Gradient */}
          <LinearGradient id="panelGlass" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0%" stopColor="#1E3A8A" />
            <Stop offset="50%" stopColor="#2563EB" />
            <Stop offset="100%" stopColor="#1D4ED8" />
          </LinearGradient>

          {/* Green Hill Gradient */}
          <LinearGradient id="hillGrad" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor="#A7F3D0" />
            <Stop offset="100%" stopColor="#6EE7B7" />
          </LinearGradient>
        </Defs>

        {/* 1. Sky Backdrop */}
        <Rect width="380" height="210" rx="24" fill="url(#skyGrad)" />

        {/* 2. Golden Sun with Radiating Energy Rings */}
        <Circle cx="310" cy="50" r="46" fill="#FEF3C7" fillOpacity="0.6" />
        <Circle cx="310" cy="50" r="32" fill="#FDE68A" fillOpacity="0.8" />
        <Circle cx="310" cy="50" r="22" fill="url(#sunGlow)" />

        {/* Solar Rays radiating */}
        <Path d="M310 18 L310 10 M310 82 L310 90 M278 50 L270 50 M342 50 L350 50" stroke="#F59E0B" strokeWidth="2.5" strokeLinecap="round" />
        <Path d="M287 27 L281 21 M333 73 L339 79 M287 73 L281 79 M333 27 L339 21" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" />

        {/* 3. Soft Green Landscape & Hills */}
        <Path
          d="M0 160 Q 120 130 240 155 T 380 150 L 380 210 L 0 210 Z"
          fill="url(#hillGrad)"
        />
        <Path
          d="M0 175 Q 160 155 380 170 L 380 210 L 0 210 Z"
          fill="#34D399"
          fillOpacity="0.5"
        />

        {/* 4. Modern Architectural Villa Structure */}
        {/* Main Wall Facade */}
        <Rect x="70" y="90" width="160" height="85" rx="3" fill="#FFFFFF" />
        <Rect x="70" y="86" width="160" height="4" fill="#E2E8F0" />

        {/* Lower Level Windows & Front Door */}
        <Rect x="85" y="125" width="30" height="50" rx="2" fill="#0284C7" fillOpacity="0.9" />
        <Path d="M85 125 L105 125 L85 155 Z" fill="#FFFFFF" fillOpacity="0.35" />

        {/* Entrance Door */}
        <Rect x="130" y="132" width="22" height="43" rx="2" fill="#334155" />
        <Circle cx="148" cy="154" r="1.5" fill="#F8FAFC" />

        {/* Big Panorama Living Room Window */}
        <Rect x="165" y="125" width="50" height="40" rx="2" fill="#0284C7" fillOpacity="0.9" />
        <Path d="M165 125 L195 125 L165 155 Z" fill="#FFFFFF" fillOpacity="0.35" />

        {/* Upper Level Terrace / Balcony */}
        <Rect x="175" y="96" width="45" height="18" rx="2" fill="#0369A1" fillOpacity="0.9" />
        <Rect x="170" y="114" width="55" height="3" fill="#64748B" />

        {/* 5. Gabled Solar Rooftop with PV Panels */}
        {/* Roof Base Eaves */}
        <Polygon points="55,90 150,45 245,90" fill="#334155" />
        <Polygon points="65,88 150,48 235,88" fill="#1E293B" />

        {/* High-Efficiency Blue Solar Photovoltaic Grid Array */}
        <G>
          {/* Left PV String */}
          <Polygon points="75,85 145,52 145,68 75,85" fill="url(#panelGlass)" stroke="#93C5FD" strokeWidth="0.8" />
          <Polygon points="75,72 145,40 145,51 75,72" fill="url(#panelGlass)" stroke="#93C5FD" strokeWidth="0.8" />

          {/* Right PV String */}
          <Polygon points="155,52 225,85 225,68 155,52" fill="url(#panelGlass)" stroke="#93C5FD" strokeWidth="0.8" />
          <Polygon points="155,40 225,72 225,51 155,40" fill="url(#panelGlass)" stroke="#93C5FD" strokeWidth="0.8" />

          {/* Grid Interconnect Busbars */}
          <Path d="M110 46 L110 78 M190 46 L190 78" stroke="#FFFFFF" strokeWidth="0.8" strokeDasharray="2,2" />
        </G>

        {/* Solar Panel Sunlight Reflection Glint */}
        <Circle cx="145" cy="52" r="3.5" fill="#FFFFFF" fillOpacity="0.9" />

        {/* 6. Green Energy Beam connecting Sun to Solar Rooftop */}
        <Path
          d="M290 65 Q 210 50 150 48"
          stroke="#F59E0B"
          strokeWidth="2"
          strokeDasharray="4,4"
        />

        {/* 7. Clean Green Garden Tree next to house */}
        <Rect x="42" y="145" width="6" height="30" fill="#78350F" rx="2" />
        <Circle cx="45" cy="138" r="16" fill="#10B981" />
        <Circle cx="40" cy="132" r="12" fill="#34D399" />
        <Circle cx="50" cy="132" r="12" fill="#059669" />

        {/* Modern EV Charger pillar indicator */}
        <Rect x="238" y="152" width="10" height="22" rx="2" fill="#00897B" />
        <Circle cx="243" cy="158" r="2" fill="#A7F3D0" />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderRadius: 24,
    marginBottom: 12,
  },
});
