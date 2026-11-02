import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS, RADII, SPACING } from '../../theme';

export default function Toast({
  visible = true,
  message,
  type = 'info', // 'info' | 'success' | 'error'
  onDismiss,
  style,
}) {
  if (!visible || !message) return null;

  const isSuccess = type === 'success';
  const isError = type === 'error';

  const bgColor = isSuccess
    ? COLORS.successBg
    : isError
    ? COLORS.dangerBg
    : COLORS.infoBg;

  const borderColor = isSuccess
    ? COLORS.success
    : isError
    ? COLORS.danger
    : COLORS.info;

  const textColor = isSuccess
    ? '#065F46'
    : isError
    ? '#991B1B'
    : '#1E40AF';

  const icon = isSuccess ? '🌿' : isError ? '⚠️' : 'ℹ️';

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: bgColor, borderColor },
        style,
      ]}
    >
      <Text style={styles.icon}>{icon}</Text>
      <Text style={[styles.message, { color: textColor }]}>{message}</Text>
      {onDismiss ? (
        <TouchableOpacity
          onPress={onDismiss}
          style={styles.closeBtn}
          activeOpacity={0.7}
        >
          <Text style={[styles.closeText, { color: textColor }]}>✕</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: SPACING.md,
    borderRadius: RADII.md,
    borderWidth: 1,
    marginVertical: SPACING.xs,
  },
  icon: {
    fontSize: 16,
    marginRight: SPACING.xs,
  },
  message: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
  },
  closeBtn: {
    padding: 4,
    marginLeft: SPACING.xs,
  },
  closeText: {
    fontSize: 14,
    fontWeight: '700',
  },
});
