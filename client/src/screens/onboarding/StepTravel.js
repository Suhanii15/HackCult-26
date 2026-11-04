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
import { useLanguage, tr } from '../../i18n/LanguageContext';

const TRAVEL_MODES = [
  { key: 'petrol_bike', label: 'Petrol Bike', icon: '🛵', subtitle: 'Motorcycle / Scooter' },
  { key: 'electric_bike', label: 'EV 2-Wheeler', icon: '⚡', subtitle: 'Ather / Ola' },
  { key: 'petrol_car', label: 'Petrol Car', icon: '🚗', subtitle: 'Hatchback / Sedan' },
  { key: 'diesel_car', label: 'Diesel Car', icon: '🚙', subtitle: 'SUV / Sedan' },
  { key: 'electric_car', label: 'Electric Car', icon: '🔋', subtitle: 'Tata EV / MG' },
  { key: 'bus', label: 'City Bus', icon: '🚌', subtitle: 'AMTS / BRTS' },
  { key: 'metro', label: 'Metro', icon: '🚇', subtitle: 'Metro Transit' },
  { key: 'train', label: 'Local Train', icon: '🚆', subtitle: 'Intercity Train' },
  { key: 'auto', label: 'Auto Rickshaw', icon: '🛺', subtitle: 'Shared / Auto' },
];

