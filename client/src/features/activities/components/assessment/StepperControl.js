import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS, RADII, SPACING } from '../../../../theme';

export default function StepperControl({ question, value, onChange }) {
  const min = question.min || 0;
  const max = question.max || 100;
  const step = question.step || 1;
  const unit = question.unit || '';
  const currentVal = typeof value === 'number' ? value : question.defaultValue || min;

  const handleMinus = () => {
    onChange(Math.max(min, currentVal - step));
  };

  const handlePlus = () => {
    onChange(Math.min(max, currentVal + step));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{question.label}</Text>
      {question.hint ? <Text style={styles.hint}>{question.hint}</Text> : null}

      <View style={styles.stepperRow}>
        <TouchableOpacity
          style={styles.stepperBtn}
          onPress={handleMinus}
          disabled={currentVal <= min}
          activeOpacity={0.7}
        >
          <Text style={[styles.stepperBtnText, currentVal <= min && styles.btnDisabled]}>–</Text>
        </TouchableOpacity>

        <View style={styles.valueBox}>
          <Text style={styles.numberText}>{currentVal}</Text>
          {unit ? <Text style={styles.unitText}>{unit}</Text> : null}
        </View>

        <TouchableOpacity
          style={styles.stepperBtn}
          onPress={handlePlus}
          disabled={currentVal >= max}
          activeOpacity={0.7}
        >
          <Text style={[styles.stepperBtnText, currentVal >= max && styles.btnDisabled]}>+</Text>
        </TouchableOpacity>
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
  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    marginVertical: SPACING.md,
  },
  stepperBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E0F2F1',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#80CBC4',
  },
  stepperBtnText: {
    fontSize: 24,
    fontWeight: '800',
    color: '#00695C',
  },
  btnDisabled: {
    color: '#BDBDBD',
  },
  valueBox: {
    backgroundColor: COLORS.white,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: RADII.md,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    alignItems: 'center',
    minWidth: 140,
  },
  numberText: {
    fontSize: 32,
    fontWeight: '900',
    color: COLORS.text,
  },
  unitText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '600',
    marginTop: 2,
  },
});
