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
import { useLanguage } from '../i18n/LanguageContext';
import { apiRegister, apiLogin } from '../services/api';

export default function AuthScreen({ initialMode = 'signup', onAuthSuccess, onBack }) {
  const { t } = useLanguage();
  const [mode, setMode] = useState(initialMode);
  const [name, setName] = useState('');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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
      let res;
      if (mode === 'signup') {
        res = await apiRegister({
          fullName: trimmedName,
          identifier: trimmedIdentifier,
          password,
        });
      } else {
        res = await apiLogin({
          identifier: trimmedIdentifier,
          password,
        });
      }

      setLoading(false);
      onAuthSuccess({
        ...(res.user || {}),
        name: res.user?.fullName || trimmedName || 'Citizen',
        identifier: res.user?.email || trimmedIdentifier,
        isNewUser: mode === 'signup',
        token: res.token,
      });
    } catch (err) {
      setLoading(false);
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
          {/* Top Bar with Back Button + Brand Logo + Top-right Language Circle Button */}
          <View style={styles.topBar}>
            <TouchableOpacity onPress={onBack} style={styles.backButton}>
              <Text style={styles.backArrow}>←</Text>
            </TouchableOpacity>
            <BrandLogo size="small" color={COLORS.primary} />
            <LanguageCircleButton />
          </View>

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
                Sign Up
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
                Log In
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
                    Continue in Offline / Demo Mode ➔
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
                  setPassword('MissionLife2026!');
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
                    {mode === 'signup' ? t('auth_btn_signup') : t('auth_btn_login')}
                  </Text>
                )}
              </TouchableOpacity>

              {/* Separate Offline / Demo Mode Option */}
              {!error && (
                <TouchableOpacity
                  onPress={() => {
                    setError('');
                    onAuthSuccess({
                      name: name.trim() || 'Priya Patel',
                      identifier: identifier.trim() || 'demo@missionlife.gujarat.in',
                      isNewUser: mode === 'signup',
                      isOfflineDemo: true,
                    });
                  }}
                  style={styles.secondaryDemoBtn}
                  activeOpacity={0.75}
                >
                  <Text style={styles.secondaryDemoText}>
                    Continue in Offline / Demo Mode ➔
                  </Text>
                </TouchableOpacity>
              )}
            </View>

          {/* Bottom Security / Government Tag */}
          <View style={styles.securityNote}>
            <Text style={styles.securityText}>{t('auth_security_note')}</Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </AppSafeArea>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backArrow: {
    fontSize: 18,
    color: COLORS.primaryDark,
    fontWeight: '700',
  },
  segmentContainer: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: 14,
    padding: 4,
    marginTop: 14,
    marginBottom: 20,
  },
  segmentTab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 11,
  },
  segmentTabActive: {
    backgroundColor: COLORS.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  segmentText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  segmentTextActive: {
    color: COLORS.primary,
    fontWeight: '800',
  },
  headerBox: {
    marginBottom: 20,
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
    lineHeight: 19,
    marginTop: 4,
  },
  formCard: {
    backgroundColor: '#FFFFFF',
  },
  inputGroup: {
    marginBottom: 14,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: COLORS.textPrimary,
  },
  errorContainer: {
    marginBottom: 12,
  },
  errorText: {
    color: '#DC2626',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
  },
  offlineFallbackBtn: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: '#FEF3C7',
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  offlineFallbackText: {
    fontSize: 12,
    color: '#B45309',
    fontWeight: '700',
  },
  demoFillBtn: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginBottom: 16,
  },
  demoFillText: {
    color: COLORS.primaryDark,
    fontSize: 12,
    fontWeight: '700',
  },
  submitBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 15,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.22,
    shadowRadius: 8,
    elevation: 3,
  },
  submitBtnText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '700',
  },
  secondaryDemoBtn: {
    marginTop: 12,
    paddingVertical: 11,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryDemoText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  securityNote: {
    marginTop: 24,
    alignItems: 'center',
  },
  securityText: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
  },
});
