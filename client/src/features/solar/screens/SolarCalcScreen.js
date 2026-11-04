import React, { useState, useMemo, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Linking,
  Platform,
} from 'react-native';
import Svg, { Circle, Rect } from 'react-native-svg';
import { TopBar, Button, LottieLoader } from '../../../components/ui';
import { COLORS, RADII, SPACING, TYPOGRAPHY } from '../../../theme';
import { useLanguage } from '../../../i18n/LanguageContext';
import { calculateSolar } from '../api';
import { formatInr } from '../utils/formatters';
import DistrictPickerModal from '../components/DistrictPickerModal';
import EcoMascotSpeech, { EcoMascotGraphic } from '../components/EcoMascot';
import SolarArtwork from '../components/SolarArtwork';
import {
  SunIcon,
  ZapIcon,
  LeafIcon,
  MapPinIcon,
  ChevronDownIcon,
  PhoneIcon,
  UserIcon,
  WhatsAppIcon,
  ArrowLeftIcon,
  CloseIcon,
  StarIcon,
  CheckCircleIcon,
} from '../components/SolarIcons';
import { STATIC_SOLAR_VENDORS } from '../data/staticVendors';

/**
 * PM Surya Ghar Emblem Badge
 */
function PMSuryaGharEmblem({ size = 30 }) {
  const angles = [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330];
  return (
    <View style={styles.emblemContainer}>
      <Svg width={size} height={size} viewBox="0 0 40 40">
        <Circle cx="20" cy="20" r="8" fill="#F59E0B" />
        <Circle cx="20" cy="20" r="4.5" fill="#EF4444" />
        {angles.map((deg) => (
          <Rect
            key={deg}
            x="18.5"
            y="2"
            width="3"
            height="7"
            rx="1.5"
            fill={deg % 60 === 0 ? '#EF4444' : '#F59E0B'}
            transform={`rotate(${deg} 20 20)`}
          />
        ))}
      </Svg>
      <View style={styles.emblemTextCol}>
        <Text style={styles.emblemTitle}>PM Surya Ghar:</Text>
        <Text style={styles.emblemSubtitle}>Muft Bijli Yojana</Text>
      </View>
    </View>
  );
}

/**
 * Multi-Step Stepper Header for Step 1, 2, 3
 */
function WizardHeader({ currentStep, onBack, onClose }) {
  // 1: About you, 2: Location, 3: Consumption
  const stepIndex = currentStep === 'step1' ? 1 : currentStep === 'step2' ? 2 : 3;

  return (
    <View style={styles.wizardHeader}>
      <TouchableOpacity
        onPress={onBack}
        style={styles.headerIconBtn}
        accessibilityLabel="Go back"
        accessibilityRole="button"
      >
        <ArrowLeftIcon size={20} color={COLORS.textPrimary} />
      </TouchableOpacity>

      <View style={styles.stepperCenter}>
        {/* Progress Pill Bar */}
        <View style={styles.progressBarBg}>
          <View
            style={[
              styles.progressBarFill,
              { width: `${(stepIndex / 3) * 100}%` },
            ]}
          />
        </View>

        {/* Step Labels */}
        <View style={styles.stepLabelsRow}>
          <Text
            style={[
              styles.stepLabel,
              stepIndex === 1 && styles.stepLabelActive,
            ]}
          >
            About you
          </Text>
          <Text
            style={[
              styles.stepLabel,
              stepIndex === 2 && styles.stepLabelActive,
            ]}
          >
            Location
          </Text>
          <Text
            style={[
              styles.stepLabel,
              stepIndex === 3 && styles.stepLabelActive,
            ]}
          >
            Consumption
          </Text>
        </View>
      </View>

      <TouchableOpacity
        onPress={onClose}
        style={styles.headerIconBtn}
        accessibilityLabel="Close"
        accessibilityRole="button"
      >
        <CloseIcon size={18} color={COLORS.textSecondary} />
      </TouchableOpacity>
    </View>
  );
}

/**
 * Result / Vendor Header with PM Surya Ghar Branding
 */
function ResultHeader({ onBack, onClose }) {
  return (
    <View style={styles.resultHeader}>
      <TouchableOpacity
        onPress={onBack}
        style={styles.headerIconBtn}
        accessibilityLabel="Go back"
        accessibilityRole="button"
      >
        <ArrowLeftIcon size={20} color={COLORS.textPrimary} />
      </TouchableOpacity>

      <PMSuryaGharEmblem size={28} />

      <TouchableOpacity
        onPress={onClose}
        style={styles.headerIconBtn}
        accessibilityLabel="Close"
        accessibilityRole="button"
      >
        <CloseIcon size={18} color={COLORS.textSecondary} />
      </TouchableOpacity>
    </View>
  );
}

