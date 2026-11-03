import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Path, Defs, LinearGradient, Stop, Circle, Line } from 'react-native-svg';
import { COLORS } from '../../../theme';

/**
 * Solar generation daylight bell curve matching the reference UI chart
 */
export default function SolarGenerationWave({ peakKw = 3.0 }) {
  return (
    <View style={styles.container}>
      <Svg width="100%" height="90" viewBox="0 0 320 90" fill="none">
        <Defs>
          {/* Solar gold area gradient */}
          <LinearGradient id="waveFill" x1="160" y1="10" x2="160" y2="75">
            <Stop offset="0%" stopColor="#F59E0B" stopOpacity="0.35" />
            <Stop offset="70%" stopColor="#FDE68A" stopOpacity="0.15" />
            <Stop offset="100%" stopColor="#FEF3C7" stopOpacity="0" />
          </LinearGradient>
        </Defs>

        {/* Shaded Area under diurnal generation curve */}
        <Path
          d="M 10 75 
             C 40 75, 70 70, 95 50
             C 120 30, 140 12, 175 12
             C 210 12, 230 35, 255 55
             C 280 72, 300 75, 310 75
             L 310 75 L 10 75 Z"
          fill="url(#waveFill)"
        />

        {/* Diurnal Generation Wave Curve */}
        <Path
          d="M 10 75 
             C 40 75, 70 70, 95 50
             C 120 30, 140 12, 175 12
             C 210 12, 230 35, 255 55
             C 280 72, 300 75, 310 75"
          stroke="#F59E0B"
          strokeWidth="2.8"
          strokeLinecap="round"
        />

        {/* Secondary subtle reference wave */}
        <Path
          d="M 10 75 
             C 40 73, 80 62, 120 48
             C 150 36, 180 28, 210 32
             C 250 38, 280 65, 310 75"
          stroke="#FCD34D"
          strokeWidth="1.2"
          strokeDasharray="3,3"
          strokeOpacity="0.7"
        />

        {/* Peak Generation Indicator at Midday (12:30 PM) */}
        <Line x1="175" y1="12" x2="175" y2="75" stroke="#F59E0B" strokeWidth="1" strokeDasharray="2,2" strokeOpacity="0.6" />
        <Circle cx="175" cy="12" r="6" fill="#F59E0B" fillOpacity="0.25" />
        <Circle cx="175" cy="12" r="3.5" fill="#F59E0B" stroke="#FFFFFF" strokeWidth="1.5" />
      </Svg>

      {/* Time Markers */}
      <View style={styles.timeLabelsRow}>
        <Text style={styles.timeText}>06:00</Text>
        <Text style={styles.timeText}>09:00</Text>
        <Text style={[styles.timeText, styles.timeTextPeak]}>12:00 (Peak)</Text>
        <Text style={styles.timeText}>15:00</Text>
        <Text style={styles.timeText}>18:00</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 4,
    width: '100%',
  },
  timeLabelsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    marginTop: 2,
  },
  timeText: {
    fontSize: 10,
    color: '#94A3B8',
    fontWeight: '500',
  },
  timeTextPeak: {
    color: '#D97706',
    fontWeight: '700',
  },
});
