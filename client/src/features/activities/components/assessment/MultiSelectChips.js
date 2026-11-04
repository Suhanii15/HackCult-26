import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS, RADII, SPACING } from '../../../../theme';

export default function MultiSelectChips({ question, value = [], onChange }) {
  const selectedValues = Array.isArray(value) ? value : [];

  const handleToggle = (val) => {
    if (selectedValues.includes(val)) {
      onChange(selectedValues.filter((v) => v !== val));
    } else {
      onChange([...selectedValues, val]);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.prompt}>{question.label || question.prompt}</Text>
      {question.hint || question.helperText ? (
        <Text style={styles.helperText}>{question.hint || question.helperText}</Text>
      ) : null}

      <View style={styles.chipsContainer}>
        {question.options.map((option) => {
          const optVal = option.id || option.value;
          const isSelected = selectedValues.includes(optVal);
          return (
            <TouchableOpacity
              key={optVal}
              style={[
                styles.chip,
                isSelected && styles.chipSelected,
              ]}
              onPress={() => handleToggle(optVal)}
              activeOpacity={0.75}
            >
              {option.icon ? (
                <Text style={styles.chipIcon}>{option.icon}</Text>
              ) : null}
              <Text
                style={[
                  styles.chipLabel,
                  isSelected && styles.chipLabelSelected,
                ]}
              >
                {option.label}
              </Text>
              <View
                style={[
                  styles.checkbox,
                  isSelected && styles.checkboxSelected,
                ]}
              >
                {isSelected ? <Text style={styles.checkmark}>✓</Text> : null}
              </View>
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
  prompt: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  helperText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
    lineHeight: 18,
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: RADII.full || 24,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
    marginBottom: 6,
  },
  chipSelected: {
    borderColor: COLORS.primary,
    backgroundColor: '#E0F2F1',
  },
  chipIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  chipLabel: {
    fontSize: 14,
    color: COLORS.textPrimary,
    fontWeight: '500',
    marginRight: 8,
  },
  chipLabelSelected: {
    color: COLORS.primaryDark,
    fontWeight: '700',
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  checkboxSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary,
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '900',
    lineHeight: 12,
  },
});
