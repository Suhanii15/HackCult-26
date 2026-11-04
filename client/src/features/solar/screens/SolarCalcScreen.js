import React, { useState, useMemo, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Linking,
  Platform,
} from 'react-native';
import Svg, { Circle, Rect, Path } from 'react-native-svg';
import { TopBar, LottieLoader } from '../../../components/ui';
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
 * Multi-Step Stepper Header for Input Steps (Step 1 & Step 2)
 */
function WizardHeader({ currentStep, onBack, onClose }) {
  const stepIndex = currentStep === 'step1' ? 1 : 2;

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
              { width: `${(stepIndex / 2) * 100}%` },
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
            1. Consumption
          </Text>
          <Text
            style={[
              styles.stepLabel,
              stepIndex === 2 && styles.stepLabelActive,
            ]}
          >
            2. Roof & Home
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
 * Confirmed Location Badge Pill (Prefilled from Profile)
 */
function LocationPill({ district, state, onChangePress }) {
  return (
    <View style={styles.locationPillContainer}>
      <TouchableOpacity
        style={styles.locationPillBtn}
        onPress={onChangePress}
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityLabel="Change district"
      >
        <MapPinIcon size={14} color={COLORS.primary} />
        <Text style={styles.locationPillText}>
          {district}, {state}
        </Text>
        <View style={styles.locationChangeBadge}>
          <Text style={styles.locationChangeText}>Change</Text>
          <ChevronDownIcon size={12} color="#004D40" />
        </View>
      </TouchableOpacity>
    </View>
  );
}

/**
 * Interactive Touch & Drag Slider with Live Floating Tooltip & Stepper Nudge
 */
function InteractiveSlider({
  label,
  value,
  min,
  max,
  step = 1,
  ticks = [],
  formatValue = (v) => String(v),
  subHelper = null,
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

  const tooltipWidth = 74;
  const thumbDiameter = 26;
  const thumbX = trackWidth > 0 ? (percent / 100) * (trackWidth - thumbDiameter) : 0;
  const tooltipX = trackWidth > 0 ? (percent / 100) * (trackWidth - tooltipWidth) : 0;

  return (
    <View style={styles.sliderGroup}>
      {/* Label and Stepper Nudge Buttons */}
      <View style={styles.sliderHeaderRow}>
        <View style={styles.sliderLabelCol}>
          <Text style={styles.fieldLabel}>
            {label} <Text style={styles.requiredAsterisk}>*</Text>
          </Text>
          {subHelper && <Text style={styles.subHelperText}>{subHelper}</Text>}
        </View>
        <View style={styles.stepperMiniBtns}>
          <TouchableOpacity
            style={styles.stepperNudgeBtn}
            onPress={() => handleStep(-step * 2)}
            activeOpacity={0.7}
            accessibilityLabel={`Decrease ${label}`}
          >
            <Text style={styles.stepperNudgeBtnText}>−</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.stepperNudgeBtn}
            onPress={() => handleStep(step * 2)}
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
              : { left: `${percent}%`, transform: [{ translateX: -37 }] },
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

  // Active step: 'landing' | 'step1' (Consumption) | 'step2' (Roof & Home) | 'step3' (Estimate) | 'step4' (Vendors)
  const [activeStep, setActiveStep] = useState('landing');

  // User Profile data pre-fills (No redundant screens for Name, Mobile, State, District)
  const rawName = user?.fullName || user?.name || 'Citizen';
  const firstName = rawName.split(' ')[0] || 'Friend';
  const mobileNumber = user?.phone || user?.mobile || '9876543210';
  const [selectedState, setSelectedState] = useState(user?.state || 'Gujarat');
  const [selectedDistrict, setSelectedDistrict] = useState(
    user?.district || 'Gandhinagar'
  );

  // 1. Consumption Parameters (Prefer kWh over ₹)
  const [inputMode, setInputMode] = useState('kwh'); // 'kwh' | 'bill'
  const prefilledKwh =
    user?.household?.electricity?.kwh ||
    (user?.baselineAnnualCO2Kg ? Math.round(user.baselineAnnualCO2Kg / (12 * 0.71)) : 250);
  const [monthlyKwh, setMonthlyKwh] = useState(prefilledKwh || 250);
  const [monthlyBill, setMonthlyBill] = useState(2500);

  // 2. Roof & Home Parameters
  const [roofAreaSqft, setRoofAreaSqft] = useState(500); // 500 sq ft default
  const prefilledHomeType = user?.household?.houseType || 'independent';
  const [homeType, setHomeType] = useState(prefilledHomeType); // 'independent' | 'apartment' | 'other'

  // 3. Optional Refinements (Can be skipped)
  const [showOptionalRefinements, setShowOptionalRefinements] = useState(false);
  const [roofOrientation, setRoofOrientation] = useState('south'); // 'south' | 'east_west' | 'not_sure'
  const [sanctionedLoadKw, setSanctionedLoadKw] = useState(3); // 3 kW default
  const [applySubsidy, setApplySubsidy] = useState(true); // Yes / No
  const [alreadyHasSolar, setAlreadyHasSolar] = useState(false); // Yes / No
  const [existingSolarCapacity, setExistingSolarCapacity] = useState(2); // kW

  // Modals & UI States
  const [isDistrictPickerOpen, setIsDistrictPickerOpen] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);
  const [assessment, setAssessment] = useState(null);
  const [isScrollEnabled, setIsScrollEnabled] = useState(true);

  // Stepper Slider Ticks
  const kwhTicks = [100, 250, 500, 750, 1000];
  const billTicks = [500, 2500, 5000, 7500, 10000];
  const roofTicks = [200, 500, 1000, 1500, 2000];

  // Approximate bill equivalent from units: avg ~₹7.2/kWh
  const calculatedBillFromKwh = Math.round(monthlyKwh * 7.2 + 80);
  // Approximate units from bill: (bill - 80) / 7.2
  const calculatedUnitsFromBill = Math.max(50, Math.round((monthlyBill - 80) / 7.2));

  // Perform assessment calculation
  const handleCalculate = useCallback(async () => {
    setIsCalculating(true);
    try {
      const effectiveBill = inputMode === 'kwh' ? calculatedBillFromKwh : monthlyBill;
      const effectiveKwh = inputMode === 'kwh' ? monthlyKwh : calculatedUnitsFromBill;

      // Orientation derating factor: South: 1.0, East-West: 0.92, Not Sure: 0.85
      const orientationDerating =
        roofOrientation === 'south' ? 1.0 : roofOrientation === 'east_west' ? 0.92 : 0.85;

      const res = await calculateSolar({
        monthlyBillInr: effectiveBill,
        monthlyKwh: effectiveKwh,
        roofAreaSqft,
        district: selectedDistrict,
        state: selectedState,
        homeType,
        deratingFactor: orientationDerating,
        applySubsidy,
      });

      setAssessment(res);
      setActiveStep('step3');
    } catch (err) {
      // Graceful fallback to static estimates if network or computation fails
      setActiveStep('step3');
    } finally {
      setIsCalculating(false);
    }
  }, [
    inputMode,
    calculatedBillFromKwh,
    monthlyBill,
    monthlyKwh,
    calculatedUnitsFromBill,
    roofAreaSqft,
    selectedDistrict,
    selectedState,
    homeType,
    roofOrientation,
    applySubsidy,
  ]);

  // Filtered vendors for Step 4
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

  // Derived values for Estimate Step 3
  const capacityKw = useMemo(() => {
    if (assessment?.capacityKw) return assessment.capacityKw.toFixed(1);
    // 100 sq ft per kW capped by roof and consumption
    const capFromRoof = roofAreaSqft / 100;
    const capFromKwh = (monthlyKwh * 12 * 0.9) / 1500;
    const est = Math.min(10, Math.max(1, Math.min(capFromRoof, capFromKwh)));
    return (Math.floor(est * 2) / 2).toFixed(1);
  }, [assessment, roofAreaSqft, monthlyKwh]);

  const grossCostFormatted = useMemo(() => {
    if (assessment?.financials?.grossCostInr) {
      return formatInr(assessment.financials.grossCostInr);
    }
    const numCap = parseFloat(capacityKw) || 3;
    return formatInr(numCap * 50000);
  }, [assessment, capacityKw]);

  const subsidyFormatted = useMemo(() => {
    if (!applySubsidy) return '₹0 (Opted out)';
    if (assessment?.financials?.centralSubsidyInr !== undefined) {
      return formatInr(assessment.financials.centralSubsidyInr);
    }
    const numCap = parseFloat(capacityKw) || 3;
    if (numCap >= 3) return '₹78,000';
    if (numCap >= 2) return '₹60,000';
    return '₹30,000';
  }, [assessment, capacityKw, applySubsidy]);

  const lifetimeSavingsLakhs = useMemo(() => {
    if (assessment?.financials?.lifetimeGrossSavingsInr) {
      const lakhs = (
        assessment.financials.lifetimeGrossSavingsInr / 100000
      ).toFixed(2);
      return `₹${lakhs}L`;
    }
    const effBill = inputMode === 'kwh' ? calculatedBillFromKwh : monthlyBill;
    const annualEst = effBill * 0.85 * 12 * 25;
    return `₹${(annualEst / 100000).toFixed(2)}L`;
  }, [assessment, inputMode, calculatedBillFromKwh, monthlyBill]);

  // Vendor Action handlers
  const handleCallVendor = (phone) => {
    const cleanNumber = phone.replace(/[^0-9+]/g, '');
    Linking.openURL(`tel:${cleanNumber}`).catch(() => {});
  };

  const handleWhatsAppVendor = (whatsapp, vendorName) => {
    const msg = encodeURIComponent(
      `Hello ${vendorName}, I saw your profile on EcoPulse PM Surya Ghar solar portal. I want to book a free rooftop home inspection for ${capacityKw} kW in ${selectedDistrict}. My contact is ${rawName} (${mobileNumber}).`
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
                  Get up to ₹78,000 direct PM Surya Ghar subsidy
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
                Start Solar Assessment
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    );
  }

  // =========================================================================
  // VIEW 2: STEP 1 - CONSUMPTION (Preferred kWh over ₹)
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
          scrollEnabled={isScrollEnabled}
        >
          {/* Confirmed Location Badge Pill (from Profile) */}
          <LocationPill
            district={selectedDistrict}
            state={selectedState}
            onChangePress={() => setIsDistrictPickerOpen(true)}
          />

          {/* Mascot Speech Bubble with Adjust/Energy Pose */}
          <EcoMascotSpeech
            pose="adjust"
            title="Tell us about your electricity use"
            subtitle="Prefilled from your home energy baseline. Direct units (kWh) give the highest precision!"
          />

          {/* Input Mode Selector: kWh vs ₹ */}
          <View style={styles.modeToggleContainer}>
            <TouchableOpacity
              style={[
                styles.modeToggleBtn,
                inputMode === 'kwh' && styles.modeToggleBtnActive,
              ]}
              onPress={() => setInputMode('kwh')}
              activeOpacity={0.8}
            >
              <ZapIcon
                size={16}
                color={inputMode === 'kwh' ? '#FFFFFF' : COLORS.textSecondary}
              />
              <Text
                style={[
                  styles.modeToggleText,
                  inputMode === 'kwh' && styles.modeToggleTextActive,
                ]}
              >
                Units: kWh / mo (Recommended)
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.modeToggleBtn,
                inputMode === 'bill' && styles.modeToggleBtnActive,
              ]}
              onPress={() => setInputMode('bill')}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.modeToggleText,
                  inputMode === 'bill' && styles.modeToggleTextActive,
                ]}
              >
                Use bill amount (₹)
              </Text>
            </TouchableOpacity>
          </View>

          {/* Form Card for Consumption Slider */}
          <View style={styles.formCard}>
            {inputMode === 'kwh' ? (
              <>
                <InteractiveSlider
                  label="Monthly Electricity Use"
                  value={monthlyKwh}
                  min={50}
                  max={1500}
                  step={10}
                  ticks={kwhTicks}
                  formatValue={(val) => `${val} kWh`}
                  subHelper="Prefilled from your baseline consumption"
                  onChange={setMonthlyKwh}
                  onSlidingStart={() => setIsScrollEnabled(false)}
                  onSlidingEnd={() => setIsScrollEnabled(true)}
                  accentColor="#00897B"
                  trackBgColor="#B2DFDB"
                />

                <View style={styles.conversionInfoPill}>
                  <Text style={styles.conversionInfoText}>
                    💡 Equivalent bill: ~₹{calculatedBillFromKwh.toLocaleString('en-IN')}/mo under {selectedDistrict} tariff
                  </Text>
                </View>
              </>
            ) : (
              <>
                <InteractiveSlider
                  label="Monthly Electricity Bill"
                  value={monthlyBill}
                  min={500}
                  max={10000}
                  step={100}
                  ticks={billTicks}
                  formatValue={(val) => `₹${val.toLocaleString('en-IN')}`}
                  subHelper="We'll invert this to units via tariff slabs"
                  onChange={setMonthlyBill}
                  onSlidingStart={() => setIsScrollEnabled(false)}
                  onSlidingEnd={() => setIsScrollEnabled(true)}
                  accentColor="#F59E0B"
                  trackBgColor="#FED7AA"
                />

                <View style={styles.conversionInfoPill}>
                  <Text style={styles.conversionInfoText}>
                    ⚡ Estimated units: ~{calculatedUnitsFromBill} kWh/mo
                  </Text>
                </View>
              </>
            )}
          </View>

          {/* Continue Button */}
          <TouchableOpacity
            style={[styles.primaryActionButton, styles.bottomContinueBtn]}
            onPress={() => setActiveStep('step2')}
            activeOpacity={0.88}
          >
            <Text style={styles.primaryActionBtnText}>
              Next: Roof & Home Details →
            </Text>
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
  // VIEW 3: STEP 2 - ROOF & HOME (Required + Optional Refinements)
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
          scrollEnabled={isScrollEnabled}
        >
          {/* Confirmed Location Badge Pill */}
          <LocationPill
            district={selectedDistrict}
            state={selectedState}
            onChangePress={() => setIsDistrictPickerOpen(true)}
          />

          {/* Mascot Speech Bubble with Surveying Pose */}
          <EcoMascotSpeech
            pose="survey"
            title="Roof area & dwelling type"
            subtitle="Caps maximum solar capacity and determines RWA/NOC eligibility notes."
          />

          {/* Form Card */}
          <View style={styles.formCard}>
            {/* 1. Shadow-Free Roof Area Slider (Required) */}
            <InteractiveSlider
              label="Shadow-Free Roof Area"
              value={roofAreaSqft}
              min={100}
              max={2000}
              step={50}
              ticks={roofTicks}
              formatValue={(val) => `${val} sq ft`}
              subHelper="1 kW needs ~100 sq ft; 500 sq ft supports up to 5 kW"
              onChange={setRoofAreaSqft}
              onSlidingStart={() => setIsScrollEnabled(false)}
              onSlidingEnd={() => setIsScrollEnabled(true)}
              accentColor="#00897B"
              trackBgColor="#B2DFDB"
            />

            <View style={styles.formDivider} />

            {/* 2. Home Type Selector (Required - Prefilled from Onboarding) */}
            <View style={styles.inputGroup}>
              <Text style={styles.fieldLabel}>
                Home Type <Text style={styles.requiredAsterisk}>*</Text>
              </Text>
              <Text style={styles.fieldSubLabel}>
                Roof access and subsidy eligibility criteria
              </Text>

              <View style={styles.chipRow}>
                <TouchableOpacity
                  style={[
                    styles.homeTypeChip,
                    homeType === 'independent' && styles.homeTypeChipActive,
                  ]}
                  onPress={() => setHomeType('independent')}
                  activeOpacity={0.8}
                >
                  <Text style={styles.chipIcon}>🏠</Text>
                  <Text
                    style={[
                      styles.chipLabel,
                      homeType === 'independent' && styles.chipLabelActive,
                    ]}
                  >
                    Independent House
                  </Text>
                  <Text style={styles.chipNote}>Full Roof Rights</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.homeTypeChip,
                    homeType === 'apartment' && styles.homeTypeChipActive,
                  ]}
                  onPress={() => setHomeType('apartment')}
                  activeOpacity={0.8}
                >
                  <Text style={styles.chipIcon}>🏢</Text>
                  <Text
                    style={[
                      styles.chipLabel,
                      homeType === 'apartment' && styles.chipLabelActive,
                    ]}
                  >
                    Apartment / Society
                  </Text>
                  <Text style={styles.chipNote}>RWA NOC Required</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.homeTypeChip,
                    homeType === 'other' && styles.homeTypeChipActive,
                  ]}
                  onPress={() => setHomeType('other')}
                  activeOpacity={0.8}
                >
                  <Text style={styles.chipIcon}>🏘️</Text>
                  <Text
                    style={[
                      styles.chipLabel,
                      homeType === 'other' && styles.chipLabelActive,
                    ]}
                  >
                    Other / Commercial
                  </Text>
                  <Text style={styles.chipNote}>Custom Evaluation</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.formDivider} />

            {/* 3. Optional Refinements (Expandable Accordion) */}
            <TouchableOpacity
              style={styles.optionalHeaderBtn}
              onPress={() => setShowOptionalRefinements(!showOptionalRefinements)}
              activeOpacity={0.8}
            >
              <View style={styles.optionalHeaderLeft}>
                <Text style={styles.optionalHeaderTitle}>
                  ⚙️ Optional Refinements
                </Text>
                <Text style={styles.optionalHeaderSub}>
                  Orientation, sanctioned load, subsidy & existing solar (can skip)
                </Text>
              </View>
              <View style={styles.optionalTogglePill}>
                <Text style={styles.optionalToggleText}>
                  {showOptionalRefinements ? 'Hide' : 'Refine'}
                </Text>
                <ChevronDownIcon
                  size={14}
                  color={COLORS.primary}
                  style={showOptionalRefinements ? styles.iconRotated : null}
                />
              </View>
            </TouchableOpacity>

            {showOptionalRefinements && (
              <View style={styles.optionalBody}>
                {/* A. Roof Orientation & Shading */}
                <View style={styles.refineGroup}>
                  <Text style={styles.refineLabel}>
                    Roof Orientation & Shading
                  </Text>
                  <Text style={styles.refineNote}>
                    South orientation provides maximum sunlight yield in Gujarat
                  </Text>
                  <View style={styles.miniChipRow}>
                    {[
                      { key: 'south', label: '☀️ South (Optimal 100%)' },
                      { key: 'east_west', label: '⛅ East-West (92%)' },
                      { key: 'not_sure', label: '🌥️ Shaded / Not Sure' },
                    ].map((item) => (
                      <TouchableOpacity
                        key={item.key}
                        style={[
                          styles.miniChip,
                          roofOrientation === item.key && styles.miniChipActive,
                        ]}
                        onPress={() => setRoofOrientation(item.key)}
                        activeOpacity={0.8}
                      >
                        <Text
                          style={[
                            styles.miniChipText,
                            roofOrientation === item.key && styles.miniChipTextActive,
                          ]}
                        >
                          {item.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                {/* B. Sanctioned Load (kW) & Phase */}
                <View style={styles.refineGroup}>
                  <Text style={styles.refineLabel}>
                    Sanctioned Load & Connection Phase
                  </Text>
                  <Text style={styles.refineNote}>
                    Rooftop capacity is typically limited by sanctioned load
                  </Text>
                  <View style={styles.miniChipRow}>
                    {[
                      { val: 3, label: '1–3 kW (Single Phase)' },
                      { val: 5, label: '4–6 kW (3-Phase)' },
                      { val: 8, label: '>6 kW (3-Phase)' },
                    ].map((item) => (
                      <TouchableOpacity
                        key={item.val}
                        style={[
                          styles.miniChip,
                          sanctionedLoadKw === item.val && styles.miniChipActive,
                        ]}
                        onPress={() => setSanctionedLoadKw(item.val)}
                        activeOpacity={0.8}
                      >
                        <Text
                          style={[
                            styles.miniChipText,
                            sanctionedLoadKw === item.val && styles.miniChipTextActive,
                          ]}
                        >
                          {item.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                {/* C. Apply for Subsidy? */}
                <View style={styles.refineGroup}>
                  <Text style={styles.refineLabel}>
                    Apply for PM Surya Ghar Subsidy?
                  </Text>
                  <View style={styles.miniChipRow}>
                    <TouchableOpacity
                      style={[
                        styles.miniChip,
                        applySubsidy && styles.miniChipActive,
                      ]}
                      onPress={() => setApplySubsidy(true)}
                      activeOpacity={0.8}
                    >
                      <Text
                        style={[
                          styles.miniChipText,
                          applySubsidy && styles.miniChipTextActive,
                        ]}
                      >
                        ✅ Yes (Up to ₹78,000 Govt Aid)
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[
                        styles.miniChip,
                        !applySubsidy && styles.miniChipActive,
                      ]}
                      onPress={() => setApplySubsidy(false)}
                      activeOpacity={0.8}
                    >
                      <Text
                        style={[
                          styles.miniChipText,
                          !applySubsidy && styles.miniChipTextActive,
                        ]}
                      >
                        ❌ No Subsidy (Gross Only)
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* D. Existing Solar Capacity */}
                <View style={styles.refineGroup}>
                  <Text style={styles.refineLabel}>
                    Already have rooftop solar installed?
                  </Text>
                  <View style={styles.miniChipRow}>
                    <TouchableOpacity
                      style={[
                        styles.miniChip,
                        !alreadyHasSolar && styles.miniChipActive,
                      ]}
                      onPress={() => setAlreadyHasSolar(false)}
                      activeOpacity={0.8}
                    >
                      <Text
                        style={[
                          styles.miniChipText,
                          !alreadyHasSolar && styles.miniChipTextActive,
                        ]}
                      >
                        🌱 No, New Plant
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[
                        styles.miniChip,
                        alreadyHasSolar && styles.miniChipActive,
                      ]}
                      onPress={() => setAlreadyHasSolar(true)}
                      activeOpacity={0.8}
                    >
                      <Text
                        style={[
                          styles.miniChipText,
                          alreadyHasSolar && styles.miniChipTextActive,
                        ]}
                      >
                        ☀️ Yes, Already Installed
                      </Text>
                    </TouchableOpacity>
                  </View>

                  {alreadyHasSolar && (
                    <View style={styles.existingSolarInputBox}>
                      <Text style={styles.existingSolarLabel}>
                        Existing Capacity:
                      </Text>
                      <View style={styles.existingPillRow}>
                        {[1, 2, 3, 5, 10].map((kw) => (
                          <TouchableOpacity
                            key={kw}
                            style={[
                              styles.kwPill,
                              existingSolarCapacity === kw && styles.kwPillActive,
                            ]}
                            onPress={() => setExistingSolarCapacity(kw)}
                            activeOpacity={0.8}
                          >
                            <Text
                              style={[
                                styles.kwPillText,
                                existingSolarCapacity === kw && styles.kwPillTextActive,
                              ]}
                            >
                              {kw} kW
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </View>
                  )}
                </View>
              </View>
            )}
          </View>

          {/* Continue Button to Calculate */}
          <TouchableOpacity
            style={[styles.primaryActionButton, styles.bottomContinueBtn]}
            onPress={handleCalculate}
            disabled={isCalculating}
            activeOpacity={0.88}
          >
            {isCalculating ? (
              <LottieLoader size={24} color="#FFFFFF" />
            ) : (
              <Text style={styles.primaryActionBtnText}>
                Calculate Solar Plan ✨
              </Text>
            )}
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
  // VIEW 4: STEP 3 - SOLAR PLAN ESTIMATE (Results)
  // =========================================================================
  if (activeStep === 'step3') {
    return (
      <View style={styles.mainContainer}>
        <ResultHeader
          onBack={() => setActiveStep('step2')}
          onClose={() => setActiveStep('landing')}
        />

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.stepContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Confirmed Location Badge */}
          <LocationPill
            district={selectedDistrict}
            state={selectedState}
            onChangePress={() => setIsDistrictPickerOpen(true)}
          />

          {/* Mascot Speech Bubble with Celebration Pose */}
          <EcoMascotSpeech
            pose="celebrate"
            title={`Hi ${firstName}!`}
            subtitle="Congratulations, find below the detailed plan for lifetime savings!"
            badgeText="⚡ CLEAN ENERGY"
          />

          {/* Existing Solar Optimization Banner if user already has solar */}
          {alreadyHasSolar && (
            <View style={styles.existingSolarNoticeCard}>
              <Text style={styles.existingNoticeTitle}>
                🌟 Existing {existingSolarCapacity} kW System Detected
              </Text>
              <Text style={styles.existingNoticeBody}>
                You are already generating solar clean energy! Rather than
                adding additional panels that may exceed your sanctioned load,
                our recommendation is to install a battery energy storage system
                (BESS) or optimize daytime appliance scheduling to eliminate
                peak grid tariffs.
              </Text>
            </View>
          )}

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
            onPress={() => setActiveStep('step4')}
            activeOpacity={0.88}
          >
            <Text style={styles.primaryActionBtnText}>See nearby vendors</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    );
  }

  // =========================================================================
  // VIEW 5: STEP 4 - RECOMMENDED PARTNERS / NEARBY VENDORS
  // =========================================================================
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
        {/* Mascot Speech Bubble with Partner Pose */}
        <EcoMascotSpeech
          pose="partner"
          title={`Hi ${firstName}!`}
          subtitle={`Your solar plan is ready! Here are verified empanelled partners in ${selectedDistrict}:`}
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
            Recalculate with different inputs
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
    paddingTop: Platform.OS === 'android' ? 14 : 10,
    paddingBottom: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerIconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperCenter: {
    flex: 1,
    marginHorizontal: 16,
    alignItems: 'center',
  },
  progressBarBg: {
    width: '100%',
    height: 4,
    backgroundColor: '#E2E8F0',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 6,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#F59E0B',
    borderRadius: 2,
  },
  stepLabelsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  stepLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#94A3B8',
  },
  stepLabelActive: {
    color: '#0F172A',
    fontWeight: '800',
  },

  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? 14 : 10,
    paddingBottom: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  emblemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  emblemTextCol: {
    marginLeft: 8,
  },
  emblemTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0F172A',
    lineHeight: 14,
  },
  emblemSubtitle: {
    fontSize: 11,
    fontWeight: '600',
    color: '#D97706',
    lineHeight: 13,
  },

  // Confirmed Location Pill
  locationPillContainer: {
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 4,
  },
  locationPillBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#E0F2F1',
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#B2DFDB',
  },
  locationPillText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#004D40',
    marginLeft: 5,
    marginRight: 8,
  },
  locationChangeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  locationChangeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#004D40',
    marginRight: 2,
  },

  // Landing
  landingContent: {
    paddingBottom: 40,
  },
  landingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    marginHorizontal: 16,
    marginTop: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  landingTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 8,
    letterSpacing: -0.4,
  },
  landingDescription: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 21,
    marginBottom: 20,
  },
  highlightsContainer: {
    backgroundColor: '#F8FAF9',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    gap: 12,
  },
  highlightRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  highlightCheck: {
    marginRight: 10,
  },
  highlightText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
    flex: 1,
  },

  // Steps common
  stepContent: {
    paddingBottom: 50,
  },
  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    marginHorizontal: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  formDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 18,
  },

  // Toggle Mode Selector (kWh vs ₹)
  modeToggleContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 12,
    backgroundColor: '#E2E8F0',
    borderRadius: 14,
    padding: 4,
    gap: 4,
  },
  modeToggleBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 11,
    gap: 6,
  },
  modeToggleBtnActive: {
    backgroundColor: '#00897B',
    shadowColor: '#00897B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 2,
  },
  modeToggleText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
  },
  modeToggleTextActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },

  conversionInfoPill: {
    backgroundColor: '#E0F2F1',
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#B2DFDB',
  },
  conversionInfoText: {
    fontSize: 12,
    color: '#004D40',
    fontWeight: '600',
  },

  // Slider Elements
  sliderGroup: {
    marginBottom: 6,
  },
  sliderHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  sliderLabelCol: {
    flex: 1,
    marginRight: 8,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  fieldSubLabel: {
    fontSize: 11.5,
    color: '#64748B',
    marginBottom: 10,
    marginTop: 2,
  },
  subHelperText: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  requiredAsterisk: {
    color: '#EF4444',
  },
  stepperMiniBtns: {
    flexDirection: 'row',
    gap: 6,
  },
  stepperNudgeBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  stepperNudgeBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    lineHeight: 18,
  },
  floatingTooltipTrackArea: {
    height: 34,
    position: 'relative',
    marginTop: 4,
  },
  floatingTooltipPillWrapper: {
    position: 'absolute',
    top: 0,
  },
  tooltipPill: {
    backgroundColor: '#FEF3C7',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#FDE68A',
    alignItems: 'center',
    shadowColor: '#D97706',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  tooltipPillText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#92400E',
  },
  tooltipArrow: {
    position: 'absolute',
    bottom: -5,
    alignSelf: 'center',
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
    height: 36,
    justifyContent: 'center',
    position: 'relative',
  },
  trackBgBar: {
    height: 8,
    borderRadius: 4,
    width: '100%',
  },
  trackFillBar: {
    height: 8,
    borderRadius: 4,
    position: 'absolute',
    left: 0,
  },
  sliderThumbSphere: {
    width: 26,
    height: 26,
    borderRadius: 13,
    position: 'absolute',
    top: 5,
    borderWidth: 3,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 4,
  },
  ticksRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  tickCol: {
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  tickMarker: {
    width: 2,
    height: 5,
    backgroundColor: '#CBD5E1',
    marginBottom: 4,
  },
  tickMarkerActive: {
    backgroundColor: '#0F172A',
    height: 7,
  },
  tickLabel: {
    fontSize: 10,
    color: '#94A3B8',
    fontWeight: '600',
  },
  tickLabelActive: {
    color: '#0F172A',
    fontWeight: '800',
  },

  // Home Type Chips
  chipRow: {
    flexDirection: 'row',
    gap: 8,
  },
  homeTypeChip: {
    flex: 1,
    backgroundColor: '#F8FAF9',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    alignItems: 'center',
  },
  homeTypeChipActive: {
    backgroundColor: '#E0F2F1',
    borderColor: '#00897B',
  },
  chipIcon: {
    fontSize: 22,
    marginBottom: 4,
  },
  chipLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#334155',
    textAlign: 'center',
    marginBottom: 2,
  },
  chipLabelActive: {
    color: '#004D40',
  },
  chipNote: {
    fontSize: 9.5,
    color: '#64748B',
    textAlign: 'center',
  },

  // Optional Refinements
  optionalHeaderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  optionalHeaderLeft: {
    flex: 1,
    marginRight: 10,
  },
  optionalHeaderTitle: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#0F172A',
  },
  optionalHeaderSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  optionalTogglePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 12,
    gap: 4,
  },
  optionalToggleText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primary,
  },
  iconRotated: {
    transform: [{ rotate: '180deg' }],
  },
  optionalBody: {
    marginTop: 14,
    backgroundColor: '#F8FAF9',
    borderRadius: 14,
    padding: 14,
    gap: 14,
  },
  refineGroup: {
    gap: 4,
  },
  refineLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1E293B',
  },
  refineNote: {
    fontSize: 10.5,
    color: '#64748B',
    marginBottom: 4,
  },
  miniChipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  miniChip: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  miniChipActive: {
    backgroundColor: '#E0F2F1',
    borderColor: '#00897B',
  },
  miniChipText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#475569',
  },
  miniChipTextActive: {
    color: '#004D40',
    fontWeight: '800',
  },
  existingSolarInputBox: {
    marginTop: 8,
    backgroundColor: '#FFFFFF',
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  existingSolarLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 6,
  },
  existingPillRow: {
    flexDirection: 'row',
    gap: 6,
  },
  kwPill: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    backgroundColor: '#F8FAF9',
  },
  kwPillActive: {
    backgroundColor: '#F59E0B',
    borderColor: '#D97706',
  },
  kwPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
  },
  kwPillTextActive: {
    color: '#FFFFFF',
  },

  // Primary Action Button
  primaryActionButton: {
    backgroundColor: '#F59E0B',
    borderRadius: 18,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    shadowColor: '#D97706',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryActionBtnText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.2,
  },
  bottomContinueBtn: {
    marginHorizontal: 16,
    marginTop: 20,
  },

  // Results View
  existingSolarNoticeCard: {
    backgroundColor: '#FEF3C7',
    borderRadius: 16,
    marginHorizontal: 16,
    marginBottom: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  existingNoticeTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#92400E',
    marginBottom: 4,
  },
  existingNoticeBody: {
    fontSize: 11.5,
    color: '#78350F',
    lineHeight: 16,
  },
  metricGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: 16,
    gap: 12,
    marginBottom: 16,
  },
  metricCard: {
    width: '48%',
    flexGrow: 1,
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  metricCardLabel: {
    fontSize: 11.5,
    color: '#94A3B8',
    fontWeight: '600',
    marginBottom: 6,
  },
  metricCardValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#F59E0B',
    letterSpacing: -0.3,
  },
  subsidyValue: {
    color: '#10B981',
  },
  lifetimeSavingsBlock: {
    backgroundColor: '#0F172A',
    borderRadius: 20,
    marginHorizontal: 16,
    padding: 22,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 4,
  },
  lifetimeSavingsLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#94A3B8',
    marginBottom: 4,
  },
  lifetimeSavingsValue: {
    fontSize: 34,
    fontWeight: '900',
    color: '#F59E0B',
    letterSpacing: -0.5,
    marginBottom: 6,
  },
  lifetimeSavingsSub: {
    fontSize: 11.5,
    color: '#64748B',
    textAlign: 'center',
  },

  // Vendors List
  vendorsList: {
    marginHorizontal: 16,
    gap: 14,
    marginBottom: 20,
  },
  vendorCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  vendorName: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 6,
  },
  vendorLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  vendorLocationText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
    marginLeft: 4,
  },
  vendorRatingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#FEF3C7',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 8,
    marginBottom: 14,
    gap: 4,
  },
  vendorRatingText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#92400E',
  },
  vendorActionsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  vendorCallBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FED7AA',
    borderRadius: 12,
    paddingVertical: 10,
    gap: 6,
  },
  vendorCallBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#92400E',
  },
  vendorWhatsAppBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#D1FAE5',
    borderRadius: 12,
    paddingVertical: 10,
    gap: 6,
  },
  vendorWhatsAppBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#065F46',
  },
  secondaryRecalcBtn: {
    alignItems: 'center',
    paddingVertical: 12,
    marginHorizontal: 16,
    marginBottom: 20,
  },
  secondaryRecalcText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#00897B',
    textDecorationLine: 'underline',
  },
});
