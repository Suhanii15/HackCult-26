import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { COLORS, RADII, SPACING } from '../../theme';

export default function Chip({
  label,
  ease, // 'easy' | 'medium' | 'difficult' | undefined
  active = false,
  onPress,
  icon = null,
  style,
  textStyle,
}) {
  let chipBg = COLORS.background;
  let textColor = COLORS.textSecondary;
  let borderColor = COLORS.border;
  let dotColor = null;

  if (ease) {
    const easeKey = ease.toLowerCase();
    if (easeKey === 'easy') {
      chipBg = COLORS.ease.easyBg;
      textColor = COLORS.ease.easyText;
      borderColor = '#A7F3D0';
      dotColor = COLORS.ease.easy;
    } else if (easeKey === 'medium') {
      chipBg = COLORS.ease.mediumBg;
      textColor = COLORS.ease.mediumText;
      borderColor = '#FDE68A';
      dotColor = COLORS.ease.medium;
    } else if (easeKey === 'difficult') {
      chipBg = COLORS.ease.difficultBg;
      textColor = COLORS.ease.difficultText;
      borderColor = '#FECACA';
      dotColor = COLORS.ease.difficult;
    }
  } else if (active) {
    chipBg = COLORS.primaryLight;
    textColor = COLORS.primaryDark;
    borderColor = COLORS.primary;
  }

  const Container = onPress ? TouchableOpacity : View;

  return (
    <Container
      onPress={onPress}
      activeOpacity={0.7}
      style={[
        styles.chip,
        { backgroundColor: chipBg, borderColor },
        style,
      ]}
    >
      {dotColor ? (
        <View style={[styles.dot, { backgroundColor: dotColor }]} />
      ) : null}
      {icon ? <View style={styles.iconMargin}>{icon}</View> : null}
      <Text style={[styles.label, { color: textColor }, textStyle]}>
        {label}
      </Text>
    </Container>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: RADII.full,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    marginRight: 6,
  },
  iconMargin: {
    marginRight: 4,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
});
