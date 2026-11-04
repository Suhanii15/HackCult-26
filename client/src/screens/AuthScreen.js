import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { COLORS } from '../theme';
import BrandLogo from '../components/BrandLogo';
import AppSafeArea from '../components/AppSafeArea';
import LanguageCircleButton from '../components/LanguageCircleButton';
import { useLanguage, tr } from '../i18n/LanguageContext';
import { apiRegister, apiLogin } from '../services/api';
import OtpVerificationView from './OtpVerificationView';

export default function AuthScreen({ initialMode = 'signup', onAuthSuccess, onBack }) {
  const { t } = useLanguage();
  const [authStep, setAuthStep] = useState('form'); // 'form' | 'otp'
  const [mode, setMode] = useState(initialMode);
  const [name, setName] = useState('');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [otpIdentifier, setOtpIdentifier] = useState('');
  const [devOtp, setDevOtp] = useState(null);

  const handleSubmit = async () => {
    const trimmedIdentifier = identifier.trim();
    const trimmedName = name.trim();

    if (mode === 'signup' && !trimmedName) {
      setError('Please enter your full name.');
      return;
    }
    if (!trimmedIdentifier) {
      setError('Please enter your email or mobile number.');
      return;
    }
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedIdentifier);
    const isPhone = /^[+]?[0-9\s-]{10,15}$/.test(trimmedIdentifier);
    if (!isEmail && !isPhone) {
      setError('Please enter a valid email address or 10-digit mobile number.');
      return;
    }
    if (!password) {
      setError('Please enter your password.');
      return;
    }
    if (mode === 'signup' && password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      if (mode === 'signup') {
        const res = await apiRegister({
          fullName: trimmedName,
          identifier: trimmedIdentifier,
          password,
        });

        setLoading(false);
        if (res.requiresOtp) {
          setOtpIdentifier(trimmedIdentifier);
          if (res.devOtp) setDevOtp(res.devOtp);
          setAuthStep('otp');
          return;
        }

        // If backend auto-verified (fallback)
        onAuthSuccess({
          ...(res.user || {}),
          name: res.user?.fullName || trimmedName || 'Citizen',
          identifier: res.user?.email || trimmedIdentifier,
          isNewUser: true,
          token: res.token,
        });
      } else {
        const res = await apiLogin({
          identifier: trimmedIdentifier,
          password,
        });

        setLoading(false);
        onAuthSuccess({
          ...(res.user || {}),
          name: res.user?.fullName || trimmedName || 'Citizen',
          identifier: res.user?.email || trimmedIdentifier,
          isNewUser: false,
          token: res.token,
        });
      }
    } catch (err) {
      setLoading(false);
      // If login failed because account is unverified, guide user to OTP verification
      if (err.data?.requiresOtp) {
        setOtpIdentifier(trimmedIdentifier);
        if (err.data?.devOtp) setDevOtp(err.data.devOtp);
        setAuthStep('otp');
        return;
      }

      console.warn('Backend Auth Request failed:', err.message);
      setError(err.message || 'Authentication failed. Please verify your credentials or server connection.');
    }
  };

  return (
    <AppSafeArea style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.container}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Top Bar with Back Button + Brand Logo + Language Circle */}
          <View style={styles.topBar}>
            <TouchableOpacity
              onPress={authStep === 'otp' ? () => setAuthStep('form') : onBack}
              style={styles.backButton}
              accessibilityLabel="Go back"
            >
              <Text style={styles.backArrow}>←</Text>
            </TouchableOpacity>
            <BrandLogo size="small" color={COLORS.primary} />
            <LanguageCircleButton />
          </View>

          {/* Conditional Screen Rendering: Form vs OTP Verification */}
          {authStep === 'otp' ? (
            <OtpVerificationView
              identifier={otpIdentifier}
              initialDevOtp={devOtp}
              onVerificationSuccess={(res) => {
                onAuthSuccess({
                  ...(res.user || {}),
                  name: res.user?.fullName || name.trim() || 'Citizen',
                  identifier: res.user?.email || otpIdentifier,
                  isNewUser: true,
                  token: res.token,
                });
              }}
              onBack={() => setAuthStep('form')}
            />
          ) : (
            <>
              {/* Segmented Mode Selector: Log In / Sign Up */}
              <View style={styles.segmentContainer}>
                <TouchableOpacity
                  style={[
                    styles.segmentTab,
                    mode === 'signup' && styles.segmentTabActive,
                  ]}
                  onPress={() => {
                    setMode('signup');
                    setError('');
                  }}
                >
                  <Text
                    style={[
                      styles.segmentText,
                      mode === 'signup' && styles.segmentTextActive,
                    ]}
                  >
                    {tr('Sign Up')}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.segmentTab,
                    mode === 'login' && styles.segmentTabActive,
                  ]}
                  onPress={() => {
                    setMode('login');
                    setError('');
                  }}
                >
                  <Text
                    style={[
                      styles.segmentText,
                      mode === 'login' && styles.segmentTextActive,
                    ]}
                  >
                    {tr('Log In')}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Headings */}
              <View style={styles.headerBox}>
                <Text style={styles.title}>
                  {mode === 'signup' ? t('auth_signup_title') : t('auth_login_title')}
                </Text>
                <Text style={styles.subtitle}>
                  {mode === 'signup' ? t('auth_signup_sub') : t('auth_login_sub')}
                </Text>
              </View>

              {/* Form Fields */}
              <View style={styles.formCard}>
                {mode === 'signup' && (
                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>{t('auth_name_label')}</Text>
                    <TextInput
                      style={styles.input}
                      placeholder={t('auth_name_placeholder')}
                      placeholderTextColor="#9CA3AF"
                      value={name}
                      onChangeText={(text) => {
                        setName(text);
                        if (error) setError('');
                      }}
                      autoCapitalize="words"
                    />
                  </View>
                )}

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>{t('auth_id_label')}</Text>
                  <TextInput
                    style={styles.input}
                    placeholder={t('auth_id_placeholder')}
                    placeholderTextColor="#9CA3AF"
                    value={identifier}
                    onChangeText={(text) => {
                      setIdentifier(text);
                      if (error) setError('');
                    }}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>{t('auth_pass_label')}</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="••••••••"
                    placeholderTextColor="#9CA3AF"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                  />
                </View>

                {error ? (
                  <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>⚠️ {error}</Text>
                    <TouchableOpacity
                      onPress={() => {
                        setError('');
                        onAuthSuccess({
                          name: name.trim() || 'Citizen',
                          identifier: identifier.trim(),
                          isNewUser: mode === 'signup',
                          isOfflineDemo: true,
                        });
                      }}
                      style={styles.offlineFallbackBtn}
                    >
                      <Text style={styles.offlineFallbackText}>
                        {tr('Continue in Offline / Demo Mode ➔')}
                      </Text>
                    </TouchableOpacity>
                  </View>
                ) : null}

                {/* Quick Demo Autofill Pill */}
                {__DEV__ && (
                  <TouchableOpacity
                    style={styles.demoFillBtn}
                    onPress={() => {
                      setName('Priya Patel');
                      setIdentifier('priya.patel@gujarat.in');
                      setPassword('EcoPulse2026!');
                      setError('');
                    }}
                  >
                    <Text style={styles.demoFillText}>{t('auth_quick_fill')}</Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity
                  style={[styles.submitBtn, loading && { opacity: 0.7 }]}
                  activeOpacity={0.85}
                  onPress={handleSubmit}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color={COLORS.white} />
                  ) : (
                    <Text style={styles.submitBtnText}>
                      {mode === 'signup' ? 'Get Verification Code 🌱 ➔' : t('auth_btn_login')}
                    </Text>
                  )}
                </TouchableOpacity>
              </View>

              {/* Bottom Security / Government Tag */}
              <View style={styles.securityNote}>
                <Text style={styles.securityText}>
                  {tr('🛡️ SSL Encrypted • Government of Gujarat GEDA Portal')}
                </Text>
              </View>
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </AppSafeArea>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 40,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    marginBottom: 8,
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  backArrow: {
    fontSize: 22,
    color: '#0F172A',
  },
  segmentContainer: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 14,
    padding: 4,
    marginBottom: 24,
  },
  segmentTab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
  },
  segmentTabActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  segmentText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
  },
  segmentTextActive: {
    color: '#047857',
    fontWeight: '800',
  },
  headerBox: {
    marginBottom: 24,
  },
  title: {
    fontSize: 26,
    fontWeight: '900',
    color: '#064E3B',
    marginBottom: 6,
    letterSpacing: -0.4,
  },
  subtitle: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20,
  },
  formCard: {
    gap: 16,
  },
  inputGroup: {
    gap: 6,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
  },
  input: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: '#0F172A',
  },
  errorContainer: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    padding: 12,
    borderRadius: 12,
    gap: 8,
  },
  errorText: {
    color: '#B91C1C',
    fontSize: 13,
    fontWeight: '600',
  },
  offlineFallbackBtn: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EF4444',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  offlineFallbackText: {
    color: '#B91C1C',
    fontSize: 12,
    fontWeight: '700',
  },
  demoFillBtn: {
    alignSelf: 'flex-start',
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  demoFillText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#047857',
  },
  submitBtn: {
    backgroundColor: '#047857',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    shadowColor: '#047857',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  securityNote: {
    marginTop: 32,
    alignItems: 'center',
  },
  securityText: {
    fontSize: 11.5,
    color: '#94A3B8',
    fontWeight: '500',
  },
});
