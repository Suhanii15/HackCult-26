import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  View,
} from 'react-native';
import { COLORS, RADII, SPACING } from '../../theme';

export default function Button({
  title,
  onPress,
  variant = 'primary', // 'primary' | 'secondary' | 'outline' | 'text' | 'danger'
  size = 'md',        // 'sm' | 'md' | 'lg'
  disabled = false,
  loading = false,
  icon = null,
  style,
  textStyle,
  accessibilityLabel,
}) {
  const isPrimary = variant === 'primary';
  const isSecondary = variant === 'secondary';
  const isOutline = variant === 'outline';
  const isText = variant === 'text';
  const isDanger = variant === 'danger';

  const containerStyles = [
    styles.base,
    styles[size],
    isPrimary && styles.primary,
    isSecondary && styles.secondary,
    isOutline && styles.outline,
    isText && styles.textVariant,
    isDanger && styles.danger,
    disabled && styles.disabled,
    style,
  ];

  const labelStyles = [
    styles.labelBase,
    styles[`${size}Label`],
    isPrimary && styles.primaryLabel,
    isSecondary && styles.secondaryLabel,
    isOutline && styles.outlineLabel,
    isText && styles.textVariantLabel,
    isDanger && styles.dangerLabel,
    disabled && styles.disabledLabel,
    textStyle,
  ];

  const spinnerColor =
    isOutline || isText
      ? COLORS.primary
      : isDanger
      ? COLORS.white
      : COLORS.white;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.75}
      style={containerStyles}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || title}
      accessibilityState={{ disabled: disabled || loading }}
    >
      {loading ? (
        <ActivityIndicator size="small" color={spinnerColor} />
      ) : (
        <View style={styles.contentRow}>
          {icon ? <View style={styles.iconMargin}>{icon}</View> : null}
          {title ? <Text style={labelStyles}>{title}</Text> : null}
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 44, // 44px+ touch target
    borderRadius: RADII.md,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.md,
    flexDirection: 'row',
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconMargin: {
    marginRight: SPACING.xs,
  },
  // Sizes
  sm: {
    minHeight: 36,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: RADII.sm,
  },
  md: {
    minHeight: 44,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  lg: {
    minHeight: 52,
    paddingVertical: 14,
    paddingHorizontal: 22,
    borderRadius: RADII.lg,
  },
  // Variants
  primary: {
    backgroundColor: COLORS.primary,
  },
  secondary: {
    backgroundColor: COLORS.primaryLight,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: COLORS.primary,
  },
  textVariant: {
    backgroundColor: 'transparent',
    minHeight: 44,
    paddingHorizontal: SPACING.sm,
  },
  danger: {
    backgroundColor: COLORS.danger,
  },
  disabled: {
    opacity: 0.45,
  },
  // Labels
  labelBase: {
    fontWeight: '700',
    textAlign: 'center',
  },
  smLabel: {
    fontSize: 13,
  },
  mdLabel: {
    fontSize: 15,
  },
  lgLabel: {
    fontSize: 17,
  },
  primaryLabel: {
    color: COLORS.white,
  },
  secondaryLabel: {
    color: COLORS.primaryDark,
  },
  outlineLabel: {
    color: COLORS.primary,
  },
  textVariantLabel: {
    color: COLORS.primary,
  },
  dangerLabel: {
    color: COLORS.white,
  },
  disabledLabel: {
    color: COLORS.textMuted,
  },
});
