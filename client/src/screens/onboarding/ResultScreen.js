import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
} from 'react-native';
import { COLORS } from '../../theme';
import BrandLogo from '../../components/BrandLogo';
import AppSafeArea from '../../components/AppSafeArea';
import LanguageCircleButton from '../../components/LanguageCircleButton';
import { useLanguage, tr } from '../../i18n/LanguageContext';

export default function ResultScreen({
  footprintResult,
  onStartChallenge,
  onPersonalise,
  onReturnToStep,
  mode = 'household',
}) {
  const { t } = useLanguage();
  const [showFormula, setShowFormula] = useState(false);
  const [displayTotal, setDisplayTotal] = useState(0);

  const totalKg = footprintResult?.total || 0;
  const perPersonKg = footprintResult?.perPerson || 0;
  const isPartial = footprintResult?.partial || false;
  const categories = footprintResult?.categories || {
    electricity: { kg: null, status: 'unavailable', assumptions: [] },
    cooking: { kg: null, status: 'unavailable', assumptions: [] },
    transport: { kg: null, status: 'unavailable', assumptions: [] },
  };

  useEffect(() => {
    setDisplayTotal(totalKg);
  }, [totalKg]);

  const elecKg = categories.electricity.kg || 0;
  const cookKg = categories.cooking.kg || 0;
  const transKg = categories.transport.kg || 0;
  const sumKg = Math.max(0.1, elecKg + cookKg + transKg);

  const elecPercent = Math.round((elecKg / sumKg) * 100);
  const cookPercent = Math.round((cookKg / sumKg) * 100);
  const transPercent = Math.round((transKg / sumKg) * 100);

  let confidence = 'Estimated';
  if (categories.electricity.status === 'measured') confidence = 'Verified';
  else if (categories.electricity.status === 'reported') confidence = 'Reported';

  const getStatusBadge = (status) => {
    switch (status) {
      case 'measured':
        return { label: t('measured'), bg: '#DCFCE7', color: '#15803D' };
      case 'reported':
        return { label: t('reported'), bg: '#E0F2FE', color: '#0369A1' };
      case 'estimated':
        return { label: t('estimated'), bg: '#FEF3C7', color: '#B45309' };
      default:
        return { label: t('unavailable'), bg: '#F3F4F6', color: '#6B7280' };
    }
  };

  return (
    <AppSafeArea style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Top Bar with BrandLogo + Top-right Language Circle Button */}
      <View style={styles.header}>
        <BrandLogo size="small" color={COLORS.primary} />
        <LanguageCircleButton />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Confidence pill */}
        <View style={styles.confidencePill}>
          <Text style={styles.confidenceDot}>●</Text>
          <Text style={styles.confidenceText}>Confidence: {confidence}</Text>
        </View>

        {/* Big Result Box */}
        <View style={styles.resultBox}>
          <Text style={styles.resultLabel}>{t('result_title')}</Text>
          <View style={styles.numberRow}>
            <Text style={styles.mainNumber}>{displayTotal}</Text>
            <Text style={styles.unitSuffix}>{tr('kg CO₂e')}</Text>
          </View>
          <Text style={styles.perMonthText}>{t('per_month')}</Text>

          {mode === 'household' && (
            <View style={styles.perPersonPill}>
              <Text style={styles.perPersonText}>
                👤 {perPersonKg} kg CO₂e {t('per_person')}
              </Text>
            </View>
          )}

          {/* Visual Category Breakdown Bar */}
          <View style={styles.barBreakdownContainer}>
            {elecKg > 0 && (
              <View style={[styles.barSegment, { flex: elecPercent, backgroundColor: '#10B981' }]} />
            )}
            {cookKg > 0 && (
              <View style={[styles.barSegment, { flex: cookPercent, backgroundColor: '#F59E0B' }]} />
            )}
            {transKg > 0 && (
              <View style={[styles.barSegment, { flex: transPercent, backgroundColor: '#3B82F6' }]} />
            )}
          </View>
        </View>

        {/* Partial Coverage Warning & Return Button */}
        {isPartial && (
          <View style={styles.partialCard}>
            <Text style={styles.partialTitle}>{tr('⚠️ Partial Footprint')}</Text>
            <Text style={styles.partialDesc}>
              {categories.electricity.kg === null
                ? 'Add your electricity bill to complete your baseline.'
                : categories.cooking.kg === null
                ? 'Add your cooking fuel usage to complete your baseline.'
                : 'Add your regular commute trips to complete your baseline.'}
            </Text>
            <TouchableOpacity
              style={styles.completeStepBtn}
              onPress={() => {
                if (categories.electricity.kg === null) onReturnToStep(2);
                else if (categories.cooking.kg === null) onReturnToStep(3);
                else onReturnToStep(4);
              }}
            >
              <Text style={styles.completeStepText}>{tr('Complete Missing Step →')}</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Category Rows with Status Badges */}
        <View style={styles.breakdownCard}>
          <Text style={styles.breakdownTitle}>{t('category_breakdown_title')}</Text>

          {/* Electricity */}
          <View style={styles.catRow}>
            <View style={styles.catLeft}>
              <View style={[styles.dotMarker, { backgroundColor: '#10B981' }]} />
              <View>
                <Text style={styles.catName}>{t('cat_electricity')}</Text>
                <Text style={styles.catKgText}>
                  {elecKg > 0 ? `${elecKg} kg CO₂e (${elecPercent}%)` : t('unavailable')}
                </Text>
              </View>
            </View>
            <View style={[styles.badge, { backgroundColor: getStatusBadge(categories.electricity.status).bg }]}>
              <Text style={[styles.badgeText, { color: getStatusBadge(categories.electricity.status).color }]}>
                {getStatusBadge(categories.electricity.status).label}
              </Text>
            </View>
          </View>

          {/* Cooking */}
          <View style={styles.catRow}>
            <View style={styles.catLeft}>
              <View style={[styles.dotMarker, { backgroundColor: '#F59E0B' }]} />
              <View>
                <Text style={styles.catName}>{t('cat_cooking')}</Text>
                <Text style={styles.catKgText}>
                  {cookKg > 0 ? `${cookKg} kg CO₂e (${cookPercent}%)` : t('unavailable')}
                </Text>
              </View>
            </View>
            <View style={[styles.badge, { backgroundColor: getStatusBadge(categories.cooking.status).bg }]}>
              <Text style={[styles.badgeText, { color: getStatusBadge(categories.cooking.status).color }]}>
                {getStatusBadge(categories.cooking.status).label}
              </Text>
            </View>
          </View>

          {/* Transport */}
          <View style={styles.catRow}>
            <View style={styles.catLeft}>
              <View style={[styles.dotMarker, { backgroundColor: '#3B82F6' }]} />
              <View>
                <Text style={styles.catName}>{t('cat_travel')}</Text>
                <Text style={styles.catKgText}>
                  {transKg > 0 ? `${transKg} kg CO₂e (${transPercent}%)` : t('unavailable')}
                </Text>
              </View>
            </View>
            <View style={[styles.badge, { backgroundColor: getStatusBadge(categories.transport.status).bg }]}>
              <Text style={[styles.badgeText, { color: getStatusBadge(categories.transport.status).color }]}>
                {getStatusBadge(categories.transport.status).label}
              </Text>
            </View>
          </View>
        </View>

        {/* How We Calculated This Collapsible */}
        <TouchableOpacity
          style={styles.formulaHeader}
          onPress={() => setShowFormula(!showFormula)}
          activeOpacity={0.8}
        >
          <Text style={styles.formulaTitle}>
            {showFormula ? '▼ Hide Calculation Details' : '▶ ' + t('how_we_calculated')}
          </Text>
        </TouchableOpacity>

        {showFormula && (
          <View style={styles.formulaCard}>
            <Text style={styles.formulaLine}>• <Text style={{ fontWeight: '700' }}>{tr('Electricity')}</Text>: netGridKwh × 0.71 kg CO₂e/kWh (CEA Baseline Ver 19)</Text>
            <Text style={styles.formulaLine}>• <Text style={{ fontWeight: '700' }}>{tr('LPG')}</Text>: cylinders/mo × cylinderKg × 2.98 kg CO₂e/kg (IPCC)</Text>
            <Text style={styles.formulaLine}>• <Text style={{ fontWeight: '700' }}>{tr('PNG')}</Text>: scm/mo × 2.15 kg CO₂e/SCM (PPAC)</Text>
            <Text style={styles.formulaLine}>• <Text style={{ fontWeight: '700' }}>{tr('Transport')}</Text>: km/day × days/mo × passenger-km emission factor</Text>
            <Text style={styles.boundaryNote}>
              {tr('📌 Boundary statement: Scope includes domestic energy and passenger transport only. Municipal waste, food lifecycle, and consumer goods are excluded from this baseline.')}
            </Text>
            <Text style={styles.factorVerText}>Factor version: {footprintResult?.factorVersion || '2026.1-GEDA'}</Text>
          </View>
        )}

        {/* Optional Personalise Button */}
        <TouchableOpacity style={styles.personaliseBtn} onPress={onPersonalise}>
          <Text style={styles.personaliseBtnText}>{t('personalise_btn')}</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Primary Action Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.startChallengeBtn}
          activeOpacity={0.85}
          onPress={onStartChallenge}
        >
          <Text style={styles.startChallengeText}>{t('start_first_challenge')}</Text>
        </TouchableOpacity>
      </View>
    </AppSafeArea>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: '#FFFFFF',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 30,
  },
  confidencePill: {
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
    marginBottom: 14,
  },
  confidenceDot: {
    color: COLORS.primary,
    fontSize: 10,
    marginRight: 6,
  },
  confidenceText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  resultBox: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: COLORS.primary,
    borderRadius: 22,
    padding: 20,
    alignItems: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 14,
    elevation: 4,
  },
  resultLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  numberRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: 6,
  },
  mainNumber: {
    fontSize: 44,
    fontWeight: '900',
    color: COLORS.primaryDark,
    letterSpacing: -1,
  },
  unitSuffix: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textSecondary,
    marginLeft: 8,
  },
  perMonthText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: -2,
  },
  perPersonPill: {
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    marginTop: 12,
  },
  perPersonText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primaryDark,
  },
  barBreakdownContainer: {
    flexDirection: 'row',
    height: 10,
    borderRadius: 5,
    overflow: 'hidden',
    width: '100%',
    backgroundColor: '#E5E7EB',
    marginTop: 16,
  },
  barSegment: {
    height: '100%',
  },
  partialCard: {
    backgroundColor: '#FFFBEB',
    borderWidth: 1.5,
    borderColor: '#FDE68A',
    borderRadius: 16,
    padding: 16,
    marginTop: 14,
  },
  partialTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#92400E',
  },
  partialDesc: {
    fontSize: 12,
    color: '#78350F',
    marginTop: 4,
    lineHeight: 18,
  },
  completeStepBtn: {
    marginTop: 10,
    alignSelf: 'flex-start',
    backgroundColor: '#F59E0B',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 10,
  },
  completeStepText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  breakdownCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 18,
    padding: 16,
    marginTop: 14,
  },
  breakdownTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginBottom: 12,
  },
  catRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  catLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dotMarker: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 10,
  },
  catName: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  catKgText: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800',
  },
  formulaHeader: {
    paddingVertical: 12,
    marginTop: 6,
  },
  formulaTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primaryDark,
  },
  formulaCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  formulaLine: {
    fontSize: 12,
    color: '#374151',
    lineHeight: 20,
    marginBottom: 4,
  },
  boundaryNote: {
    fontSize: 11,
    color: '#6B7280',
    fontStyle: 'italic',
    marginTop: 8,
    lineHeight: 16,
  },
  factorVerText: {
    fontSize: 10,
    color: '#9CA3AF',
    marginTop: 6,
    fontWeight: '600',
  },
  personaliseBtn: {
    marginTop: 14,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    borderStyle: 'dashed',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
  },
  personaliseBtnText: {
    color: COLORS.primaryDark,
    fontSize: 13,
    fontWeight: '700',
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  startChallengeBtn: {
    minHeight: 52,
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.22,
    shadowRadius: 8,
    elevation: 3,
  },
  startChallengeText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
});
