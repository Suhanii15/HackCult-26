import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Card, Button } from '../../../../components/ui';
import { COLORS, RADII, SPACING } from '../../../../theme';

export default function PersonalizedPlanView({
  plan,
  onStartChallenge,
  onRetake,
  loading = false,
}) {
  if (!plan) return null;

  // 1. Current habit display
  const currentUsageText = (typeof plan.currentUsage === 'string' && plan.currentUsage.trim().length > 0)
    ? plan.currentUsage
    : plan.currentUsage?.formatted || (plan.currentUsage?.value !== undefined
        ? `${plan.currentUsage.value} ${plan.currentUsage.unit || ''}`.trim()
        : 'Current habit');

  // 2. Recommended target display
  const recommendedTargetText = (typeof plan.recommendedTarget === 'string' && plan.recommendedTarget.trim().length > 0)
    ? plan.recommendedTarget
    : plan.recommendedTarget?.formatted || (plan.recommendedTarget?.value !== undefined
        ? `${plan.recommendedTarget.value} ${plan.recommendedTarget.unit || ''}`.trim()
        : 'Optimized habit');

  // 3. Reduction description & percentage
  const reductionText = typeof plan.recommendedReduction === 'string'
    ? plan.recommendedReduction
    : plan.recommendedReduction?.description || 'Your Personalized Target';

  // 4. Resource savings
  const resVal = plan.resourceSavings?.amount !== undefined
    ? plan.resourceSavings.amount
    : plan.resourceSavings?.value;
  const resFormatted = plan.resourceSavings?.formatted || (resVal
    ? `${resVal} ${plan.resourceSavings?.unit || ''}`.trim()
    : null);

  // 5. Carbon savings calculation
  const co2Val = typeof plan.carbonSavings === 'object'
    ? (plan.carbonSavings.totalCycleKgCO2e || plan.carbonSavings.perDayKgCO2e || 0)
    : (plan.carbonSavingsKgCO2e || 0);

  const co2Display = co2Val > 0 ? (Math.round(co2Val * 100) / 100) : 0;
  const co2Formatted = plan.carbonSavings?.formatted || (co2Display > 0 ? `Saves ~${co2Display} kg CO₂e` : 'Avoided emissions');

  // 6. Rewards
  const ecoPts = plan.rewards?.ecoScoreReward || plan.rewards?.ecoScore || 5;
  const greenPts = plan.rewards?.greenPointsReward || plan.rewards?.greenPoints || 25;

  // 7. Daily action plan
  const dailyPlan = Array.isArray(plan.dailyPlan) ? plan.dailyPlan : [];

  // 8. Methodology and assumptions
  const formula = plan.carbonSavings?.formula || plan.calculationMethod || 'Grid & transport emission factors';
  const emissionFactor = plan.carbonSavings?.emissionFactor || 'India CEA / ARAI standards';
  const assumptions = plan.carbonSavings?.assumptions || (Array.isArray(plan.assumptions) ? plan.assumptions.join(' • ') : '');

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      {/* Target & Reduction Card */}
      <Card style={styles.heroCard} elevation="subtle">
        <View style={styles.badgeRow}>
          <View style={styles.statusBadge}>
            <Text style={styles.statusBadgeText}>✨ TAILORED FOR YOU</Text>
          </View>
        </View>

        <Text style={styles.heroTitle}>{reductionText}</Text>

        <View style={styles.comparisonGrid}>
          <View style={styles.comparisonCol}>
            <Text style={styles.comparisonLabel}>CURRENT HABIT</Text>
            <Text style={styles.comparisonVal}>{currentUsageText}</Text>
          </View>
          <View style={styles.arrowCol}>
            <Text style={styles.arrowText}>➔</Text>
          </View>
          <View style={styles.comparisonCol}>
            <Text style={[styles.comparisonLabel, { color: COLORS.primaryDark }]}>RECOMMENDED TARGET</Text>
            <Text style={[styles.comparisonVal, { color: COLORS.primaryDark }]}>
              {recommendedTargetText}
            </Text>
          </View>
        </View>
      </Card>

      {/* Resource & Carbon Savings */}
      <View style={styles.metricsRow}>
        {resFormatted ? (
          <View style={[styles.metricCard, { backgroundColor: '#E0F2FE', borderColor: '#BAE6FD' }]}>
            <Text style={styles.metricVal}>
              {resVal ? `${resVal}` : ''}
            </Text>
            <Text style={styles.metricLabel}>{resFormatted}</Text>
          </View>
        ) : null}

        <View style={[styles.metricCard, { backgroundColor: '#DCFCE7', borderColor: '#BBF7D0' }]}>
          <Text style={[styles.metricVal, { color: '#15803D' }]}>
            {co2Display > 0 ? `${co2Display} kg` : 'CO₂e Saved'}
          </Text>
          <Text style={[styles.metricLabel, { color: '#166534' }]}>
            {co2Formatted}
          </Text>
        </View>
      </View>

      {/* Rewards Pill */}
      <View style={styles.rewardsRow}>
        <View style={styles.rewardChip}>
          <Text style={styles.rewardIcon}>⚡</Text>
          <Text style={styles.rewardText}>+{ecoPts} EcoScore</Text>
        </View>
        <View style={styles.rewardChip}>
          <Text style={styles.rewardIcon}>🪙</Text>
          <Text style={styles.rewardText}>+{greenPts} Green Points</Text>
        </View>
      </View>

      {/* 7-Day Progressive Plan */}
      {dailyPlan.length > 0 ? (
        <View style={styles.roadmapSection}>
          <Text style={styles.sectionHeading}>📅 7-Day Action Roadmap</Text>
          <Text style={styles.sectionSub}>Gradual, achievable steps tailored to your current routine</Text>

          {dailyPlan.map((step) => (
            <View key={step.day} style={styles.stepRow}>
              <View style={styles.dayBubble}>
                <Text style={styles.dayBubbleText}>Day {step.day}</Text>
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepAction}>{step.action}</Text>
                {step.target !== undefined && step.target !== null ? (
                  <Text style={styles.stepTarget}>Target: {step.target}</Text>
                ) : null}
              </View>
            </View>
          ))}
        </View>
      ) : null}

      {/* Calculation Method & Assumptions */}
      <View style={styles.assumptionsCard}>
        <Text style={styles.assumptionsTitle}>🔬 Calculation Methodology</Text>
        {formula ? (
          <Text style={styles.assumptionsText}>📐 Formula: {formula}</Text>
        ) : null}
        {emissionFactor ? (
          <Text style={styles.assumptionItem}>⚡ Emission Factor: {emissionFactor}</Text>
        ) : null}
        {assumptions ? (
          <Text style={styles.assumptionItem}>📋 Assumptions: {assumptions}</Text>
        ) : null}
      </View>

      {/* Actions */}
      <View style={styles.actionsContainer}>
        <Button
          title={loading ? 'Starting...' : '🚀 Start Personalized Challenge'}
          onPress={onStartChallenge}
          loading={loading}
          style={styles.startBtn}
        />
        <TouchableOpacity onPress={onRetake} style={styles.retakeBtn} disabled={loading}>
          <Text style={styles.retakeText}>Modify Answers & Recalculate</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: SPACING.md,
    paddingBottom: 40,
  },
  heroCard: {
    padding: SPACING.md,
    backgroundColor: '#FFFFFF',
    borderColor: COLORS.primaryLight,
    borderWidth: 1.5,
    borderRadius: RADII.lg,
    marginBottom: SPACING.md,
  },
  badgeRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  statusBadge: {
    backgroundColor: '#ECFDF5',
    borderColor: '#A7F3D0',
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADII.full || 12,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#065F46',
    letterSpacing: 0.5,
  },
  heroTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
    lineHeight: 22,
  },
  comparisonGrid: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: RADII.md,
    padding: 12,
    marginVertical: 4,
  },
  comparisonCol: {
    flex: 1,
  },
  comparisonLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.textSecondary,
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  comparisonVal: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  arrowCol: {
    paddingHorizontal: 8,
  },
  arrowText: {
    fontSize: 16,
    color: COLORS.primaryDark,
    fontWeight: '800',
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: SPACING.md,
  },
  metricCard: {
    flex: 1,
    padding: SPACING.sm,
    borderRadius: RADII.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 64,
  },
  metricVal: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0369A1',
    marginBottom: 2,
  },
  metricLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#0284C7',
    textAlign: 'center',
  },
  rewardsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginBottom: SPACING.md,
  },
  rewardChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderColor: '#E2E8F0',
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: RADII.full || 16,
  },
  rewardIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  rewardText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  roadmapSection: {
    marginBottom: SPACING.md,
    backgroundColor: '#FFFFFF',
    padding: SPACING.md,
    borderRadius: RADII.lg,
    borderColor: '#E2E8F0',
    borderWidth: 1,
  },
  sectionHeading: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  sectionSub: {
    fontSize: 11.5,
    color: COLORS.textSecondary,
    marginBottom: 12,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    paddingBottom: 8,
  },
  dayBubble: {
    backgroundColor: '#E0F2F1',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: RADII.sm,
    marginRight: 10,
  },
  dayBubbleText: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.primaryDark,
  },
  stepContent: {
    flex: 1,
  },
  stepAction: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textPrimary,
    lineHeight: 18,
  },
  stepTarget: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  assumptionsCard: {
    backgroundColor: '#F8FAFC',
    borderColor: '#E2E8F0',
    borderWidth: 1,
    padding: SPACING.sm,
    borderRadius: RADII.md,
    marginBottom: SPACING.lg,
  },
  assumptionsTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  assumptionsText: {
    fontSize: 11,
    color: COLORS.textSecondary,
    lineHeight: 16,
    marginBottom: 4,
  },
  assumptionItem: {
    fontSize: 11,
    color: COLORS.textSecondary,
    lineHeight: 16,
    marginBottom: 3,
  },
  actionsContainer: {
    gap: 8,
  },
  startBtn: {
    marginBottom: 4,
  },
  retakeBtn: {
    paddingVertical: 10,
    alignItems: 'center',
  },
  retakeText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
});
