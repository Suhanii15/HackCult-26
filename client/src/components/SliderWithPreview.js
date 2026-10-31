import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { COLORS } from '../theme';

export default function SliderWithPreview({
  value = 250,
  min = 0,
  max = 1500,
  step = 10,
  unit = 'kWh',
  label = 'Monthly units',
  helperText = '',
  onChange,
  snapMarks = [100, 250, 500, 1000],
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [inputText, setInputText] = useState(String(value));

  const handleInputChange = (text) => {
    setInputText(text);
    const num = parseFloat(text);
    if (!isNaN(num) && num >= min && num <= max) {
      onChange(num);
    }
  };

  const handleStep = (direction) => {
    const next = Math.min(max, Math.max(min, value + direction * step));
    onChange(next);
    setInputText(String(next));
  };

  const handleSnap = (snapVal) => {
    onChange(snapVal);
    setInputText(String(snapVal));
  };

  // Percentage for progress fill
  const percent = Math.min(100, Math.max(0, ((value - min) / (max - min || 1)) * 100));

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.label}>{label}</Text>
        <TouchableOpacity onPress={() => setIsEditing(!isEditing)} style={styles.editToggle}>
          <Text style={styles.editToggleText}>{isEditing ? 'Done' : 'Type exact'}</Text>
        </TouchableOpacity>
      </View>

      {/* Main Preview Display / Input Fallback */}
      <View style={styles.previewBox}>
        {isEditing ? (
          <View style={styles.inputRow}>
            <TextInput
              style={styles.numericInput}
              keyboardType="numeric"
              value={inputText}
              onChangeText={handleInputChange}
              autoFocus
              selectTextOnFocus
            />
            <Text style={styles.unitText}>{unit}</Text>
          </View>
        ) : (
          <TouchableOpacity onPress={() => setIsEditing(true)} style={styles.displayRow}>
            <Text style={styles.valueNumber}>{value}</Text>
            <Text style={styles.unitText}>{unit}</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Slider Track and Stepper Controls */}
      <View style={styles.sliderControlRow}>
        <TouchableOpacity
          onPress={() => handleStep(-1)}
          style={styles.stepBtn}
          accessibilityLabel="Decrease"
        >
          <Text style={styles.stepBtnText}>−</Text>
        </TouchableOpacity>

        {/* Visual Progress Bar */}
        <View style={styles.trackContainer}>
          <View style={[styles.filledTrack, { width: `${percent}%` }]} />
          <View style={[styles.thumb, { left: `${Math.min(94, Math.max(0, percent - 3))}%` }]} />
        </View>

        <TouchableOpacity
          onPress={() => handleStep(1)}
          style={styles.stepBtn}
          accessibilityLabel="Increase"
        >
          <Text style={styles.stepBtnText}>+</Text>
        </TouchableOpacity>
      </View>

      {/* Quick Snap Marks */}
      {snapMarks && snapMarks.length > 0 && (
        <View style={styles.snapRow}>
          {snapMarks.map((mark) => (
            <TouchableOpacity
              key={mark}
              onPress={() => handleSnap(mark)}
              style={[styles.snapChip, value === mark && styles.snapChipActive]}
            >
              <Text style={[styles.snapText, value === mark && styles.snapTextActive]}>
                {mark} {unit}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {helperText ? <Text style={styles.helperText}>{helperText}</Text> : null}
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
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: '#374151',
  },
  editToggle: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
  },
  editToggleText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primaryDark,
  },
  previewBox: {
    alignItems: 'center',
    marginVertical: 6,
  },
  displayRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  valueNumber: {
    fontSize: 36,
    fontWeight: '900',
    color: COLORS.primaryDark,
    letterSpacing: -0.5,
  },
  unitText: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textSecondary,
    marginLeft: 6,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  numericInput: {
    fontSize: 32,
    fontWeight: '900',
    color: COLORS.primaryDark,
    borderBottomWidth: 2,
    borderBottomColor: COLORS.primary,
    paddingHorizontal: 8,
    textAlign: 'center',
    minWidth: 100,
  },
  sliderControlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  stepBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepBtnText: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.primaryDark,
    lineHeight: 22,
  },
  trackContainer: {
    flex: 1,
    height: 10,
    backgroundColor: '#E5E7EB',
    borderRadius: 5,
    marginHorizontal: 12,
    position: 'relative',
    justifyContent: 'center',
  },
  filledTrack: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 5,
  },
  thumb: {
    position: 'absolute',
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#FFFFFF',
    borderWidth: 3,
    borderColor: COLORS.primary,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  snapRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 14,
  },
  snapChip: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
  },
  snapChipActive: {
    backgroundColor: COLORS.primaryLight,
    borderColor: COLORS.primary,
  },
  snapText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  snapTextActive: {
    color: COLORS.primaryDark,
    fontWeight: '800',
  },
  helperText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
    marginTop: 8,
    textAlign: 'center',
  },
});
