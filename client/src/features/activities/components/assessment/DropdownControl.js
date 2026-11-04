import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS, RADII, SPACING } from '../../../../theme';

export default function DropdownControl({ question, value, onChange }) {
  const options = question.options || [];
  const selectedId = value !== undefined ? value : question.defaultValue;

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{question.label}</Text>
      {question.hint ? <Text style={styles.hint}>{question.hint}</Text> : null}

      <View style={styles.list}>
        {options.map((opt) => {
          const isSelected = selectedId === opt.id;
          return (
            <TouchableOpacity
              key={opt.id}
              style={[styles.item, isSelected && styles.itemSelected]}
              onPress={() => onChange(opt.id)}
              activeOpacity={0.7}
            >
              <Text style={[styles.itemText, isSelected && styles.itemTextSelected]}>
                {opt.label}
              </Text>
              {isSelected ? <Text style={styles.check}>✓</Text> : null}
            </TouchableOpacity>
          );
        })}
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
  list: {
    gap: 8,
    marginTop: 4,
  },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: RADII.md,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    backgroundColor: COLORS.white,
  },
  itemSelected: {
    borderColor: COLORS.primary,
    backgroundColor: '#F0FDF4',
  },
  itemText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    flex: 1,
  },
  itemTextSelected: {
    color: '#15803D',
    fontWeight: '700',
  },
  check: {
    fontSize: 16,
    fontWeight: '800',
    color: '#15803D',
    marginLeft: 8,
  },
});
