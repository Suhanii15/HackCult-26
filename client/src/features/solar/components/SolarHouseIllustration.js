import React from 'react';
import Svg, {
  Path,
  Rect,
  Polygon,
  Circle,
  Defs,
  LinearGradient,
  Stop,
  G,
} from 'react-native-svg';

/**
 * Modern 3D-perspective architectural house with solar rooftop panels
 * matching the visual style in the reference image.
 */
export default function SolarHouseIllustration({ width = 175, height = 130 }) {
  return (
    <Svg width={width} height={height} viewBox="0 0 180 135" fill="none">
      <Defs>
        {/* Sky/Sun Ambient Glow behind the house */}
        <LinearGradient id="sunAura" x1="90" y1="0" x2="90" y2="100">
          <Stop offset="0%" stopColor="#FEF3C7" stopOpacity="0.8" />
          <Stop offset="100%" stopColor="#FEF3C7" stopOpacity="0" />
        </LinearGradient>

        {/* Solar Panel Dark Blue/Navy Glass Gradient */}
        <LinearGradient id="pvPanelGrad" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0%" stopColor="#1E3A8A" />
          <Stop offset="50%" stopColor="#2563EB" />
          <Stop offset="100%" stopColor="#1D4ED8" />
        </LinearGradient>

        {/* Solar Panel Specular Sheen */}
        <LinearGradient id="pvSheen" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0%" stopColor="#60A5FA" stopOpacity="0.8" />
          <Stop offset="100%" stopColor="#1E40AF" stopOpacity="0.9" />
        </LinearGradient>

        {/* Modern House Facade Wall Gradient */}
        <LinearGradient id="wallFront" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0%" stopColor="#FFFFFF" />
          <Stop offset="100%" stopColor="#F1F5F9" />
        </LinearGradient>

        {/* House Shadow Wall Side */}
        <LinearGradient id="wallSide" x1="0" y1="0" x2="1" y2="0">
          <Stop offset="0%" stopColor="#CBD5E1" />
          <Stop offset="100%" stopColor="#94A3B8" />
        </LinearGradient>

        {/* Ground Soft Shadow */}
        <LinearGradient id="groundShadow" x1="90" y1="120" x2="90" y2="135">
          <Stop offset="0%" stopColor="#0F172A" stopOpacity="0.18" />
          <Stop offset="100%" stopColor="#0F172A" stopOpacity="0" />
        </LinearGradient>
      </Defs>

      {/* 1. Ambient Sun Glow */}
      <Circle cx="120" cy="45" r="45" fill="url(#sunAura)" />

      {/* 2. Soft Ground Shadow */}
      <Path
        d="M20 125 C 50 120, 140 120, 170 125 C 150 133, 40 133, 20 125 Z"
        fill="url(#groundShadow)"
      />

      {/* 3. House Main Structure - Left Wing Front Facade */}
      <Polygon
        points="32,70 82,70 82,122 32,122"
        fill="url(#wallFront)"
      />

      {/* Left Wing Architectural Trim / Base */}
      <Rect x="30" y="120" width="54" height="3" fill="#64748B" rx="1" />
      <Rect x="30" y="68" width="54" height="3" fill="#E2E8F0" rx="1" />

      {/* Left Wing Windows */}
      <Rect x="40" y="80" width="16" height="20" rx="2" fill="#0284C7" fillOpacity="0.85" />
      <Rect x="60" y="80" width="16" height="20" rx="2" fill="#0284C7" fillOpacity="0.85" />
      {/* Window Glare Reflection */}
      <Path d="M42 82 L50 82 L42 98 Z" fill="#FFFFFF" fillOpacity="0.4" />
      <Path d="M62 82 L70 82 L62 98 Z" fill="#FFFFFF" fillOpacity="0.4" />

      {/* Entrance Door */}
      <Rect x="48" y="104" width="14" height="17" rx="1" fill="#334155" />
      <Circle cx="59" cy="113" r="1" fill="#F8FAFC" />

      {/* 4. House Right Wing (Set back with angle) */}
      <Polygon
        points="82,58 152,58 152,122 82,122"
        fill="url(#wallSide)"
      />
      <Rect x="80" y="120" width="74" height="3" fill="#475569" rx="1" />

      {/* Right Wing Balcony & Windows */}
      <Rect x="92" y="74" width="22" height="16" rx="2" fill="#0369A1" fillOpacity="0.9" />
      <Rect x="122" y="74" width="22" height="16" rx="2" fill="#0369A1" fillOpacity="0.9" />
      <Rect x="92" y="98" width="52" height="20" rx="2" fill="#1E293B" />
      <Path d="M94 76 L102 76 L94 88 Z" fill="#FFFFFF" fillOpacity="0.3" />

      {/* 5. Pitched Roof Structure */}
      {/* Gable triangular wall */}
      <Polygon points="32,70 57,40 82,70" fill="#E2E8F0" />

      {/* Left Roof Plane Eaves */}
      <Polygon points="26,70 57,38 86,70 80,72 57,44 32,72" fill="#334155" />

      {/* Main Solar Angled Roof Plane (Slanted towards viewer) */}
      <Polygon
        points="57,38 156,26 160,60 84,72"
        fill="#0F172A"
      />

      {/* 6. High-Tech Rooftop Solar Photovoltaic Panel Array */}
      <G>
        {/* Panel Array Outer Border / Frame */}
        <Polygon
          points="62,42 152,31 156,58 86,68"
          fill="#0284C7"
          stroke="#94A3B8"
          strokeWidth="1.2"
        />

        {/* Panel 1 (Top Left) */}
        <Polygon
          points="64,43 105,38 107,49 68,54"
          fill="url(#pvPanelGrad)"
          stroke="#E2E8F0"
          strokeWidth="0.8"
        />
        {/* Panel 2 (Top Right) */}
        <Polygon
          points="107,38 150,33 152,44 109,49"
          fill="url(#pvPanelGrad)"
          stroke="#E2E8F0"
          strokeWidth="0.8"
        />

        {/* Panel 3 (Bottom Left) */}
        <Polygon
          points="68,55 107,50 109,64 72,67"
          fill="url(#pvSheen)"
          stroke="#E2E8F0"
          strokeWidth="0.8"
        />
        {/* Panel 4 (Bottom Right) */}
        <Polygon
          points="109,50 152,45 154,56 111,63"
          fill="url(#pvSheen)"
          stroke="#E2E8F0"
          strokeWidth="0.8"
        />

        {/* Photovoltaic Silicon Cell Grid Lines (Silver Busbars) */}
        <Path
          d="M84 41 L88 52 M128 35 L130 47 M86 53 L90 66 M131 48 L133 60"
          stroke="#93C5FD"
          strokeWidth="0.7"
          strokeDasharray="1,1"
        />
        <Path
          d="M66 48 L151 38 M70 61 L153 51"
          stroke="#93C5FD"
          strokeWidth="0.7"
        />
      </G>

      {/* Solar Panel Specular Sun Glint */}
      <Circle cx="135" cy="38" r="3" fill="#FFFFFF" fillOpacity="0.8" />
      <Path
        d="M135 32 L135 44 M129 38 L141 38"
        stroke="#FFFFFF"
        strokeWidth="1"
        strokeLinecap="round"
      />
    </Svg>
  );
}
