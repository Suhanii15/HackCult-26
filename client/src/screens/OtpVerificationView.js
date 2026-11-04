import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { COLORS, RADII, SPACING } from '../theme';
import { apiVerifyOtp, apiResendOtp } from '../services/api';

import { tr, useLanguage } from '../i18n/LanguageContext';
export default function OtpVerificationView({
  identifier,
  initialDevOtp = null,
  onVerificationSuccess,
  onBack,
}) {
  useLanguage();
  const [digits, setDigits] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendCooldown, setResendCooldown] = useState(60);
  const [resending, setResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState('');
  const [devOtp, setDevOtp] = useState(initialDevOtp);

  const inputRefs = useRef([]);

  // Countdown timer for Resend button
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const interval = setInterval(() => {
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [resendCooldown]);

  // Focus the first input on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      inputRefs.current[0]?.focus();
    }, 250);
    return () => clearTimeout(timer);
  }, []);

  const handleDigitChange = (text, index) => {
    if (error) setError('');
    if (resendSuccess) setResendSuccess('');

    // Handle full paste (e.g. user pasted 6 digits)
    const cleaned = text.replace(/[^0-9]/g, '');
    if (cleaned.length > 1) {
      const pasted = cleaned.slice(0, 6).split('');
      const nextDigits = [...digits];
      pasted.forEach((d, i) => {
        nextDigits[i] = d;
      });
      setDigits(nextDigits);
      const nextFocus = Math.min(pasted.length, 5);
      inputRefs.current[nextFocus]?.focus();
      return;
    }

    const nextDigits = [...digits];
    nextDigits[index] = cleaned;
    setDigits(nextDigits);

    // Auto advance to next input if digit entered
    if (cleaned && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e, index) => {
    if (e.nativeEvent.key === 'Backspace') {
      if (!digits[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
        const next = [...digits];
        next[index - 1] = '';
        setDigits(next);
      }
    }
  };

  const fullOtp = digits.join('');

  const handleVerify = async () => {
    if (fullOtp.length < 6) {
      setError('Please enter all 6 digits of your verification code.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const res = await apiVerifyOtp({
        identifier,
        otp: fullOtp,
      });

      setLoading(false);
      onVerificationSuccess(res);
    } catch (err) {
      setLoading(false);
      setError(err.message || 'Invalid or expired code. Please check and try again.');
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0 || resending) return;
    setResending(true);
    setError('');
    setResendSuccess('');

    try {
      const res = await apiResendOtp({ identifier });
      setResendCooldown(60);
      setResending(false);
      setResendSuccess('A fresh code has been sent!');
      if (res.devOtp) {
        setDevOtp(res.devOtp);
      }
    } catch (err) {
      setResending(false);
      setError(err.message || 'Could not resend code. Please try again in a moment.');
    }
  };

  const handleAutoFillDev = () => {
    if (!devOtp || devOtp.length !== 6) return;
    setDigits(devOtp.split(''));
    setError('');
    inputRefs.current[5]?.focus();
  };

  return (
    <View style={styles.container}>
      {/* Back button */}
      <TouchableOpacity onPress={onBack} style={styles.backBtn} activeOpacity={0.7}>
        <Text style={styles.backArrow}>←</Text>
        <Text style={styles.backText}>{tr('Change email / phone')}</Text>
      </TouchableOpacity>

      {/* Hero Headings */}
      <View style={styles.headingBox}>
        <View style={styles.badgePill}>
          <Text style={styles.badgeText}>{tr('VERIFICATION REQUIRED')}</Text>
        </View>
        <Text style={styles.title}>{tr('One last step, bestie! 🌱')}</Text>
        <Text style={styles.subtitle}>
          Enter the verification code we sent to{'\n'}
          <Text style={styles.identifierHighlight}>{identifier}</Text>
        </Text>
      </View>

      {/* 6 Individual Digit Input Boxes */}
      <View style={styles.otpBoxesRow}>
        {digits.map((digit, idx) => (
          <TextInput
            key={idx}
            ref={(ref) => (inputRefs.current[idx] = ref)}
            style={[
              styles.otpBox,
              digit ? styles.otpBoxFilled : null,
              error ? styles.otpBoxError : null,
            ]}
            value={digit}
            onChangeText={(txt) => handleDigitChange(txt, idx)}
            onKeyPress={(e) => handleKeyPress(e, idx)}
            keyboardType="number-pad"
            maxLength={6} // Allows paste detection
            selectTextOnFocus
            textAlign="center"
            accessibilityLabel={`Digit ${idx + 1}`}
          />
        ))}
      </View>

      {/* Dev helper pill for effortless testing */}
      {devOtp && (
        <TouchableOpacity
          onPress={handleAutoFillDev}
          style={styles.devPill}
          activeOpacity={0.75}
        >
          <Text style={styles.devPillText}>
            🌱 Dev OTP: <Text style={{ fontWeight: '800' }}>{devOtp}</Text> (Tap to autofill)
          </Text>
        </TouchableOpacity>
      )}

      {/* Error or Success feedback */}
      {error ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>⚠️ {error}</Text>
        </View>
      ) : null}

      {resendSuccess ? (
        <View style={styles.successBox}>
          <Text style={styles.successText}>✅ {resendSuccess}</Text>
        </View>
      ) : null}

      {/* Verify Button */}
      <TouchableOpacity
        style={[styles.verifyBtn, (loading || fullOtp.length < 6) && styles.verifyBtnDisabled]}
        onPress={handleVerify}
        disabled={loading || fullOtp.length < 6}
        activeOpacity={0.85}
      >
        {loading ? (
          <ActivityIndicator color="#FFFFFF" size="small" />
        ) : (
          <Text style={styles.verifyBtnText}>Verify & Start Journey ➔</Text>
        )}
      </TouchableOpacity>

      {/* Resend OTP Row */}
      <View style={styles.resendRow}>
        <Text style={styles.resendLabel}>{tr('Didn\'t receive the code?')}</Text>
        {resendCooldown > 0 ? (
          <Text style={styles.timerText}>Resend in {resendCooldown}s</Text>
        ) : (
          <TouchableOpacity onPress={handleResend} disabled={resending} activeOpacity={0.7}>
            <Text style={styles.resendAction}>
              {resending ? 'Sending...' : 'Resend code'}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Helper Note */}
      <Text style={styles.helperNote}>
        {tr('Valid for 5 minutes. Check your spam/junk folder if you don\'t see it right away.')}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 4,
    paddingTop: 8,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  backArrow: {
    fontSize: 18,
    color: '#065F46',
    fontWeight: '800',
    marginRight: 6,
  },
  backText: {
    fontSize: 13,
    color: '#047857',
    fontWeight: '600',
  },
  headingBox: {
    marginBottom: 26,
  },
  badgePill: {
    alignSelf: 'flex-start',
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 10,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#065F46',
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#064E3B',
    letterSpacing: -0.4,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 20,
  },
  identifierHighlight: {
    fontWeight: '700',
    color: '#0F172A',
  },
  otpBoxesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 20,
  },
  otpBox: {
    flex: 1,
    height: 54,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.8,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  otpBoxFilled: {
    borderColor: '#10B981',
    backgroundColor: '#F0FDF4',
  },
  otpBoxError: {
    borderColor: '#EF4444',
    backgroundColor: '#FEF2F2',
  },
  devPill: {
    alignSelf: 'center',
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 12,
    marginBottom: 16,
  },
  devPillText: {
    fontSize: 12,
    color: '#047857',
    fontWeight: '600',
  },
  errorBox: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
  },
  errorText: {
    color: '#B91C1C',
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
  successBox: {
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#6EE7B7',
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
  },
  successText: {
    color: '#065F46',
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center',
  },
  verifyBtn: {
    backgroundColor: '#047857',
    paddingVertical: 15,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#047857',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
    marginBottom: 20,
  },
  verifyBtnDisabled: {
    backgroundColor: '#94A3B8',
    shadowOpacity: 0,
    elevation: 0,
  },
  verifyBtnText: {
    color: '#FFFFFF',
    fontSize: 15.5,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  resendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 16,
  },
  resendLabel: {
    fontSize: 13,
    color: '#64748B',
  },
  timerText: {
    fontSize: 13,
    color: '#94A3B8',
    fontWeight: '600',
  },
  resendAction: {
    fontSize: 13,
    color: '#047857',
    fontWeight: '800',
    textDecorationLine: 'underline',
  },
  helperNote: {
    fontSize: 11.5,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 16,
  },
});
