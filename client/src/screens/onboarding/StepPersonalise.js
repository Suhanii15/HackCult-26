import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { COLORS } from '../../theme';
import SliderWithPreview from '../../components/SliderWithPreview';
import OnboardingFooter from '../../components/OnboardingFooter';
import { config } from '../../engine';

const HABITS = [
  { key: 'switch_off', label: 'Turn off switches & idle chargers', emoji: '🔌' },
  { key: 'ac_26', label: 'Set AC temperature at 25°C–26°C', emoji: '❄️' },
  { key: 'reusable_bag', label: 'Carry cloth bags & reusable water bottles', emoji: '🛍️' },
  { key: 'segregate_waste', label: 'Segregate wet and dry municipal waste', emoji: '♻️' },
  { key: 'geyser_timer', label: 'Turn off water geyser right after heating', emoji: '🚿' },
];

export default function StepPersonalise({
  mode = 'household',
  data = {},
  onChange,
  onFinish,
  onSkip,
}) {
  const [selectedApps, setSelectedApps] = useState(data.appliances || [
    { key: 'ceiling_fan', count: 3, hoursPerDay: 8 },
    { key: 'ac', count: 1, hoursPerDay: 6 },
    { key: 'refrigerator', count: 1, hoursPerDay: 24 },
    { key: 'led_lights', count: 6, hoursPerDay: 6 },
  ]);

  const [habits, setHabits] = useState(data.habits || {
    switch_off: 'always',
    ac_26: 'always',
    reusable_bag: 'always',
    segregate_waste: 'sometimes',
    geyser_timer: 'always',
  });

  const appKeys = Object.keys(config.appliances);

  const isAppSelected = (key) => selectedApps.some((a) => a.key === key);

  const toggleApp = (key) => {
    let updated;
    if (isAppSelected(key)) {
      updated = selectedApps.filter((a) => a.key !== key);
    } else {
      const def = config.appliances[key];
      updated = [...selectedApps, { key, count: 1, hoursPerDay: def.defaultHours || 4 }];
    }
    setSelectedApps(updated);
    onChange({ appliances: updated, habits });
  };

  const updateAppHours = (key, hours) => {
    const updated = selectedApps.map((a) => (a.key === key ? { ...a, hoursPerDay: hours } : a));
    setSelectedApps(updated);
    onChange({ appliances: updated, habits });
  };

  const setHabitChoice = (key, choice) => {
    const updated = { ...habits, [key]: choice };
    setHabits(updated);
    onChange({ appliances: selectedApps, habits: updated });
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Personalise Your Profile ✦</Text>
        <Text style={styles.subtitle}>
          Help us tailor your weekly AI energy saving tips and Mission LiFE badges.
        </Text>

        {/* Section 1: Home Appliances */}
        <Text style={styles.sectionHeader}>Major Household Appliances</Text>
        <Text style={styles.sectionDesc}>
          Tap to add appliances you use daily. Used for personalized nudges.
        </Text>

        <View style={styles.appGrid}>
          {appKeys.map((key) => {
            const def = config.appliances[key];
            const selected = isAppSelected(key);
            const appData = selectedApps.find((a) => a.key === key);

            return (
              <View key={key} style={[styles.appCard, selected && styles.appCardSelected]}>
                <TouchableOpacity
                  style={styles.appCardHeader}
                  onPress={() => toggleApp(key)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.appTitle}>
                    {selected ? '✓ ' : '+ '} {def.label}
                  </Text>
                  <Text style={styles.appWatts}>
                    {def.watts ? `~${def.watts} W` : `~${def.kwhPerDay} kWh/day`}
                  </Text>
                </TouchableOpacity>

                {selected && (
                  <View style={styles.appSliderWrap}>
                    <SliderWithPreview
                      value={appData?.hoursPerDay || def.defaultHours || 4}
                      min={0.5}
                      max={24}
                      step={0.5}
                      unit="hrs/day"
                      label="Hours used per day"
                      snapMarks={[2, 4, 6, 8]}
                      onChange={(h) => updateAppHours(key, h)}
                    />
                  </View>
                )}
              </View>
            );
          })}
        </View>

        {/* Section 2: Mission LiFE Habits & Pledge */}
        <Text style={[styles.sectionHeader, { marginTop: 24 }]}>Mission LiFE Daily Habits 🌱</Text>
        <Text style={styles.sectionDesc}>
          How often do you follow these eco-friendly habits?
        </Text>

        {HABITS.map((item) => {
          const current = habits[item.key] || 'sometimes';

          return (
            <View key={item.key} style={styles.habitCard}>
              <View style={styles.habitTitleRow}>
                <Text style={styles.habitEmoji}>{item.emoji}</Text>
                <Text style={styles.habitLabel}>{item.label}</Text>
              </View>

              <View style={styles.habitChipsRow}>
                {['always', 'sometimes', 'rarely'].map((choice) => (
                  <TouchableOpacity
                    key={choice}
                    style={[styles.habitChip, current === choice && styles.habitChipActive]}
                    onPress={() => setHabitChoice(item.key, choice)}
                  >
                    <Text style={[styles.habitChipText, current === choice && styles.habitChipTextActive]}>
                      {choice.toUpperCase()}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          );
        })}
      </ScrollView>

      {/* Pinned Bottom Footer */}
      <OnboardingFooter
        canContinue={true}
        onContinue={onFinish}
        onSkip={onSkip}
        continueText="Complete Onboarding & Save Profile"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.textPrimary,
    letterSpacing: -0.4,
  },
  subtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 4,
    marginBottom: 16,
    lineHeight: 18,
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  sectionDesc: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
    marginBottom: 12,
  },
  appGrid: {
    marginBottom: 8,
  },
  appCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
  },
  appCardSelected: {
    borderColor: COLORS.primary,
    backgroundColor: '#F0FDF4',
  },
  appCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  appTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  appWatts: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  appSliderWrap: {
    marginTop: 8,
  },
  habitCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  habitTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  habitEmoji: {
    fontSize: 18,
    marginRight: 10,
  },
  habitLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#374151',
    flex: 1,
  },
  habitChipsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  habitChip: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginHorizontal: 4,
  },
  habitChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  habitChipText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  habitChipTextActive: {
    color: '#FFFFFF',
  },
});
