import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Platform,
} from 'react-native';
import { COLORS } from '../theme';
import {
  HomeIcon,
  CommunityIcon,
  ActivitiesIcon,
  SolarIcon,
} from './TabIcons';

const ICON_MAP = {
  Home: HomeIcon,
  Community: CommunityIcon,
  Activities: ActivitiesIcon,
  Solar: SolarIcon,
};

function TabButton({
  route,
  index,
  isFocused,
  label,
  onPress,
  onLongPress,
}) {
  const scaleAnim = useRef(new Animated.Value(isFocused ? 1.08 : 1.0)).current;
  const pillOpacity = useRef(new Animated.Value(isFocused ? 1 : 0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: isFocused ? 1.08 : 1.0,
        friction: 5,
        tension: 90,
        useNativeDriver: true,
      }),
      Animated.timing(pillOpacity, {
        toValue: isFocused ? 1 : 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  }, [isFocused]);

  const handlePress = () => {
    // Pop enlarge spring animation on click
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1.24,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1.08,
        friction: 4,
        tension: 110,
        useNativeDriver: true,
      }),
    ]).start();

    onPress();
  };

  const IconComponent = ICON_MAP[route.name] || HomeIcon;
  const activeColor = COLORS.primary; // Brand teal #00897B
  const inactiveColor = '#64748B'; // Muted slate

  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityState={isFocused ? { selected: true } : {}}
      accessibilityLabel={label}
      onPress={handlePress}
      onLongPress={onLongPress}
      activeOpacity={0.8}
      style={styles.tabItem}
    >
      <Animated.View
        style={[
          styles.tabContent,
          {
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        {/* Active Soft Glass Indicator Pill */}
        <Animated.View
          style={[
            styles.activePillBackground,
            {
              opacity: pillOpacity,
            },
          ]}
        />

        {/* Icon */}
        <IconComponent
          color={isFocused ? activeColor : inactiveColor}
          size={isFocused ? 22 : 20}
        />

        {/* Label */}
        <Text
          style={[
            styles.tabLabel,
            {
              color: isFocused ? activeColor : inactiveColor,
              fontWeight: isFocused ? '800' : '600',
            },
          ]}
          numberOfLines={1}
        >
          {label}
        </Text>
      </Animated.View>
    </TouchableOpacity>
  );
}

export default function GlassEllipseTabBar({
  state,
  descriptors,
  navigation,
}) {
  return (
    <View style={styles.floatingContainer}>
      <View style={styles.glassBar}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const label =
            options.tabBarLabel !== undefined
              ? options.tabBarLabel
              : options.title !== undefined
              ? options.title
              : route.name;

          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          const onLongPress = () => {
            navigation.emit({
              type: 'tabLongPress',
              target: route.key,
            });
          };

          return (
            <TabButton
              key={route.key}
              route={route}
              index={index}
              isFocused={isFocused}
              label={label}
              onPress={onPress}
              onLongPress={onLongPress}
            />
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  floatingContainer: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 24 : 14,
    left: 18,
    right: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glassBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    width: '100%',
    height: 66,
    borderRadius: 36, // Ellipse capsule shape
    backgroundColor: 'rgba(255, 255, 255, 0.92)', // Glass effect
    borderWidth: 1.5,
    borderColor: 'rgba(224, 242, 241, 0.95)', // Brand mint glass border
    paddingHorizontal: 8,
    // Subtle teal-tinted elevation shadow
    shadowColor: '#004D40',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
  },
  tabContent: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    minWidth: 60,
  },
  activePillBackground: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    borderRadius: 20,
    backgroundColor: '#E0F2F1', // Brand mint tint
  },
  tabLabel: {
    fontSize: 10,
    marginTop: 2,
    letterSpacing: 0.1,
  },
});
