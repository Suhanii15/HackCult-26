import React from 'react';
import Svg, { Path, Circle, Rect } from 'react-native-svg';

/**
 * Footprint SVG icon matching the reference image's Carbon Footprint badge
 */
export function FootprintIcon({ size = 22, color = '#00897B' }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {/* Stylized Foot sole */}
      <Path
        d="M14.5 10.5C13.5 8.5 13 6.8 11.8 6.5C10.5 6.2 8.5 7.5 8.5 10C8.5 12 9.5 13.5 9.5 15.5C9.5 17.5 8.5 18.5 8.5 20C8.5 21.8 10 23 12 23C14 23 15.5 21.5 15.5 19C15.5 16.5 15.5 15 15.5 12.5C15.5 11.5 15 11 14.5 10.5Z"
        fill={color}
      />
      {/* 5 Toes */}
      <Circle cx="11.5" cy="3.5" r="1.6" fill={color} />
      <Circle cx="14.5" cy="4.2" r="1.3" fill={color} />
      <Circle cx="16.8" cy="5.8" r="1.1" fill={color} />
      <Circle cx="18.2" cy="8" r="0.9" fill={color} />
      <Circle cx="9" cy="4.2" r="1.1" fill={color} />
    </Svg>
  );
}

/**
 * 3-leaf circular recycling icon matching the reference image's Eco Score badge
 */
export function EcoCycleIcon({ size = 22, color = '#10B981' }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {/* Top Leaf */}
      <Path
        d="M12 2C12 2 15 5 15 7.5C15 9.5 13.5 10.5 12 10.5C10.5 10.5 9 9.5 9 7.5C9 5 12 2 12 2Z"
        fill={color}
      />
      {/* Bottom Right Leaf */}
      <Path
        d="M19 16C19 16 16.5 18.5 14 18C12 17.5 11.5 15.8 12.2 14.5C13 13.2 14.8 13 16.8 13.5C19 14 19 16 19 16Z"
        fill={color}
      />
      {/* Bottom Left Leaf */}
      <Path
        d="M5 16C5 16 5 14 7.2 13.5C9.2 13 11 13.2 11.8 14.5C12.5 15.8 12 17.5 10 18C7.5 18.5 5 16 5 16Z"
        fill={color}
      />
    </Svg>
  );
}

/**
 * Globe + sprout icon for the active habits in-progress card
 */
export function EarthSproutIcon({ size = 24, color = '#00897B' }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {/* Subtle globe circle */}
      <Circle cx="12" cy="14" r="7.5" stroke="#80CBC4" strokeWidth="1.8" fill="#E0F2F1" />
      <Path
        d="M6 14C8 14 9.5 12 12 12C14.5 12 16 14 18 14"
        stroke="#80CBC4"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      {/* Sprout emerging upwards */}
      <Path
        d="M12 14V7"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
      />
      <Path
        d="M12 7C12 4.5 9.5 4.5 9.5 4.5C9.5 7 12 7 12 7Z"
        fill={color}
      />
      <Path
        d="M12 8.5C12 6.5 14.5 6.5 14.5 6.5C14.5 8.5 12 8.5 12 8.5Z"
        fill={color}
      />
    </Svg>
  );
}

/**
 * Clean cosmetic bottle / product SVG for Smart Suggestion card
 */
export function EcoProductIcon({ size = 28 }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {/* Bottle cap */}
      <Rect x="9" y="2" width="6" height="4" rx="1.5" fill="#D97706" />
      {/* Bottle pump collar */}
      <Rect x="8" y="6" width="8" height="2" rx="1" fill="#B45309" />
      {/* Bottle body */}
      <Rect x="7" y="8" width="10" height="14" rx="3" fill="#FDE68A" stroke="#D97706" strokeWidth="1.2" />
      {/* Label on bottle */}
      <Rect x="9" y="11" width="6" height="7" rx="1" fill="#FFFFFF" />
      <Path d="M10.5 13H13.5M10.5 15H12.5" stroke="#D97706" strokeWidth="1" strokeLinecap="round" />
    </Svg>
  );
}

/**
 * Arrow Up-Right diagonal navigation arrow
 */
export function ArrowUpRightIcon({ size = 18, color = '#111827' }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M7 17L17 7M17 7H9M17 7V15"
        stroke={color}
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

/**
 * Heart vector icon for Liked Activities
 */
export function HeartIcon({ size = 20, filled = false, color = '#EF4444' }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? color : 'none'}>
      <Path
        d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
        stroke={filled ? color : '#64748B'}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
