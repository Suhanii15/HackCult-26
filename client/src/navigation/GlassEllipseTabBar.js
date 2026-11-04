import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
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
  isFocused,
  label,
  onPress,
  onLongPress,
}) {
  const scaleAnim = useRef(new Animated.Value(isFocused ? 1.06 : 1.0)).current;
  const pillOpacity = useRef(new Animated.Value(isFocused ? 1 : 0)).current;
  const pillScale = useRef(new Animated.Value(isFocused ? 1 : 0.9)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: isFocused ? 1.06 : 1.0,
        friction: 6,
        tension: 100,
        useNativeDriver: true,
      }),
      Animated.timing(pillOpacity, {
        toValue: isFocused ? 1 : 0,
        duration: 180,
        useNativeDriver: true,
      }),
      Animated.spring(pillScale, {
        toValue: isFocused ? 1 : 0.88,
        friction: 6,
        tension: 100,
        useNativeDriver: true,
      }),
    ]).start();
  }, [isFocused]);

  const IconComponent = ICON_MAP[route.name] || HomeIcon;
  const activeColor = COLORS.primaryDark || '#00695C';
  const inactiveColor = '#64748B'; // Muted slate

  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityState={isFocused ? { selected: true } : {}}
      accessibilityLabel={label}
      onPress={onPress}
      onLongPress={onLongPress}
      activeOpacity={0.75}
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
        {/* Subtle Mint Pill Background for Active Tab */}
        <Animated.View
          style={[
            styles.activePillBackground,
            {
              opacity: pillOpacity,
              transform: [{ scale: pillScale }],
            },
          ]}
        />

        {/* Compact Icon */}
        <IconComponent
          color={isFocused ? activeColor : inactiveColor}
          size={isFocused ? 20 : 18}
        />

        {/* Compact Label */}
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
  const insets = useSafeAreaInsets();
  const bottomInset = Math.max(insets.bottom, Platform.OS === 'ios' ? 14 : 8);

  // Check if current focused route specifies tabBarStyle display: 'none'
  const focusedRoute = state.routes[state.index];
  const focusedDescriptor = descriptors[focusedRoute.key];
  if (focusedDescriptor?.options?.tabBarStyle?.display === 'none') {
    return null;
  }

  return (
    <View style={[styles.floatingContainer, { bottom: bottomInset }]}>
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

            if (!event.defaultPrevented) {
              if (route.name === 'Activities') {
                // PART 4: Reset Activities to landing root page when switching or selecting
                navigation.navigate('Activities', {
                  screen: 'ActivityCategories',
                });
              } else if (route.name === 'Home') {
                navigation.navigate('Home');
              } else if (route.name === 'Community') {
                navigation.navigate('Community');
              } else if (route.name === 'Solar') {
                navigation.navigate('Solar');
              } else {
                navigation.navigate(route.name);
              }
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
    left: 20,
    right: 20,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 99,
  },
  glassBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    width: '100%',
    height: 54, // Reduced from 66 to 54 for a compact, modern profile
    borderRadius: 27,
    backgroundColor: 'rgba(255, 255, 255, 0.94)',
    borderWidth: 1.2,
    borderColor: 'rgba(204, 251, 241, 0.95)', // Mint border
    paddingHorizontal: 6,
    // Soft elevation shadow
    shadowColor: '#004D40',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.10,
    shadowRadius: 12,
    elevation: 6,
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
    paddingVertical: 3,
    paddingHorizontal: 10,
    minWidth: 54,
  },
  activePillBackground: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    borderRadius: 16,
    backgroundColor: '#E0F2F1', // Soft mint accent
  },
  tabLabel: {
    fontSize: 9.5,
    marginTop: 1.5,
    letterSpacing: 0.1,
  },
});
