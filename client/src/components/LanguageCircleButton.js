import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useLanguage } from '../i18n/LanguageContext';
import { COLORS } from '../theme';

export default function LanguageCircleButton({ style }) {
  const { language, openLanguageModal } = useLanguage();

  const getLanguageLabel = () => {
    switch (language) {
      case 'gu':
        return 'ગુ';
      case 'hi':
        return 'हि';
      default:
        return 'EN';
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={openLanguageModal}
      style={[styles.circleBtn, style]}
      accessibilityLabel="Change app language"
    >
      <Text style={styles.langText}>{getLanguageLabel()}</Text>
      <View style={styles.globeDot}>
        <Text style={styles.globeEmoji}>🌐</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  circleBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
    position: 'relative',
  },
  langText: {
    fontSize: 14,
    fontWeight: '900',
    color: COLORS.primaryDark,
    letterSpacing: -0.2,
  },
  globeDot: {
    position: 'absolute',
    bottom: -3,
    right: -3,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    width: 14,
    height: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  globeEmoji: {
    fontSize: 9,
    lineHeight: 11,
  },
});
