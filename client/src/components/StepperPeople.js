import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS } from '../theme';

export default function StepperPeople({
  value = 4,
  min = 1,
  max = 12,
  onChange,
  label = 'Household members',
}) {
  const handleDecrement = () => {
    if (value > min) onChange(value - 1);
  };

  const handleIncrement = () => {
    if (value < max) onChange(value + 1);
  };

  // Generate person avatar icons popping in
  const avatars = Array.from({ length: value }, (_, i) => i + 1);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>

      {/* Stepper control box */}
      <View style={styles.controlRow}>
        <TouchableOpacity
          onPress={handleDecrement}
          disabled={value <= min}
          style={[styles.btn, value <= min && styles.btnDisabled]}
          accessibilityLabel="Decrease count"
        >
          <Text style={[styles.btnText, value <= min && styles.btnTextDisabled]}>−</Text>
        </TouchableOpacity>

        <View style={styles.countBadge}>
          <Text style={styles.countNumber}>{value}</Text>
          <Text style={styles.countUnit}>{value === 1 ? 'person' : 'people'}</Text>
        </View>

        <TouchableOpacity
          onPress={handleIncrement}
          disabled={value >= max}
          style={[styles.btn, value >= max && styles.btnDisabled]}
          accessibilityLabel="Increase count"
        >
          <Text style={[styles.btnText, value >= max && styles.btnTextDisabled]}>+</Text>
        </TouchableOpacity>
      </View>

      {/* Visual Person Avatars Row */}
      <View style={styles.avatarRow}>
        {avatars.map((idx) => (
          <View key={idx} style={styles.avatarChip}>
            <Text style={styles.avatarEmoji}>👤</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    marginVertical: 8,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 10,
  },
  controlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  btn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnDisabled: {
    backgroundColor: '#F3F4F6',
  },
  btnText: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.primaryDark,
    lineHeight: 24,
  },
  btnTextDisabled: {
    color: '#9CA3AF',
  },
  countBadge: {
    alignItems: 'center',
  },
  countNumber: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  countUnit: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginTop: -2,
  },
  avatarRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: 14,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  avatarChip: {
    margin: 3,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarEmoji: {
    fontSize: 14,
  },
});
