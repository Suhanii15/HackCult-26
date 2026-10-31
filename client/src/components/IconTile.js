import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS } from '../theme';

export default function IconTile({
  icon,
  title,
  subtitle,
  selected = false,
  onPress,
  style,
  badgeText,
}) {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      style={[
        styles.tile,
        selected && styles.tileSelected,
        style,
      ]}
    >
      {/* Top right checkmark badge */}
      {selected && (
        <View style={styles.checkBadge}>
          <Text style={styles.checkIcon}>✓</Text>
        </View>
      )}

      {/* Optional Tag badge */}
      {badgeText ? (
        <View style={styles.tagBadge}>
          <Text style={styles.tagText}>{badgeText}</Text>
        </View>
      ) : null}

      {/* Icon */}
      <View style={[styles.iconContainer, selected && styles.iconContainerSelected]}>
        <Text style={styles.iconEmoji}>{icon}</Text>
      </View>

      {/* Labels */}
      <Text style={[styles.title, selected && styles.titleSelected]} numberOfLines={1}>
        {title}
      </Text>

      {subtitle ? (
        <Text style={styles.subtitle} numberOfLines={2}>
          {subtitle}
        </Text>
      ) : null}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  tile: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    minHeight: 110,
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  tileSelected: {
    borderColor: COLORS.primary,
    backgroundColor: '#F0FDF4',
    shadowColor: COLORS.primary,
    shadowOpacity: 0.15,
    shadowRadius: 10,
  },
  checkBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkIcon: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '900',
  },
  tagBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  tagText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#D97706',
  },
  iconContainer: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#F9FAFB',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  iconContainerSelected: {
    backgroundColor: COLORS.primaryLight,
  },
  iconEmoji: {
    fontSize: 26,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary,
    textAlign: 'center',
  },
  titleSelected: {
    color: COLORS.primaryDark,
    fontWeight: '800',
  },
  subtitle: {
    fontSize: 11,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 14,
  },
});
