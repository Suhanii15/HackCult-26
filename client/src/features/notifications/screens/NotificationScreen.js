import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { Card, Button, EmptyState } from '../../../components/ui';
import { COLORS, RADII, SPACING, TYPOGRAPHY } from '../../../theme';
import { useLanguage } from '../../../i18n/LanguageContext';
import {
  getDefaultNotifications,
  triggerDeviceNotification,
  scheduleDailyWelcomeNotification,
} from '../../../services/notificationService';
import {
  ArrowLeftIcon,
  BellIcon,
  ZapIcon,
  SunIcon,
  LeafIcon,
  CheckCircleIcon,
} from '../../solar/components/SolarIcons';
import SwipeableNotificationItem from '../components/SwipeableNotificationItem';

export default function NotificationScreen({ navigation, user }) {
  const { t } = useLanguage();
  const rawName = user?.fullName || user?.name || 'Citizen';
  const firstName = rawName.split(' ')[0] || 'Friend';

  const [notifications, setNotifications] = useState([]);
  const [undoToast, setUndoToast] = useState(null); // { item, index }

  const toastFadeAnim = useRef(new Animated.Value(0)).current;
  const undoTimerRef = useRef(null);

  useEffect(() => {
    setNotifications(getDefaultNotifications(firstName));
    scheduleDailyWelcomeNotification(firstName);
  }, [firstName]);

  const handleMarkAsRead = (id) => {
    setNotifications((prev) =>
      prev.map((item) => (item.id === id ? { ...item, read: true } : item))
    );
  };

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((item) => ({ ...item, read: true })));
  };

  // Swipe right to delete with 2-second undo alert
  const handleDeleteItem = (itemToDelete) => {
    const deletedIndex = notifications.findIndex((n) => n.id === itemToDelete.id);
    if (deletedIndex === -1) return;

    // Remove from current list
    setNotifications((prev) => prev.filter((n) => n.id !== itemToDelete.id));

    // Clear any previous timer
    if (undoTimerRef.current) {
      clearTimeout(undoTimerRef.current);
    }

    // Show undo toast
    setUndoToast({ item: itemToDelete, index: deletedIndex });
    toastFadeAnim.setValue(0);
    Animated.timing(toastFadeAnim, {
      toValue: 1,
      duration: 150,
      useNativeDriver: true,
    }).start();

    // Exactly 2-second timeout to dismiss undo alert
    undoTimerRef.current = setTimeout(() => {
      Animated.timing(toastFadeAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }).start(() => {
        setUndoToast(null);
      });
    }, 2000);
  };

  // Undo delete action
  const handleUndoDelete = () => {
    if (!undoToast) return;
    if (undoTimerRef.current) {
      clearTimeout(undoTimerRef.current);
    }

    const { item, index } = undoToast;
    setNotifications((prev) => {
      const copy = [...prev];
      copy.splice(index, 0, item);
      return copy;
    });

    Animated.timing(toastFadeAnim, {
      toValue: 0,
      duration: 120,
      useNativeDriver: true,
    }).start(() => {
      setUndoToast(null);
    });
  };

  // Trigger test device notification with sound/beep
  const handleSendTestNotification = async () => {
    const newNotif = {
      id: `test_${Date.now()}`,
      type: 'alert',
      title: 'Mission LiFE Grid Alert',
      body: 'Peak power hours are active. Switch off heavy appliances to conserve energy!',
      time: 'Just now',
      read: false,
      priority: 'high',
    };

    setNotifications((prev) => [newNotif, ...prev]);

    await triggerDeviceNotification({
      title: 'Mission LiFE Grid Alert ⚡',
      body: 'Peak power hours are active. Switch off heavy appliances to conserve energy!',
      sound: true,
    });
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  const renderNotificationIcon = (type) => {
    if (type === 'alert') {
      return (
        <View style={[styles.iconCircle, { backgroundColor: COLORS.warningBg }]}>
          <ZapIcon size={18} color={COLORS.warning} />
        </View>
      );
    }
    if (type === 'solar') {
      return (
        <View style={[styles.iconCircle, { backgroundColor: COLORS.energyBg }]}>
          <SunIcon size={18} color={COLORS.energy} />
        </View>
      );
    }
    return (
      <View style={[styles.iconCircle, { backgroundColor: COLORS.primaryLight }]}>
        <LeafIcon size={18} color={COLORS.primaryDark} />
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header Bar */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <ArrowLeftIcon size={18} color={COLORS.textPrimary} />
        </TouchableOpacity>

        <View style={styles.headerTitleCol}>
          <Text style={styles.headerTitle}>{t('notifications_title') || 'Notifications'}</Text>
          {unreadCount > 0 ? (
            <Text style={styles.unreadSubtitle}>{unreadCount} unread alert{unreadCount > 1 ? 's' : ''}</Text>
          ) : (
            <Text style={styles.swipeHintSubtitle}>Swipe right to delete</Text>
          )}
        </View>

        <View style={styles.headerActions}>
          {unreadCount > 0 && (
            <TouchableOpacity
              onPress={handleMarkAllRead}
              style={styles.headerActionBtn}
              activeOpacity={0.7}
              accessibilityLabel="Mark all read"
            >
              <CheckCircleIcon size={18} color={COLORS.primary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Unified Notifications List */}
      {notifications.length === 0 ? (
        <EmptyState
          icon={<BellIcon size={32} color={COLORS.textSecondary} />}
          title={t('notifications_empty_title') || 'All Caught Up!'}
          message={t('notifications_empty_msg') || 'You have no notifications. Important alerts will appear here.'}
          actionLabel={t('notifications_test_btn') || 'Send Test Phone Beep Alert'}
          onAction={handleSendTestNotification}
        />
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListFooterComponent={() => (
            <View style={styles.testBtnContainer}>
              <Button
                title={t('notifications_test_btn') || 'Test Phone Beep Alert'}
                variant="outline"
                size="sm"
                onPress={handleSendTestNotification}
                style={styles.testBtn}
              />
            </View>
          )}
          renderItem={({ item }) => (
            <SwipeableNotificationItem
              item={item}
              onPress={() => handleMarkAsRead(item.id)}
              onDelete={handleDeleteItem}
              icon={renderNotificationIcon(item.type)}
            />
          )}
        />
      )}

      {/* 2-Second Floating Alert with Undo Button */}
      {undoToast && (
        <Animated.View style={[styles.undoToastContainer, { opacity: toastFadeAnim }]}>
          <View style={styles.undoToastInner}>
            <Text style={styles.undoToastText} numberOfLines={1}>
              Notification deleted
            </Text>
            <TouchableOpacity
              onPress={handleUndoDelete}
              style={styles.undoBtn}
              activeOpacity={0.8}
            >
              <Text style={styles.undoBtnText}>UNDO</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#B2DFDB', // Full brand green background
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.md,
    zIndex: 1,
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: RADII.full,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  headerTitleCol: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  headerTitle: {
    ...TYPOGRAPHY.h2,
    color: COLORS.textPrimary,
  },
  unreadSubtitle: {
    ...TYPOGRAPHY.caption,
    color: COLORS.primaryDark,
    fontWeight: '700',
  },
  swipeHintSubtitle: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerActionBtn: {
    width: 36,
    height: 36,
    borderRadius: RADII.full,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContent: {
    paddingHorizontal: 10,
    paddingTop: 2,
    paddingBottom: 80,
  },
  iconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  testBtnContainer: {
    paddingVertical: SPACING.md,
    alignItems: 'center',
  },
  testBtn: {
    paddingHorizontal: SPACING.lg,
  },
  undoToastContainer: {
    position: 'absolute',
    bottom: 24,
    left: SPACING.md,
    right: SPACING.md,
    zIndex: 999,
  },
  undoToastInner: {
    backgroundColor: '#1F2937',
    borderRadius: RADII.lg,
    paddingVertical: 12,
    paddingHorizontal: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
  },
  undoToastText: {
    ...TYPOGRAPHY.body,
    color: '#F9FAFB',
    fontSize: 14,
    flex: 1,
  },
  undoBtn: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    marginLeft: SPACING.sm,
  },
  undoBtnText: {
    color: COLORS.accent,
    fontWeight: '800',
    fontSize: 14,
    letterSpacing: 0.5,
  },
});
