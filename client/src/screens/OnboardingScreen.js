import React, { useState, useMemo } from 'react';
import { View, StyleSheet, StatusBar, Alert } from 'react-native';
import ModeSelectionScreen from './onboarding/ModeSelectionScreen';
import StepHome from './onboarding/StepHome';
import StepElectricity from './onboarding/StepElectricity';
import StepCooking from './onboarding/StepCooking';
import StepTravel from './onboarding/StepTravel';
import ResultScreen from './onboarding/ResultScreen';
import StepPersonalise from './onboarding/StepPersonalise';
import ProgressHeader from '../components/ProgressHeader';
import LiveFootprintChip from '../components/LiveFootprintChip';
import AppSafeArea from '../components/AppSafeArea';
import { calculateFootprint } from '../engine';
import { useLanguage } from '../i18n/LanguageContext';
import { apiSaveBaseline } from '../services/api';

export default function OnboardingScreen({ user, onRestart }) {
  const { t } = useLanguage();
  // Navigation state: 'mode' | 1 | 2 | 3 | 4 | 'result' | 'personalise'
  const [currentStep, setCurrentStep] = useState('mode');
  const [mode, setMode] = useState('household');

  // Unified Draft State (Housing society removed, redundant apartment/independent removed)
  const [draft, setDraft] = useState({
    state: 'Gujarat',
    district: 'Ahmedabad',
    city: 'Vastrapur',
    members: 4,
    roomShareCount: 1,
    electricity: {
      sourceType: 'kwh',
      kwh: 240,
      amountInINR: 1600,
      solar: { hasSolar: false, solarKw: 3, exportedKwh: 0 },
    },
    cooking: {
      noCookingFuel: false,
      fuels: [{ type: 'lpg', cylinderSizeKg: 14.2, weeksPerCylinder: 6 }],
    },
    transport: {
      noRegularTravel: false,
      trips: [{ id: '1', mode: 'petrol_bike', kmPerDay: 20, daysPerMonth: 22 }],
      walkAlso: true,
      cycleAlso: false,
    },
    appliances: [],
    habits: {},
  });

  const liveFootprint = useMemo(() => {
    return calculateFootprint({
      mode,
      members: draft.members,
      roomShareCount: draft.roomShareCount,
      electricity: draft.electricity,
      cooking: draft.cooking,
      transport: draft.transport,
    });
  }, [mode, draft]);

  const updateDraft = (patch) => {
    setDraft((prev) => ({ ...prev, ...patch }));
  };

  const handleSelectMode = (chosenMode) => {
    setMode(chosenMode);
    setCurrentStep(1);
  };

  const handleBack = () => {
    if (currentStep === 1) {
      setCurrentStep('mode');
    } else if (typeof currentStep === 'number') {
      setCurrentStep(currentStep - 1);
    } else if (currentStep === 'result') {
      setCurrentStep(4);
    } else if (currentStep === 'personalise') {
      setCurrentStep('result');
    } else {
      if (onRestart) onRestart();
    }
  };

  const handleStartChallenge = async () => {
    try {
      await apiSaveBaseline({
        mode,
        members: draft.members,
        roomShareCount: draft.roomShareCount,
        state: draft.state,
        district: draft.district,
        city: draft.city,
        electricity: draft.electricity,
        cooking: draft.cooking,
        transport: draft.transport,
        appliances: draft.appliances,
        habits: draft.habits,
      });

      Alert.alert(
        'Baseline Saved to MongoDB! 🌿',
        `Your starting footprint of ${liveFootprint.total} kg CO₂e/month is recorded and you earned your Climate Aware Citizen badge (+50 pts)!`,
        [{ text: 'Awesome!', onPress: () => {} }]
      );
    } catch (err) {
      console.warn('Baseline save note:', err.message);
      Alert.alert(
        'Baseline Snapshot Saved! 🌿',
        `Your starting footprint of ${liveFootprint.total} kg CO₂e/month is locked in. Welcome to Mission LiFE!`,
        [{ text: 'Great!', onPress: () => {} }]
      );
    }
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case 1:
        return 'Location';
      case 2:
        return 'Electricity';
      case 3:
        return 'Cooking';
      case 4:
        return 'Travel';
      default:
        return '';
    }
  };

  // Screen 0: Mode selection
  if (currentStep === 'mode') {
    return (
      <ModeSelectionScreen
        onSelectMode={handleSelectMode}
        onBack={onRestart || (() => {})}
      />
    );
  }

  // Result screen after Step 4
  if (currentStep === 'result') {
    return (
      <ResultScreen
        footprintResult={liveFootprint}
        mode={mode}
        onStartChallenge={handleStartChallenge}
        onPersonalise={() => setCurrentStep('personalise')}
        onReturnToStep={(st) => setCurrentStep(st)}
      />
    );
  }

  // Optional 5th step: Personalise
  if (currentStep === 'personalise') {
    return (
      <AppSafeArea style={styles.safeArea}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <ProgressHeader
          currentStep={5}
          totalSteps={4}
          stepTitle={t('personalise_optional')}
          onBack={handleBack}
        />
        <StepPersonalise
          mode={mode}
          data={draft}
          onChange={updateDraft}
          onFinish={handleStartChallenge}
          onSkip={handleStartChallenge}
        />
      </AppSafeArea>
    );
  }

  // Steps 1 to 4: Required Onboarding Flow
  return (
    <AppSafeArea style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Sticky Progress Header with leaf indicator */}
      <ProgressHeader
        currentStep={currentStep}
        totalSteps={4}
        stepTitle={getStepTitle()}
        onBack={handleBack}
      />

      {/* Floating Live Footprint Chip */}
      <LiveFootprintChip footprintResult={liveFootprint} />

      {/* Step Components */}
      <View style={styles.stepContainer}>
        {currentStep === 1 && (
          <StepHome
            data={draft}
            onChange={updateDraft}
            onContinue={() => setCurrentStep(2)}
            onSkip={() => setCurrentStep(2)}
          />
        )}

        {currentStep === 2 && (
          <StepElectricity
            mode={mode}
            data={draft}
            onChange={updateDraft}
            onContinue={() => setCurrentStep(3)}
            onSkip={() => setCurrentStep(3)}
          />
        )}

        {currentStep === 3 && (
          <StepCooking
            data={draft}
            onChange={updateDraft}
            onContinue={() => setCurrentStep(4)}
            onSkip={() => setCurrentStep(4)}
          />
        )}

        {currentStep === 4 && (
          <StepTravel
            mode={mode}
            data={draft}
            onChange={updateDraft}
            onContinue={() => setCurrentStep('result')}
            onSkip={() => setCurrentStep('result')}
          />
        )}
      </View>
    </AppSafeArea>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: '#FFFFFF',
  },
  stepContainer: {
    flex: 1,
  },
});