export default function StepTravel({
  data = {},
  onChange,
  onContinue,
  onSkip,
}) {
  const { t } = useLanguage();
  const [noRegularTravel, setNoRegularTravel] = useState(data.transport?.noRegularTravel || false);
  const [trips, setTrips] = useState(
    data.transport?.trips && data.transport.trips.length > 0
      ? data.transport.trips
      : [{ id: '1', mode: 'petrol_bike', kmPerDay: 20, daysPerMonth: 22 }]
  );
  const [walkAlso, setWalkAlso] = useState(data.transport?.walkAlso || false);
  const [cycleAlso, setCycleAlso] = useState(data.transport?.cycleAlso || false);

  const notifyChange = (updatedTrips, noTravel, walk, cycle) => {
    if (noTravel) {
      onChange({
        transport: {
          noRegularTravel: true,
          trips: [],
          walkAlso: walk,
          cycleAlso: cycle,
        },
      });
      return;
    }

    onChange({
      transport: {
        noRegularTravel: false,
        trips: updatedTrips,
        walkAlso: walk,
        cycleAlso: cycle,
      },
    });
  };

  const handleAddTrip = () => {
    if (trips.length >= 4) return;
    const newTrip = {
      id: String(Date.now()),
      mode: 'bus',
      kmPerDay: 15,
      daysPerMonth: 22,
    };
    const updated = [...trips, newTrip];
    setTrips(updated);
    notifyChange(updated, false, walkAlso, cycleAlso);
  };

  const handleRemoveTrip = (id) => {
    const updated = trips.filter((t) => t.id !== id);
    setTrips(updated);
    notifyChange(updated, false, walkAlso, cycleAlso);
  };

  const handleUpdateTrip = (id, key, value) => {
    const updated = trips.map((t) => (t.id === id ? { ...t, [key]: value } : t));
    setTrips(updated);
    notifyChange(updated, false, walkAlso, cycleAlso);
  };

  const handleToggleNoTravel = () => {
    const next = !noRegularTravel;
    setNoRegularTravel(next);
    notifyChange(trips, next, walkAlso, cycleAlso);
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>{t('step4_title')}</Text>

        {/* <Text style={styles.subtitle}>{t('step4_sub')}</Text> */}

        {/* "I don't travel regularly" explicit zero toggle */}
        <TouchableOpacity
          style={[styles.noTravelBtn, noRegularTravel && styles.noTravelBtnActive]}
          onPress={handleToggleNoTravel}
        >
          <Text style={[styles.noTravelText, noRegularTravel && styles.noTravelTextActive]}>
            {noRegularTravel ? t('no_travel_reported') : t('no_travel_btn')}
          </Text>
        </TouchableOpacity>

        {/* Active Trips Cards */}
        {!noRegularTravel && (
          <View style={styles.tripsSection}>
            {trips.map((trip, index) => {
              const currentModeDef = TRAVEL_MODES.find((m) => m.key === trip.mode) || TRAVEL_MODES[0];

              return (
                <View key={trip.id} style={styles.tripCard}>
                  {/* Trip Card Header */}
                  <View style={styles.tripHeader}>
                    <View style={styles.tripBadge}>
                      <Text style={styles.tripBadgeText}>Trip #{index + 1}</Text>
                    </View>
                    {trips.length > 1 && (
                      <TouchableOpacity
                        onPress={() => handleRemoveTrip(trip.id)}
                        style={styles.removeBtn}
                      >
                        <Text style={styles.removeBtnText}>{tr('✕ Remove')}</Text>
                      </TouchableOpacity>
                    )}
                  </View>

                  {/* Mode Selector Horizontal Scroll */}
                  <Text style={styles.cardLabel}>{t('select_transport_mode')}</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.modeScroll}>
                    {TRAVEL_MODES.map((m) => (
                      <TouchableOpacity
                        key={m.key}
                        style={[styles.modeTile, trip.mode === m.key && styles.modeTileSelected]}
                        onPress={() => handleUpdateTrip(trip.id, 'mode', m.key)}
                      >
                        <Text style={styles.modeIcon}>{m.icon}</Text>
                        <Text style={[styles.modeTitle, trip.mode === m.key && styles.modeTitleSelected]}>
                          {m.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>

                  {/* Selected Mode Summary */}
                  {/* <View style={styles.modeSummaryPill}>
                    <Text style={styles.summaryEmoji}>{currentModeDef.icon}</Text>
                    <Text style={styles.summaryText}>
                      Mode: <Text style={{ fontWeight: '800' }}>{currentModeDef.label}</Text> ({currentModeDef.subtitle})
                    </Text>
                  </View> */}

                  {/* Distance Slider with driving vehicle visual */}
                  <SliderWithPreview
                    value={trip.kmPerDay}
                    min={0}
                    max={100}
                    step={2}
                    unit="km / day"
                    label={t('trip_distance_label')}
                    snapMarks={[10, 20, 35, 60]}
                    onChange={(val) => handleUpdateTrip(trip.id, 'kmPerDay', val)}
                  />

                  {/* Days per month stepper */}
                  <View style={styles.daysRow}>
                    <Text style={styles.daysLabel}>{t('days_travelled_label')}</Text>
                    <View style={styles.daysStepper}>
                      <TouchableOpacity
                        onPress={() => handleUpdateTrip(trip.id, 'daysPerMonth', Math.max(1, trip.daysPerMonth - 1))}
                        style={styles.dayBtn}
                      >
                        <Text style={styles.dayBtnText}>−</Text>
                      </TouchableOpacity>
                      <Text style={styles.dayValue}>{trip.daysPerMonth} days</Text>
                      <TouchableOpacity
                        onPress={() => handleUpdateTrip(trip.id, 'daysPerMonth', Math.min(31, trip.daysPerMonth + 1))}
                        style={styles.dayBtn}
                      >
                        <Text style={styles.dayBtnText}>+</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              );
            })}

            {/* Add another trip button (max 4) */}
            {trips.length < 4 && (
              <TouchableOpacity style={styles.addTripBtn} onPress={handleAddTrip}>
                <Text style={styles.addTripText}>{t('add_trip_btn')}</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Positive eco-habits toggle badges: Walk & Cycle */}
        <View style={styles.ecoBadgesSection}>
          <Text style={styles.ecoSectionTitle}>{t('active_travel_title')}</Text>
          <Text style={styles.ecoSectionDesc}>{t('active_travel_sub')}</Text>
          <View style={styles.badgesRow}>
            <TouchableOpacity
              style={[styles.ecoBadge, walkAlso && styles.ecoBadgeActive]}
              onPress={() => {
                const next = !walkAlso;
                setWalkAlso(next);
                notifyChange(trips, noRegularTravel, next, cycleAlso);
              }}
            >
              <Text style={styles.ecoBadgeEmoji}>🚶</Text>
              <Text style={[styles.ecoBadgeText, walkAlso && styles.ecoBadgeTextActive]}>
                {walkAlso ? t('badge_walk_active') : t('badge_walk')}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.ecoBadge, cycleAlso && styles.ecoBadgeActive]}
              onPress={() => {
                const next = !cycleAlso;
                setCycleAlso(next);
                notifyChange(trips, noRegularTravel, walkAlso, next);
              }}
            >
              <Text style={styles.ecoBadgeEmoji}>🚲</Text>
              <Text style={[styles.ecoBadgeText, cycleAlso && styles.ecoBadgeTextActive]}>
                {cycleAlso ? t('badge_cycle_active') : t('badge_cycle')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Pinned Bottom Footer */}
      <OnboardingFooter
        canContinue={true}
        onContinue={onContinue}
        onSkip={onSkip}
        continueText={t('view_result_btn')}
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
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 4,
    marginBottom: 16,
    lineHeight: 18,
  },
  noTravelBtn: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
    alignItems: 'center',
    marginBottom: 16,
  },
  noTravelBtnActive: {
    borderColor: COLORS.primary,
    backgroundColor: '#F0FDF4',
  },
  noTravelText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  noTravelTextActive: {
    color: COLORS.primaryDark,
    fontWeight: '700',
  },
  tripsSection: {
    marginBottom: 10,
  },
  tripCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  tripHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  tripBadge: {
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  tripBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.primaryDark,
  },
  removeBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  removeBtnText: {
    color: '#EF4444',
    fontSize: 12,
    fontWeight: '700',
  },
  cardLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 8,
  },
  modeScroll: {
    marginBottom: 12,
  },
  modeTile: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 14,
    padding: 12,
    marginRight: 10,
    alignItems: 'center',
    minWidth: 100,
  },
  modeTileSelected: {
    borderColor: COLORS.primary,
    backgroundColor: '#F0FDF4',
  },
  modeIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  modeTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  modeTitleSelected: {
    color: COLORS.primaryDark,
    fontWeight: '800',
  },
  modeSummaryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 12,
  },
  summaryEmoji: {
    fontSize: 16,
    marginRight: 8,
  },
  summaryText: {
    fontSize: 12,
    color: '#374151',
  },
  daysRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  daysLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#374151',
  },
  daysStepper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dayBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayBtnText: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.primaryDark,
    lineHeight: 20,
  },
  dayValue: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginHorizontal: 10,
  },
  addTripBtn: {
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    borderStyle: 'dashed',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F0FDF4',
    marginVertical: 4,
  },
  addTripText: {
    color: COLORS.primaryDark,
    fontSize: 14,
    fontWeight: '700',
  },
  ecoBadgesSection: {
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginTop: 14,
  },
  ecoSectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  ecoSectionDesc: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
    marginBottom: 10,
  },
  badgesRow: {
    flexDirection: 'row',
  },
  ecoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginRight: 10,
  },
  ecoBadgeActive: {
    borderColor: COLORS.primary,
    backgroundColor: '#DCFCE7',
  },
  ecoBadgeEmoji: {
    fontSize: 16,
    marginRight: 6,
  },
  ecoBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4B5563',
  },
  ecoBadgeTextActive: {
    color: '#15803D',
  },
});