/**
 * Interactive Touch & Drag Slider with Live Floating Tooltip
 */
function InteractiveSlider({
  label,
  value,
  min,
  max,
  step = 1,
  ticks = [],
  formatValue = (v) => String(v),
  onChange,
  onSlidingStart,
  onSlidingEnd,
  accentColor = '#F59E0B',
  trackBgColor = '#FED7AA',
}) {
  const [trackWidth, setTrackWidth] = useState(0);
  const touchOriginX = useRef(0);

  const percent = Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100));

  const updateValueFromPageX = (pageX) => {
    if (trackWidth <= 0) return;
    const offsetX = pageX - touchOriginX.current;
    const ratio = Math.max(0, Math.min(1, offsetX / trackWidth));
    const rawVal = min + ratio * (max - min);
    const steppedVal = Math.round(rawVal / step) * step;
    const cleanVal = Number(steppedVal.toFixed(2));
    const finalVal = Math.max(min, Math.min(max, cleanVal));
    onChange(finalVal);
  };

  const handleStep = (delta) => {
    const nextVal = Math.max(min, Math.min(max, Number((value + delta).toFixed(2))));
    onChange(nextVal);
  };

  const tooltipWidth = 68;
  const thumbDiameter = 26;
  const thumbX = trackWidth > 0 ? (percent / 100) * (trackWidth - thumbDiameter) : 0;
  const tooltipX = trackWidth > 0 ? (percent / 100) * (trackWidth - tooltipWidth) : 0;

  return (
    <View style={styles.sliderGroup}>
      {/* Label and Stepper Nudge Buttons */}
      <View style={styles.sliderHeaderRow}>
        <Text style={styles.fieldLabel}>
          {label} <Text style={styles.requiredAsterisk}>*</Text>
        </Text>
        <View style={styles.stepperMiniBtns}>
          <TouchableOpacity
            style={styles.stepperNudgeBtn}
            onPress={() => handleStep(-step * (label.includes('Bill') ? 5 : 1))}
            activeOpacity={0.7}
            accessibilityLabel={`Decrease ${label}`}
          >
            <Text style={styles.stepperNudgeBtnText}>−</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.stepperNudgeBtn}
            onPress={() => handleStep(step * (label.includes('Bill') ? 5 : 1))}
            activeOpacity={0.7}
            accessibilityLabel={`Increase ${label}`}
          >
            <Text style={styles.stepperNudgeBtnText}>+</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Floating Tooltip Pill following the thumb */}
      <View style={styles.floatingTooltipTrackArea}>
        <View
          style={[
            styles.floatingTooltipPillWrapper,
            trackWidth > 0
              ? { left: tooltipX }
              : { left: `${percent}%`, transform: [{ translateX: -34 }] },
          ]}
        >
          <View style={styles.tooltipPill}>
            <Text style={styles.tooltipPillText}>{formatValue(value)}</Text>
            <View style={styles.tooltipArrow} />
          </View>
        </View>
      </View>

      {/* Touch-Seeking & Draggable Slider Track */}
      <View
        style={styles.interactiveHitZone}
        onLayout={(e) => {
          const w = e.nativeEvent.layout.width;
          if (w > 0) setTrackWidth(w);
        }}
        onStartShouldSetResponder={() => true}
        onMoveShouldSetResponder={() => true}
        onResponderTerminationRequest={() => false}
        onResponderGrant={(evt) => {
          onSlidingStart && onSlidingStart();
          touchOriginX.current = evt.nativeEvent.pageX - evt.nativeEvent.locationX;
          updateValueFromPageX(evt.nativeEvent.pageX);
        }}
        onResponderMove={(evt) => {
          updateValueFromPageX(evt.nativeEvent.pageX);
        }}
        onResponderRelease={() => {
          onSlidingEnd && onSlidingEnd();
        }}
        onResponderTerminate={() => {
          onSlidingEnd && onSlidingEnd();
        }}
      >
        {/* Track Bar Background */}
        <View style={[styles.trackBgBar, { backgroundColor: trackBgColor }]} />

        {/* Track Fill */}
        <View
          style={[
            styles.trackFillBar,
            { width: `${percent}%`, backgroundColor: accentColor },
          ]}
        />

        {/* Glowing Thumb Sphere */}
        <View
          style={[
            styles.sliderThumbSphere,
            trackWidth > 0
              ? { left: thumbX, backgroundColor: accentColor }
              : {
                  left: `${percent}%`,
                  transform: [{ translateX: -13 }],
                  backgroundColor: accentColor,
                },
          ]}
        />
      </View>

      {/* Tick Marks & Labels below */}
      <View style={styles.ticksRow}>
        {ticks.map((val) => {
          const isSelected = Math.abs(value - val) < step / 2;
          return (
            <TouchableOpacity
              key={val}
              onPress={() => onChange(val)}
              style={styles.tickCol}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel={`Set to ${formatValue(val)}`}
            >
              <View
                style={[
                  styles.tickMarker,
                  isSelected && styles.tickMarkerActive,
                ]}
              />
              <Text
                style={[
                  styles.tickLabel,
                  isSelected && styles.tickLabelActive,
                ]}
              >
                {formatValue(val)}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

export default function SolarCalcScreen({ navigation, user }) {
  const { t } = useLanguage();

  // Active step: 'landing' | 'step1' | 'step2' | 'step3' | 'step4' | 'step5'
  const [activeStep, setActiveStep] = useState('landing');

  // Form Inputs
  const [fullName, setFullName] = useState(
    user?.name || user?.fullName || 'Shravani Pachkawade'
  );
  const [mobileNumber, setMobileNumber] = useState(
    user?.phone || user?.mobile || '8369140551'
  );
  const [selectedState, setSelectedState] = useState(user?.state || 'GUJARAT');
  const [selectedDistrict, setSelectedDistrict] = useState(
    user?.district || 'Gandhinagar'
  );
  const [monthlyBill, setMonthlyBill] = useState(5000);
  const [sanctionedLoad, setSanctionedLoad] = useState(5); // 5 kW default

  // Modals & UI States
  const [isDistrictPickerOpen, setIsDistrictPickerOpen] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);
  const [assessment, setAssessment] = useState(null);
  const [isScrollEnabled, setIsScrollEnabled] = useState(true);

  // Bill & Load Stepper ticks
  const billTicks = [500, 2500, 5000, 7500, 10000];
  const loadTicks = [1, 2.5, 5, 7.5, 10];

  // Perform assessment calculation
  const handleCalculate = useCallback(async () => {
    setIsCalculating(true);
    try {
      const roofAreaSqft = Math.max(100, Math.round(sanctionedLoad * 100));
      const res = await calculateSolar({
        monthlyBillInr: monthlyBill,
        roofAreaSqft,
        district: selectedDistrict,
        state: selectedState,
      });
      setAssessment(res);
      setActiveStep('step4');
    } catch (err) {
      // Graceful fallback to static estimates if calculation fails
      setActiveStep('step4');
    } finally {
      setIsCalculating(false);
    }
  }, [monthlyBill, sanctionedLoad, selectedDistrict, selectedState]);

  // Filtered vendors for Step 5
  const displayedVendors = useMemo(() => {
    const matched = STATIC_SOLAR_VENDORS.filter(
      (v) =>
        v.districts &&
        v.districts.some(
          (d) => d.toLowerCase() === selectedDistrict.toLowerCase()
        )
    );
    return matched.length >= 2 ? matched : STATIC_SOLAR_VENDORS;
  }, [selectedDistrict]);

  // Derived values for Step 4
  const capacityKw = useMemo(() => {
    if (assessment?.capacityKw) return assessment.capacityKw.toFixed(1);
    return sanctionedLoad.toFixed(1);
  }, [assessment, sanctionedLoad]);

  const grossCostFormatted = useMemo(() => {
    if (assessment?.financials?.grossCostInr) {
      return formatInr(assessment.financials.grossCostInr);
    }
    // Standard benchmark: ~₹50,000 / kW
    return formatInr(sanctionedLoad * 50000);
  }, [assessment, sanctionedLoad]);

  const subsidyFormatted = useMemo(() => {
    if (assessment?.financials?.centralSubsidyInr) {
      return formatInr(assessment.financials.centralSubsidyInr);
    }
    // PM Surya Ghar standard: ₹78,000 for 3kW+
    return sanctionedLoad >= 3 ? '₹78,000' : '₹60,000';
  }, [assessment, sanctionedLoad]);

  const lifetimeSavingsLakhs = useMemo(() => {
    if (assessment?.financials?.lifetimeGrossSavingsInr) {
      const lakhs = (
        assessment.financials.lifetimeGrossSavingsInr / 100000
      ).toFixed(2);
      return `₹${lakhs}L`;
    }
    // Estimated 25-yr lifetime savings ~ 25 * 12 * (monthlyBill * 0.8)
    const annualEst = monthlyBill * 0.85 * 12 * 25;
    return `₹${(annualEst / 100000).toFixed(2)}L`;
  }, [assessment, monthlyBill]);

  // Handle dial call
  const handleCallVendor = (phone) => {
    const cleanNumber = phone.replace(/[^0-9+]/g, '');
    Linking.openURL(`tel:${cleanNumber}`).catch(() => {});
  };

  // Handle WhatsApp
  const handleWhatsAppVendor = (whatsapp, name) => {
    const msg = encodeURIComponent(
      `Hello ${name}, I saw your profile on Mission LiFE PM Surya Ghar solar portal. I want to book a free rooftop home inspection for ${capacityKw} kW in ${selectedDistrict}.`
    );
    Linking.openURL(`https://wa.me/${whatsapp}?text=${msg}`).catch(() => {});
  };

  // =========================================================================
  // VIEW 1: LANDING VIEW
  // =========================================================================
  if (activeStep === 'landing') {
    return (
      <View style={styles.mainContainer}>
        <TopBar title={t('tab_solar') || 'Solar Rooftop'} user={user} />
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.landingContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Top High-Quality Solar Artwork */}
          <SolarArtwork />

          {/* "Try out solar calculator" Main Card */}
          <View style={styles.landingCard}>

            <Text style={styles.landingTitle}>Try out solar calculator</Text>

            <Text style={styles.landingDescription}>
              To Calculate your potential savings from solar and fixing a free
              home visit with the best vendors in your area.
            </Text>

            {/* Benefit Highlights */}
            <View style={styles.highlightsContainer}>
              <View style={styles.highlightRow}>
                <View style={styles.highlightCheck}>
                  <CheckCircleIcon size={16} color={COLORS.success} />
                </View>
                <Text style={styles.highlightText}>
                  Get up to ₹78,000 direct Govt. of India subsidy
                </Text>
              </View>

              <View style={styles.highlightRow}>
                <View style={styles.highlightCheck}>
                  <CheckCircleIcon size={16} color={COLORS.success} />
                </View>
                <Text style={styles.highlightText}>
                  Collateral-free green bank loans at &lt;6% interest
                </Text>
              </View>

              <View style={styles.highlightRow}>
                <View style={styles.highlightCheck}>
                  <CheckCircleIcon size={16} color={COLORS.success} />
                </View>
                <Text style={styles.highlightText}>
                  Verified empanelled EPC partners for {selectedDistrict}
                </Text>
              </View>
            </View>

            {/* Primary Action Button */}
            <TouchableOpacity
              style={styles.primaryActionButton}
              onPress={() => setActiveStep('step1')}
              activeOpacity={0.88}
              accessibilityRole="button"
              accessibilityLabel="Start Solar Calculator"
            >
              <ZapIcon size={20} color="#FFFFFF" />
              <Text style={styles.primaryActionBtnText}>
                Start Solar Calculator
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    );
  }

  // =========================================================================
  // VIEW 2: STEP 1 - ABOUT YOU
  // =========================================================================
  if (activeStep === 'step1') {
    return (
      <View style={styles.mainContainer}>
        <WizardHeader
          currentStep="step1"
          onBack={() => setActiveStep('landing')}
          onClose={() => setActiveStep('landing')}
        />

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.stepContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Mascot Speech Bubble */}
          <EcoMascotSpeech
            title="Get your solar plan estimate in just 3 steps"
            subtitle="Please fill in your name and mobile number"
          />

          {/* Form Card */}
          <View style={styles.formCard}>
            {/* Full Name Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.fieldLabel}>
                Full Name <Text style={styles.requiredAsterisk}>*</Text>
              </Text>
              <View style={styles.inputBox}>
                <View style={styles.inputIconWrapper}>
                  <UserIcon size={20} color={COLORS.textSecondary} />
                </View>
                <TextInput
                  style={styles.textInput}
                  value={fullName}
                  onChangeText={setFullName}
                  placeholder="Enter your full name"
                  placeholderTextColor={COLORS.textMuted}
                  autoCapitalize="words"
                />
              </View>
            </View>

            {/* Mobile Number Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.fieldLabel}>
                Mobile Number <Text style={styles.requiredAsterisk}>*</Text>
              </Text>
              <View style={styles.inputBox}>
                <View style={styles.inputIconWrapper}>
                  <PhoneIcon size={20} color={COLORS.textSecondary} />
                </View>
                <TextInput
                  style={styles.textInput}
                  value={mobileNumber}
                  onChangeText={setMobileNumber}
                  placeholder="10-digit mobile number"
                  placeholderTextColor={COLORS.textMuted}
                  keyboardType="phone-pad"
                  maxLength={10}
                />
              </View>
            </View>
          </View>

          {/* Continue Button */}
          <TouchableOpacity
            style={[
              styles.primaryActionButton,
              styles.bottomContinueBtn,
              (!fullName.trim() || mobileNumber.length < 10) &&
                styles.btnDisabled,
            ]}
            onPress={() => setActiveStep('step2')}
            disabled={!fullName.trim() || mobileNumber.length < 10}
            activeOpacity={0.88}
          >
            <Text style={styles.primaryActionBtnText}>Continue</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    );
  }

  // =========================================================================
  // VIEW 3: STEP 2 - LOCATION
  // =========================================================================
  if (activeStep === 'step2') {
    return (
      <View style={styles.mainContainer}>
        <WizardHeader
          currentStep="step2"
          onBack={() => setActiveStep('step1')}
          onClose={() => setActiveStep('landing')}
        />

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.stepContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Mascot Speech Bubble */}
          <EcoMascotSpeech
            title="Get your solar plan estimate in just 2 steps"
            subtitle="Please select your state and district"
          />

          {/* Form Card */}
          <View style={styles.formCard}>
            {/* State Picker Row */}
            <View style={styles.inputGroup}>
              <Text style={styles.fieldLabel}>
                State <Text style={styles.requiredAsterisk}>*</Text>
              </Text>
              <View style={styles.pickerBox}>
                <View style={styles.inputIconWrapper}>
                  <MapPinIcon size={20} color={COLORS.primary} />
                </View>
                <Text style={styles.pickerValueText}>{selectedState}</Text>
                <ChevronDownIcon size={16} color={COLORS.textSecondary} />
              </View>
            </View>

            {/* District Picker Row */}
            <View style={styles.inputGroup}>
              <Text style={styles.fieldLabel}>
                District <Text style={styles.requiredAsterisk}>*</Text>
              </Text>
              <TouchableOpacity
                style={styles.pickerBox}
                onPress={() => setIsDistrictPickerOpen(true)}
                activeOpacity={0.8}
                accessibilityRole="button"
                accessibilityLabel="Select district"
              >
                <View style={styles.inputIconWrapper}>
                  <MapPinIcon size={20} color={COLORS.primary} />
                </View>
                <Text style={styles.pickerValueText}>{selectedDistrict}</Text>
                <ChevronDownIcon size={16} color={COLORS.textSecondary} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Continue Button */}
          <TouchableOpacity
            style={[styles.primaryActionButton, styles.bottomContinueBtn]}
            onPress={() => setActiveStep('step3')}
            activeOpacity={0.88}
          >
            <Text style={styles.primaryActionBtnText}>Continue</Text>
          </TouchableOpacity>
        </ScrollView>

        {/* District Picker Modal */}
        <DistrictPickerModal
          visible={isDistrictPickerOpen}
          selectedDistrict={selectedDistrict}
          onSelect={(d) => {
            setSelectedDistrict(d);
            setIsDistrictPickerOpen(false);
          }}
          onClose={() => setIsDistrictPickerOpen(false)}
        />
      </View>
    );
  }

  // =========================================================================
  // VIEW 4: STEP 3 - CONSUMPTION
  // =========================================================================
  if (activeStep === 'step3') {
    return (
      <View style={styles.mainContainer}>
        <WizardHeader
          currentStep="step3"
          onBack={() => setActiveStep('step2')}
          onClose={() => setActiveStep('landing')}
        />

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.stepContent}
          showsVerticalScrollIndicator={false}
          scrollEnabled={isScrollEnabled}
        >
          {/* Mascot Speech Bubble */}
          <EcoMascotSpeech
            title="Just one more step for your solar plan"
            subtitle="Please indicate your last month's electricity bill and your sanctioned load"
          />

          {/* Slider Inputs Card */}
          <View style={styles.formCard}>
            {/* 1. Monthly Electricity Bill Slider */}
            <InteractiveSlider
              label="Last Month's Electricity Bill"
              value={monthlyBill}
              min={500}
              max={10000}
              step={100}
              ticks={billTicks}
              formatValue={(val) => `₹${val.toLocaleString('en-IN')}`}
              onChange={setMonthlyBill}
              onSlidingStart={() => setIsScrollEnabled(false)}
              onSlidingEnd={() => setIsScrollEnabled(true)}
              accentColor="#F59E0B"
              trackBgColor="#FED7AA"
            />

            <View style={styles.formDivider} />

            {/* 2. Sanctioned Load Slider */}
            <InteractiveSlider
              label="Sanctioned Load"
              value={sanctionedLoad}
              min={1}
              max={10}
              step={0.5}
              ticks={loadTicks}
              formatValue={(val) => `${val}kW`}
              onChange={setSanctionedLoad}
              onSlidingStart={() => setIsScrollEnabled(false)}
              onSlidingEnd={() => setIsScrollEnabled(true)}
              accentColor="#F59E0B"
              trackBgColor="#FED7AA"
            />
          </View>

          {/* Continue Button */}
          <TouchableOpacity
            style={[styles.primaryActionButton, styles.bottomContinueBtn]}
            onPress={handleCalculate}
            disabled={isCalculating}
            activeOpacity={0.88}
          >
            {isCalculating ? (
              <LottieLoader size={24} color="#FFFFFF" />
            ) : (
              <Text style={styles.primaryActionBtnText}>Continue</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </View>
    );
  }

  // =========================================================================
  // VIEW 5: STEP 4 - SOLAR PLAN ESTIMATE
  // =========================================================================
  if (activeStep === 'step4') {
    return (
      <View style={styles.mainContainer}>
        <ResultHeader
          onBack={() => setActiveStep('step3')}
          onClose={() => setActiveStep('landing')}
        />

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.stepContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Mascot Speech Bubble */}
          <EcoMascotSpeech
            title={`Hi ${fullName}!`}
            subtitle="Congratulations, find below the detailed plan for lifetime savings"
            badgeText="⚡ CLEAN ENERGY"
          />

          {/* 4 Grid Cards (2x2 layout matching reference screenshot) */}
          <View style={styles.metricGrid}>
            {/* Card 1: Capacity */}
            <View style={styles.metricCard}>
              <Text style={styles.metricCardLabel}>Solar plant capacity</Text>
              <Text style={styles.metricCardValue}>{capacityKw} kW</Text>
            </View>

            {/* Card 2: Cost */}
            <View style={styles.metricCard}>
              <Text style={styles.metricCardLabel}>Total Solar Plant cost</Text>
              <Text style={styles.metricCardValue}>{grossCostFormatted}</Text>
            </View>

            {/* Card 3: Central Subsidy */}
            <View style={styles.metricCard}>
              <Text style={styles.metricCardLabel}>Govt of India Subsidy</Text>
              <Text style={[styles.metricCardValue, styles.subsidyValue]}>
                {subsidyFormatted}
              </Text>
            </View>

            {/* Card 4: Bank Loan */}
            <View style={styles.metricCard}>
              <Text style={styles.metricCardLabel}>Bank Loan available</Text>
              <Text style={styles.metricCardValue}>&lt;6% interest</Text>
            </View>
          </View>

          {/* Big Lifetime Savings Hero Callout */}
          <View style={styles.lifetimeSavingsBlock}>
            <Text style={styles.lifetimeSavingsLabel}>
              Total lifetime savings
            </Text>
            <Text style={styles.lifetimeSavingsValue}>
              {lifetimeSavingsLakhs}
            </Text>
            <Text style={styles.lifetimeSavingsSub}>
              Estimated generation & bill offset across 25 years lifecycle
            </Text>
          </View>

          {/* See Nearby Vendors CTA */}
          <TouchableOpacity
            style={[styles.primaryActionButton, styles.bottomContinueBtn]}
            onPress={() => setActiveStep('step5')}
            activeOpacity={0.88}
          >
            <Text style={styles.primaryActionBtnText}>See nearby vendors</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    );
  }

  // =========================================================================
  // VIEW 6: STEP 5 - RECOMMENDED PARTNERS / NEARBY VENDORS
  // =========================================================================
  return (
    <View style={styles.mainContainer}>
      <ResultHeader
        onBack={() => setActiveStep('step4')}
        onClose={() => setActiveStep('landing')}
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.stepContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Mascot Speech Bubble */}
        <EcoMascotSpeech
          title={`Hi ${fullName}!`}
          subtitle="Your solar plan is ready! Here are a few recommended partners for you!"
        />

        {/* Partner Cards matching reference screenshot */}
        <View style={styles.vendorsList}>
          {displayedVendors.map((vendor) => (
            <View key={vendor._id || vendor.name} style={styles.vendorCard}>
              {/* Vendor Company Name */}
              <Text style={styles.vendorName}>{vendor.name}</Text>

              {/* Location Row */}
              <View style={styles.vendorLocationRow}>
                <MapPinIcon size={14} color={COLORS.primary} />
                <Text style={styles.vendorLocationText}>
                  {vendor.districts?.[0] || selectedDistrict}
                </Text>
              </View>

              {/* Rating Badge */}
              <View style={styles.vendorRatingBadge}>
                <StarIcon size={12} color="#D97706" />
                <Text style={styles.vendorRatingText}>
                  {vendor.rating ? vendor.rating.toFixed(1) : '4.9'}
                </Text>
              </View>

              {/* Action Buttons Row */}
              <View style={styles.vendorActionsRow}>
                <TouchableOpacity
                  style={styles.vendorCallBtn}
                  onPress={() => handleCallVendor(vendor.phone)}
                  activeOpacity={0.8}
                >
                  <PhoneIcon size={16} color="#92400E" />
                  <Text style={styles.vendorCallBtnText}>Call now</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.vendorWhatsAppBtn}
                  onPress={() =>
                    handleWhatsAppVendor(vendor.whatsapp, vendor.name)
                  }
                  activeOpacity={0.8}
                >
                  <WhatsAppIcon size={16} color="#065F46" />
                  <Text style={styles.vendorWhatsAppBtnText}>WhatsApp Us</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

        {/* Secondary Recalculate Option */}
        <TouchableOpacity
          style={styles.secondaryRecalcBtn}
          onPress={() => setActiveStep('step1')}
          activeOpacity={0.8}
        >
          <Text style={styles.secondaryRecalcText}>
            Recalculate with different bill
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#F8FAF9',
  },
  scroll: {
    flex: 1,
  },

  // Headers
  wizardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 48 : 16,
    paddingBottom: 12,
    backgroundColor: '#F8FAF9',
    borderBottomWidth: 1,
    borderBottomColor: '#EEF2F6',
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 48 : 16,
    paddingBottom: 12,
    backgroundColor: '#F8FAF9',
    borderBottomWidth: 1,
    borderBottomColor: '#EEF2F6',
  },
  headerIconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    elevation: 1,
  },
  stepperCenter: {
    flex: 1,
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  progressBarBg: {
    width: '90%',
    height: 4,
    backgroundColor: '#E2E8F0',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 6,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 2,
  },
  stepLabelsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '95%',
  },
  stepLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#94A3B8',
  },
  stepLabelActive: {
    color: COLORS.primaryDark,
    fontWeight: '800',
  },

  // PM Surya Ghar Emblem in header
  emblemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  emblemTextCol: {
    marginLeft: 8,
  },
  emblemTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
    lineHeight: 16,
  },
  emblemSubtitle: {
    fontSize: 11,
    fontWeight: '600',
    color: '#475569',
    lineHeight: 14,
  },

  // Landing view
  landingContent: {
    paddingBottom: 36,
  },
  landingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    marginHorizontal: 16,
    marginTop: -24,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  landingBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  landingBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#92400E',
    marginLeft: 6,
  },
  landingTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 8,
  },
  landingDescription: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 21,
    marginBottom: 16,
  },
  highlightsContainer: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 14,
    marginBottom: 20,
  },
  highlightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  highlightCheck: {
    marginRight: 10,
  },
  highlightText: {
    fontSize: 13.5,
    fontWeight: '600',
    color: '#1E293B',
    flex: 1,
  },

  // Wizard Step Content
  stepContent: {
    paddingBottom: 40,
  },
  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    marginHorizontal: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 18,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 8,
  },
  requiredAsterisk: {
    color: '#EF4444',
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    paddingHorizontal: 14,
    height: 52,
  },
  inputIconWrapper: {
    marginRight: 10,
  },
  textInput: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: '#0F172A',
  },
  pickerBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    paddingHorizontal: 14,
    height: 52,
  },
  pickerValueText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },

  // Sliders in Step 3
  sliderGroup: {
    marginVertical: 4,
  },
  sliderHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  stepperMiniBtns: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepperNudgeBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  stepperNudgeBtnText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#334155',
    lineHeight: 18,
  },
  floatingTooltipTrackArea: {
    height: 38,
    position: 'relative',
    justifyContent: 'flex-end',
    marginBottom: 2,
  },
  floatingTooltipPillWrapper: {
    position: 'absolute',
    bottom: 0,
    width: 68,
    alignItems: 'center',
  },
  tooltipPill: {
    backgroundColor: '#FEF3C7',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FDE68A',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 52,
    position: 'relative',
    shadowColor: '#D97706',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 2,
  },
  tooltipPillText: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#78350F',
  },
  tooltipArrow: {
    position: 'absolute',
    bottom: -5,
    width: 0,
    height: 0,
    borderLeftWidth: 5,
    borderLeftColor: 'transparent',
    borderRightWidth: 5,
    borderRightColor: 'transparent',
    borderTopWidth: 5,
    borderTopColor: '#FEF3C7',
  },
  interactiveHitZone: {
    height: 40,
    justifyContent: 'center',
    position: 'relative',
  },
  trackBgBar: {
    height: 10,
    borderRadius: 5,
    width: '100%',
  },
  trackFillBar: {
    position: 'absolute',
    left: 0,
    height: 10,
    borderRadius: 5,
  },
  sliderThumbSphere: {
    position: 'absolute',
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 3,
    borderColor: '#FFFFFF',
    shadowColor: '#D97706',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.45,
    shadowRadius: 6,
    elevation: 5,
    top: 7,
  },
  ticksRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 2,
    marginTop: 6,
  },
  tickCol: {
    alignItems: 'center',
  },
  tickMarker: {
    width: 1.5,
    height: 6,
    backgroundColor: '#CBD5E1',
    marginBottom: 4,
  },
  tickMarkerActive: {
    backgroundColor: '#D97706',
    width: 2,
    height: 8,
  },
  tickLabel: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
  },
  tickLabelActive: {
    color: '#0F172A',
    fontWeight: '800',
  },
  formDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 18,
  },

  // Common Action Buttons
  primaryActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#00897B', // Our brand primary
    height: 54,
    borderRadius: 27,
    shadowColor: '#00897B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  primaryActionBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    marginLeft: 6,
  },
  bottomContinueBtn: {
    marginHorizontal: 16,
  },
  btnDisabled: {
    backgroundColor: '#94A3B8',
    shadowOpacity: 0,
    elevation: 0,
  },

  // Step 4 Metrics Grid (2x2 layout)
  metricGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginHorizontal: 16,
    marginBottom: 16,
  },
  metricCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  metricCardLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 6,
  },
  metricCardValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  subsidyValue: {
    color: '#00897B',
  },

  // Lifetime Savings Hero
  lifetimeSavingsBlock: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 20,
    marginHorizontal: 16,
    marginBottom: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  lifetimeSavingsLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  lifetimeSavingsValue: {
    fontSize: 36,
    fontWeight: '900',
    color: '#D97706', // Warm golden solar amber
    marginBottom: 4,
  },
  lifetimeSavingsSub: {
    fontSize: 12,
    color: '#94A3B8',
    textAlign: 'center',
  },

  // Step 5 Vendor Cards
  vendorsList: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  vendorCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    alignItems: 'center',
  },
  vendorName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
    marginBottom: 6,
  },
  vendorLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  vendorLocationText: {
    fontSize: 13,
    color: '#475569',
    fontWeight: '600',
    marginLeft: 4,
  },
  vendorRatingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    paddingVertical: 3,
    paddingHorizontal: 10,
    borderRadius: 12,
    marginBottom: 16,
  },
  vendorRatingText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#1E293B',
    marginLeft: 4,
  },
  vendorActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  vendorCallBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEF3C7', // Soft warm amber
    borderWidth: 1,
    borderColor: '#FDE68A',
    paddingVertical: 12,
    borderRadius: 16,
    marginRight: 6,
  },
  vendorCallBtnText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#92400E',
    marginLeft: 6,
  },
  vendorWhatsAppBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#D1FAE5', // Soft emerald tint
    borderWidth: 1,
    borderColor: '#A7F3D0',
    paddingVertical: 12,
    borderRadius: 16,
    marginLeft: 6,
  },
  vendorWhatsAppBtnText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#065F46',
    marginLeft: 6,
  },
  secondaryRecalcBtn: {
    alignSelf: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  secondaryRecalcText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.primaryDark,
    textDecorationLine: 'underline',
  },
});
