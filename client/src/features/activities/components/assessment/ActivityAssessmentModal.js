import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { TopBar, Button, ProgressBar } from '../../../../components/ui';
import { COLORS, RADII, SPACING } from '../../../../theme';
import { getQuestionnaire } from '../../../../activities/questionnaires';
import { generatePersonalizedPlan } from '../../../../activities/recommendationEngine';
import { fetchQuestionnaire, assessActivity, startActivity } from '../../api';
import { queryClient, QUERY_KEYS } from '../../../../services/queryClient';

import SliderControl from './SliderControl';
import ChoiceCards from './ChoiceCards';
import StepperControl from './StepperControl';
import DropdownControl from './DropdownControl';
import MultiSelectChips from './MultiSelectChips';
import PersonalizedPlanView from './PersonalizedPlanView';

export default function ActivityAssessmentModal({
  visible,
  onClose,
  activity,
  onEnrolled,
}) {
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [questionnaire, setQuestionnaire] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [responses, setResponses] = useState({});
  const [generatedPlan, setGeneratedPlan] = useState(null);
  const [error, setError] = useState(null);

  const activityId = activity?.activityId || activity?.id;

  // Initialize or fetch questionnaire when modal opens
  useEffect(() => {
    if (!visible || !activityId) return;

    let isMounted = true;
    setLoading(true);
    setCurrentStep(0);
    setGeneratedPlan(null);
    setError(null);

    const initQuestionnaire = async () => {
      try {
        const qData = await fetchQuestionnaire(activityId);
        if (!isMounted) return;
        const q = qData || getQuestionnaire(activityId);
        setQuestionnaire(q);

        // Prepopulate default responses
        const defaults = {};
        if (q?.questions) {
          q.questions.forEach((qu) => {
            if (qu.defaultValue !== undefined) {
              defaults[qu.id] = qu.defaultValue;
            } else if (qu.type === 'slider' || qu.type === 'stepper') {
              defaults[qu.id] = qu.min || 0;
            } else if (qu.type === 'radio' && qu.options?.[0]) {
              defaults[qu.id] = qu.options[0].id || qu.options[0].value;
            } else if (qu.type === 'dropdown' && qu.options?.[0]) {
              defaults[qu.id] = qu.options[0].id || qu.options[0].value;
            } else if (qu.type === 'multiselect') {
              defaults[qu.id] = [];
            }
          });
        }
        setResponses(defaults);
      } catch (err) {
        console.warn('Failed to load questionnaire, using local:', err);
        const localQ = getQuestionnaire(activityId);
        setQuestionnaire(localQ);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    initQuestionnaire();

    return () => {
      isMounted = false;
    };
  }, [visible, activityId]);

  if (!visible) return null;

  const questions = questionnaire?.questions || [];
  const currentQ = questions[currentStep];
  const totalQuestions = questions.length;
  const progressPercent = totalQuestions > 0 ? (currentStep + 1) / totalQuestions : 0;

  const handleResponseChange = (val) => {
    if (!currentQ) return;
    setResponses((prev) => ({
      ...prev,
      [currentQ.id]: val,
    }));
  };

  const handleNext = async () => {
    if (currentStep < totalQuestions - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      // Complete questionnaire -> Generate personalized plan
      setLoading(true);
      setError(null);
      try {
        const plan = await assessActivity(activityId, responses);
        setGeneratedPlan(plan || generatePersonalizedPlan(activityId, responses, activity));
      } catch (err) {
        console.warn('Backend assessment failed, fallback to local engine:', err);
        setGeneratedPlan(generatePersonalizedPlan(activityId, responses, activity));
      } finally {
        setLoading(false);
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    } else {
      onClose();
    }
  };

  const handleStartChallenge = async () => {
    setSubmitting(true);
    try {
      await startActivity(activityId, responses);
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.activities.all });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.profile.all });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.home.all });
      onEnrolled(generatedPlan);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to start challenge. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const renderControl = () => {
    if (!currentQ) return null;
    const value = responses[currentQ.id];

    switch (currentQ.type) {
      case 'slider':
        return (
          <SliderControl
            question={currentQ}
            value={value}
            onChange={handleResponseChange}
          />
        );
      case 'radio':
        return (
          <ChoiceCards
            question={currentQ}
            value={value}
            onChange={handleResponseChange}
          />
        );
      case 'stepper':
        return (
          <StepperControl
            question={currentQ}
            value={value}
            onChange={handleResponseChange}
          />
        );
      case 'dropdown':
        return (
          <DropdownControl
            question={currentQ}
            value={value}
            onChange={handleResponseChange}
          />
        );
      case 'multiselect':
        return (
          <MultiSelectChips
            question={currentQ}
            value={value}
            onChange={handleResponseChange}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Top Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Text style={styles.closeText}>✕</Text>
          </TouchableOpacity>
          <Text style={styles.title} numberOfLines={1}>
            {generatedPlan ? 'Your Personalized Plan' : activity?.title || 'Personal Assessment'}
          </Text>
          <View style={{ width: 32 }} />
        </View>

        {loading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.loadingText}>Generating your personalized plan...</Text>
          </View>
        ) : generatedPlan ? (
          <PersonalizedPlanView
            plan={generatedPlan}
            onStartChallenge={handleStartChallenge}
            onRetake={() => {
              setGeneratedPlan(null);
              setCurrentStep(0);
            }}
            loading={submitting}
          />
        ) : (
          <View style={styles.content}>
            {/* Step progress bar */}
            <View style={styles.progressContainer}>
              <View style={styles.stepInfoRow}>
                <Text style={styles.stepText}>
                  Step {currentStep + 1} of {totalQuestions}
                </Text>
                <Text style={styles.percentText}>
                  {Math.round(progressPercent * 100)}%
                </Text>
              </View>
              <ProgressBar progress={progressPercent} height={6} color={COLORS.primary} />
            </View>

            {/* Question description */}
            <ScrollView
              contentContainerStyle={styles.questionScroll}
              showsVerticalScrollIndicator={false}
            >
              {renderControl()}
            </ScrollView>

            {/* Error Message */}
            {error ? (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>⚠️ {error}</Text>
              </View>
            ) : null}

            {/* Footer Navigation Buttons */}
            <View style={styles.footer}>
              {currentStep > 0 ? (
                <TouchableOpacity
                  onPress={handleBack}
                  style={styles.backBtn}
                  activeOpacity={0.75}
                >
                  <Text style={styles.backBtnText}>← Back</Text>
                </TouchableOpacity>
              ) : <View style={{ flex: 1 }} />}

              <Button
                title={currentStep === totalQuestions - 1 ? 'Analyze & Create Plan ➔' : 'Next ➔'}
                onPress={handleNext}
                style={styles.nextBtn}
              />
            </View>
          </View>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  closeBtn: {
    padding: 6,
    borderRadius: RADII.full || 20,
    backgroundColor: '#F1F5F9',
  },
  closeText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textSecondary,
    width: 20,
    textAlign: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 8,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xl,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  progressContainer: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: '#F8FAFC',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  stepInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  stepText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  percentText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primaryDark,
  },
  questionScroll: {
    padding: SPACING.md,
    paddingBottom: 100,
  },
  errorBox: {
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.sm,
    padding: 10,
    borderRadius: RADII.sm,
    backgroundColor: '#FEE2E2',
  },
  errorText: {
    color: '#DC2626',
    fontSize: 13,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    backgroundColor: '#FFFFFF',
    gap: 12,
  },
  backBtn: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: RADII.md,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  backBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  nextBtn: {
    flex: 2,
  },
});
