import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  PanResponder,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { Card } from '../../../components/ui';
import { COLORS, RADII, SPACING, TYPOGRAPHY } from '../../../theme';
import {
  TrashIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from '../../solar/components/SolarIcons';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SWIPE_THRESHOLD = 120;

export default function SwipeableNotificationItem({
  item,
  onDelete,
  onPress,
  icon,
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const translateX = useRef(new Animated.Value(0)).current;

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => {
        // Only capture horizontal swipes moving right
        return gestureState.dx > 12 && Math.abs(gestureState.dy) < 10;
      },
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dx > 0) {
          translateX.setValue(gestureState.dx);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dx > SWIPE_THRESHOLD) {
          // Swipe right to delete animation
          Animated.timing(translateX, {
            toValue: SCREEN_WIDTH,
            duration: 200,
            useNativeDriver: true,
          }).start(() => {
            onDelete(item);
          });
        } else {
          // Snap back
          Animated.spring(translateX, {
            toValue: 0,
            bounciness: 6,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  // Opacity of the underlying delete background as user drags
  const deleteBgOpacity = translateX.interpolate({
    inputRange: [0, 40, SWIPE_THRESHOLD],
    outputRange: [0, 0.6, 1],
    extrapolate: 'clamp',
  });

  return (
    <View style={styles.container}>
      {/* Background Revealed on Swipe Right */}
      <Animated.View style={[styles.deleteBackground, { opacity: deleteBgOpacity }]}>
        <View style={styles.deleteContent}>
          <TrashIcon size={18} color="#DC2626" />
          <Text style={styles.deleteText}>Delete</Text>
        </View>
      </Animated.View>

      {/* Foreground Notification Card */}
      <Animated.View
        style={[styles.cardWrapper, { transform: [{ translateX }] }]}
        {...panResponder.panHandlers}
      >
        <TouchableOpacity onPress={onPress} activeOpacity={0.85}>
          <Card
            elevation="subtle"
            style={[
              styles.notificationCard,
              !item.read && styles.notificationCardUnread,
            ]}
          >
            <View style={styles.notifRow}>
              {icon}

              <View style={styles.notifBodyCol}>
                <View style={styles.notifTitleRow}>
                  <View style={styles.titleWithDot}>
                    <Text
                      style={[styles.notifTitle, !item.read && styles.notifTitleUnread]}
                      numberOfLines={1}
                    >
                      {item.title}
                    </Text>
                    {!item.read && <View style={styles.unreadDot} />}
                  </View>

                  {/* Expand / Minimize chevron button */}
                  <TouchableOpacity
                    onPress={() => setIsExpanded(!isExpanded)}
                    style={styles.expandToggleBtn}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    activeOpacity={0.7}
                    accessibilityLabel={isExpanded ? 'Minimize message' : 'Expand message'}
                  >
                    {isExpanded ? (
                      <ChevronUpIcon size={14} color={COLORS.primaryDark} />
                    ) : (
                      <ChevronDownIcon size={14} color={COLORS.textSecondary} />
                    )}
                  </TouchableOpacity>
                </View>

                {/* Limit to 2 lines and clip after that unless expanded */}
                <Text
                  style={styles.notifMessage}
                  numberOfLines={isExpanded ? undefined : 2}
                  ellipsizeMode="tail"
                >
                  {item.body}
                </Text>

                <Text style={styles.notifTime}>{item.time}</Text>
              </View>
            </View>
          </Card>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 3, // Ultra-compact gap bringing tiles directly close together
    position: 'relative',
  },
  deleteBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#FEE2E2',
    borderRadius: 14,
    justifyContent: 'center',
    paddingLeft: SPACING.lg,
  },
  deleteContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  deleteText: {
    ...TYPOGRAPHY.subtext,
    color: '#DC2626',
    fontWeight: '700',
  },
  cardWrapper: {
    backgroundColor: 'transparent',
  },
  notificationCard: {
    backgroundColor: COLORS.white,
    borderRadius: 14,
    paddingVertical: 7,
    paddingHorizontal: 11,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.04)',
  },
  notificationCardUnread: {
    borderColor: 'rgba(0, 137, 123, 0.25)',
    backgroundColor: '#FBFEFE',
  },
  notifRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  notifBodyCol: {
    flex: 1,
  },
  notifTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  titleWithDot: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 6,
  },
  notifTitle: {
    fontSize: 13.5,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  notifTitleUnread: {
    fontWeight: '700',
    color: COLORS.primaryDark,
  },
  unreadDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.primary,
    marginLeft: 6,
  },
  expandToggleBtn: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  notifMessage: {
    fontSize: 12,
    color: COLORS.textSecondary,
    lineHeight: 16,
    marginBottom: 2,
  },
  notifTime: {
    fontSize: 10,
    color: COLORS.textMuted,
  },
});
