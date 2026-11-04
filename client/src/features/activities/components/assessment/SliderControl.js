import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS, RADII, SPACING } from '../../../../theme';

export default function SliderControl({ question, value, onChange }) {
  const min = question.min || 0;
  const max = question.max || 100;
  const step = question.step || 1;
  const unit = question.unit || '';
  const currentVal = typeof value === 'number' ? value : question.defaultValue || min;

  const handleStepDown = () => {
    const next = Math.max(min, Math.round((currentVal - step) * 100) / 100);
    onChange(next);
  };

  const handleStepUp = () => {
    const next = Math.min(max, Math.round((currentVal + step) * 100) / 100);
    onChange(next);
  };

  // Compute progress percentage
  const pct = Math.max(0, Math.min(100, ((currentVal - min) / (max - min)) * 100));

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{question.label}</Text>
      {question.hint ? <Text style={styles.hint}>{question.hint}</Text> : null}

      <View style={styles.displayRow}>
        <TouchableOpacity
          style={styles.stepBtn}
          onPress={handleStepDown}
          disabled={currentVal <= min}
          activeOpacity={0.7}
        >
          <Text style={[styles.stepBtnText, currentVal <= min && styles.stepBtnDisabled]}>–</Text>
        </TouchableOpacity>

        <View style={styles.valueBadge}>
          <Text style={styles.valueText}>{currentVal}</Text>
          <Text style={styles.unitText}>{unit}</Text>
        </View>

        <TouchableOpacity
          style={styles.stepBtn}
          onPress={handleStepUp}
          disabled={currentVal >= max}
          activeOpacity={0.7}
        >
          <Text style={[styles.stepBtnText, currentVal >= max && styles.stepBtnDisabled]}>+</Text>
        </TouchableOpacity>
      </View>

      {/* Visual Slider Track */}
      <View style={styles.trackContainer}>
        <View style={styles.trackBackground}>
          <View style={[styles.trackFill, { width: `${pct}%` }]} />
        </View>
        <View style={styles.minMaxRow}>
          <Text style={styles.minMaxText}>{min} {unit}</Text>
          <Text style={styles.minMaxText}>{max} {unit}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: SPACING.sm,
  },
  label: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 4,
    lineHeight: 22,
  },
  hint: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  displayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    marginVertical: SPACING.md,
  },
  stepBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#E0F2F1',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#B2DFDB',
  },
  stepBtnText: {
    fontSize: 22,
    fontWeight: '800',
    color: '#00695C',
  },
  stepBtnDisabled: {
    color: '#BDBDBD',
  },
  valueBadge: {
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: RADII.md,
    borderWidth: 1.5,
    borderColor: '#86EFAC',
    alignItems: 'center',
    minWidth: 130,
  },
  valueText: {
    fontSize: 28,
    fontWeight: '900',
    color: '#15803D',
  },
  unitText: {
    fontSize: 12,
    color: '#166534',
    fontWeight: '600',
    marginTop: 2,
  },
  trackContainer: {
    marginTop: SPACING.xs,
  },
  trackBackground: {
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E5E7EB',
    overflow: 'hidden',
  },
  trackFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 4,
  },
  minMaxRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  minMaxText: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
});
