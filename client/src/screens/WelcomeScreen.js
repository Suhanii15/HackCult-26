import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Dimensions,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { COLORS } from '../theme';
import BrandLogo from '../components/BrandLogo';
import LanguageCircleButton from '../components/LanguageCircleButton';
import AppSafeArea from '../components/AppSafeArea';
import { useLanguage } from '../i18n/LanguageContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function WelcomeScreen({ onNavigateToAuth }) {
  const { t } = useLanguage();
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef(null);

  const slides = [
    {
      id: '1',
      badge: t('welcome_slide1_badge'),
      title: t('welcome_slide1_title'),
      description: t('welcome_slide1_desc'),
      statLabel: t('welcome_slide1_stat_label'),
      statValue: t('welcome_slide1_stat_val'),
      icon: '🌱',
      colorTint: '#E8F5E9',
    },
    {
      id: '2',
      badge: t('welcome_slide2_badge'),
      title: t('welcome_slide2_title'),
      description: t('welcome_slide2_desc'),
      statLabel: t('welcome_slide2_stat_label'),
      statValue: t('welcome_slide2_stat_val'),
      icon: '⚡',
      colorTint: '#E0F2F1',
    },
    {
      id: '3',
      badge: t('welcome_slide3_badge'),
      title: t('welcome_slide3_title'),
      description: t('welcome_slide3_desc'),
      statLabel: t('welcome_slide3_stat_label'),
      statValue: t('welcome_slide3_stat_val'),
      icon: '☀️',
      colorTint: '#FFF8E1',
    },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIndex((prevIndex) => {
        const nextIndex = (prevIndex + 1) % slides.length;
        if (flatListRef.current) {
          flatListRef.current.scrollToIndex({
            index: nextIndex,
            animated: true,
          });
        }
        return nextIndex;
      });
    }, 3000);

    return () => clearInterval(timer);
  }, [slides.length]);

  const handleMomentumScrollEnd = (event) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / SCREEN_WIDTH);
    if (index >= 0 && index < slides.length) {
      setActiveIndex(index);
    }
  };

  const renderSlide = ({ item }) => (
    <View style={styles.slideContainer}>
      <View style={[styles.visualCard, { backgroundColor: item.colorTint }]}>
        <View style={styles.iconCircle}>
          <Text style={styles.iconEmoji}>{item.icon}</Text>
        </View>

        <View style={styles.statChip}>
          <Text style={styles.statLabel}>{item.statLabel}</Text>
          <Text style={styles.statValue}>{item.statValue}</Text>
        </View>
      </View>

      <View style={styles.slideTextContainer}>
        <View style={styles.badgePill}>
          <Text style={styles.badgeText}>{item.badge}</Text>
        </View>
        <Text style={styles.slideTitle}>{item.title}</Text>
        <Text style={styles.slideDesc}>{item.description}</Text>
      </View>
    </View>
  );

  return (
    <AppSafeArea style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* TOP HEADER: Brand Logo on left + Top-right Language Circle Button */}
      <View style={styles.header}>
        <BrandLogo size="small" color={COLORS.primary} showTagline={false} />
        <LanguageCircleButton />
      </View>

      {/* CAROUSEL SECTION */}
      <View style={styles.carouselSection}>
        <FlatList
          ref={flatListRef}
          data={slides}
          renderItem={renderSlide}
          keyExtractor={(item) => item.id}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={handleMomentumScrollEnd}
          getItemLayout={(_, index) => ({
            length: SCREEN_WIDTH,
            offset: SCREEN_WIDTH * index,
            index,
          })}
        />

        {/* Dot Indicators */}
        <View style={styles.dotsRow}>
          {slides.map((_, idx) => (
            <View
              key={idx}
              style={[
                styles.dot,
                activeIndex === idx ? styles.dotActive : styles.dotInactive,
              ]}
            />
          ))}
        </View>
      </View>

      {/* BOTTOM AUTHENTICATION SECTION */}
      <View style={styles.bottomSection}>
        <TouchableOpacity
          style={styles.btnPrimary}
          activeOpacity={0.85}
          onPress={() => onNavigateToAuth('signup')}
        >
          <Text style={styles.btnPrimaryText}>{t('btn_create_account')}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.btnSecondary}
          activeOpacity={0.8}
          onPress={() => onNavigateToAuth('login')}
        >
          <Text style={styles.btnSecondaryText}>{t('btn_login')}</Text>
        </TouchableOpacity>

        <Text style={styles.disclaimerText}>{t('welcome_disclaimer')}</Text>
      </View>
    </AppSafeArea>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: '#FFFFFF',
    justifyContent: 'space-between',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  carouselSection: {
    flex: 7.2,
    justifyContent: 'center',
  },
  slideContainer: {
    width: SCREEN_WIDTH,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  visualCard: {
    width: '100%',
    height: 200,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    position: 'relative',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 3,
  },
  iconCircle: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  iconEmoji: {
    fontSize: 40,
  },
  statChip: {
    position: 'absolute',
    bottom: -14,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  statLabel: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statValue: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: '800',
    marginTop: 1,
  },
  slideTextContainer: {
    alignItems: 'center',
    marginTop: 8,
    paddingHorizontal: 8,
  },
  badgePill: {
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 8,
  },
  badgeText: {
    color: COLORS.primaryDark,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.6,
  },
  slideTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: 6,
    letterSpacing: -0.3,
  },
  slideDesc: {
    fontSize: 13,
    lineHeight: 19,
    color: COLORS.textSecondary,
    textAlign: 'center',
    paddingHorizontal: 6,
  },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 6,
  },
  dot: {
    height: 7,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  dotActive: {
    width: 24,
    backgroundColor: COLORS.primary,
  },
  dotInactive: {
    width: 7,
    backgroundColor: '#D1D5DB',
  },
  bottomSection: {
    flex: 2.8,
    paddingHorizontal: 24,
    justifyContent: 'flex-start',
    backgroundColor: '#FFFFFF',
  },
  btnPrimary: {
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.22,
    shadowRadius: 8,
    elevation: 3,
  },
  btnPrimaryText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  btnSecondary: {
    backgroundColor: COLORS.white,
    paddingVertical: 13,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
  },
  btnSecondaryText: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: '700',
  },
  disclaimerText: {
    fontSize: 11,
    color: '#9CA3AF',
    textAlign: 'center',
    marginTop: 10,
  },
});
