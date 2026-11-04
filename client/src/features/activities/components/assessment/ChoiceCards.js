import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS, RADII, SPACING } from '../../../../theme';

export default function ChoiceCards({ question, value, onChange }) {
  const options = question.options || [];
  const selectedId = value !== undefined ? value : question.defaultValue;

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{question.label}</Text>
      {question.hint ? <Text style={styles.hint}>{question.hint}</Text> : null}

      <View style={styles.optionsList}>
        {options.map((opt) => {
          const isSelected = selectedId === opt.id;
          return (
            <TouchableOpacity
              key={opt.id}
              style={[styles.card, isSelected && styles.cardSelected]}
              onPress={() => onChange(opt.id)}
              activeOpacity={0.7}
            >
              <View style={styles.cardHeader}>
                <View style={styles.iconAndTitle}>
                  {opt.icon ? <Text style={styles.icon}>{opt.icon}</Text> : null}
                  <Text style={[styles.title, isSelected && styles.titleSelected]}>
                    {opt.label}
                  </Text>
                </View>
                <View style={[styles.radioCircle, isSelected && styles.radioCircleSelected]}>
                  {isSelected ? <View style={styles.radioDot} /> : null}
                </View>
              </View>

              {opt.description ? (
                <Text style={[styles.desc, isSelected && styles.descSelected]}>
                  {opt.description}
                </Text>
              ) : null}
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
  optionsList: {
    gap: 10,
    marginTop: 4,
  },
  card: {
    padding: SPACING.md,
    borderRadius: RADII.md,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    backgroundColor: COLORS.white,
  },
  cardSelected: {
    borderColor: COLORS.primary,
    backgroundColor: '#F0FDF4',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  iconAndTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
    marginRight: 8,
  },
  icon: {
    fontSize: 20,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text,
    flex: 1,
  },
  titleSelected: {
    color: '#15803D',
  },
  desc: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 4,
    lineHeight: 16,
  },
  descSelected: {
    color: '#166534',
  },
  radioCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioCircleSelected: {
    borderColor: COLORS.primary,
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.primary,
  },
});
