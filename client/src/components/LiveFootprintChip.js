import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { COLORS } from '../theme';
import { useLanguage } from '../i18n/LanguageContext';

export default function LiveFootprintChip({ footprintResult }) {
  const { t } = useLanguage();
  const [displayValue, setDisplayValue] = useState(0);
  const [sheetVisible, setSheetVisible] = useState(false);

  const totalKg = footprintResult?.total || 0;
  const isPartial = footprintResult ? footprintResult.partial : true;

  // Debounced count-up display (300ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDisplayValue(totalKg);
    }, 300);

    return () => clearTimeout(timer);
  }, [totalKg]);

  const categories = footprintResult?.categories || {
    electricity: { kg: null, status: 'unavailable' },
    cooking: { kg: null, status: 'unavailable' },
    transport: { kg: null, status: 'unavailable' },
  };

  const getStatusBadge = (cat) => {
    switch (cat.status) {
      case 'measured':
        return { text: t('measured'), color: '#059669', bg: '#DCFCE7' };
      case 'reported':
        return { text: t('reported'), color: '#0284C7', bg: '#E0F2FE' };
      case 'estimated':
        return { text: t('estimated'), color: '#D97706', bg: '#FEF3C7' };
      default:
        return { text: t('unavailable'), color: '#6B7280', bg: '#F3F4F6' };
    }
  };

  return (
    <>
      <View style={styles.floatingChip}>
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => setSheetVisible(true)}
          style={styles.chipTouchable}
        >
          {/* Carbon Value */}
          <Text style={styles.chipValue}>
            {t('live_estimate', { val: displayValue })}
          </Text>

          {/* Partial Badge if categories missing */}
          {isPartial && (
            <View style={styles.partialBadge}>
              <Text style={styles.partialText}>{t('partial_badge')}</Text>
              <Text style={styles.infoIcon}>ⓘ</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Coverage Bottom Sheet Modal */}
      <Modal
        visible={sheetVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setSheetVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setSheetVisible(false)}
        >
          <View style={styles.modalContent}>
            <View style={styles.dragHandle} />
            <Text style={styles.modalTitle}>{t('coverage_title')}</Text>
            <Text style={styles.modalSubtitle}>{t('coverage_subtitle')}</Text>

            {/* Category Rows */}
            {[
              { key: 'electricity', label: t('cat_electricity'), icon: '⚡', data: categories.electricity },
              { key: 'cooking', label: t('cat_cooking'), icon: '🍳', data: categories.cooking },
              { key: 'transport', label: t('cat_travel'), icon: '🚗', data: categories.transport },
            ].map((item) => {
              const badge = getStatusBadge(item.data);
              return (
                <View key={item.key} style={styles.categoryRow}>
                  <View style={styles.categoryInfo}>
                    <Text style={styles.catLabel}>{item.icon} {item.label}</Text>
                    <Text style={styles.catKg}>
                      {item.data.kg !== null ? `${item.data.kg} kg CO₂/mo` : t('unavailable')}
                    </Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: badge.bg }]}>
                    <Text style={[styles.statusText, { color: badge.color }]}>{badge.text}</Text>
                  </View>
                </View>
              );
            })}

            <TouchableOpacity
              style={styles.closeBtn}
              onPress={() => setSheetVisible(false)}
            >
              <Text style={styles.closeBtnText}>Done</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  floatingChip: {
    alignSelf: 'center',
    marginVertical: 4,
    zIndex: 10,
  },
  chipTouchable: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 3,
  },
  chipValue: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.primaryDark,
    letterSpacing: 0.2,
  },
  partialBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    marginLeft: 8,
  },
  partialText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#D97706',
  },
  infoIcon: {
    fontSize: 10,
    color: '#D97706',
    marginLeft: 3,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 36,
  },
  dragHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  modalSubtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginBottom: 20,
    marginTop: 4,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  categoryInfo: {
    flex: 1,
  },
  catLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  catKg: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
  },
  closeBtn: {
    marginTop: 24,
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  closeBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
  },
});
