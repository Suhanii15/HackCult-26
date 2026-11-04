import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Set notification handler to play sound, beep, and display alert even if the app is currently in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export const DAILY_SUSTAINABILITY_QUOTES = [
  "The Earth provides enough to satisfy every man's needs, but not every man's greed. — Mahatma Gandhi",
  "Small daily habits create enduring planetary change. Switch off unused appliances today!",
  "Optimize cooling at 24°C: saves 6% electricity per degree while maintaining perfect comfort.",
  "Walking or cycling for short trips under 2 km prevents up to 1.2 kg of CO₂ emissions.",
  "Turn off the tap while brushing to save up to 12 litres of clean water every morning.",
  "Every unit of electricity saved in Gujarat prevents 0.71 kg of CO₂ from entering our atmosphere.",
  "Rooftop solar empowers your home to generate clean energy and claim PM Surya Ghar subsidy.",
];

export function getTodayQuote() {
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24
  );
  return DAILY_SUSTAINABILITY_QUOTES[dayOfYear % DAILY_SUSTAINABILITY_QUOTES.length];
}

/**
 * Request notification permissions on device.
 */
export async function requestNotificationPermissions() {
  if (Platform.OS === 'web') return true;

  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    return finalStatus === 'granted';
  } catch (err) {
    console.warn('Error requesting notification permissions:', err);
    return false;
  }
}

/**
 * Trigger an immediate local phone notification with sound and vibration.
 */
export async function triggerDeviceNotification({ title, body, sound = true, data = {} }) {
  if (Platform.OS === 'web') return null;

  try {
    const hasPermission = await requestNotificationPermissions();
    if (!hasPermission) {
      console.warn('Notification permission not granted.');
    }

    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        sound: sound ? 'default' : undefined,
        data,
      },
      trigger: null, // immediate
    });

    return id;
  } catch (err) {
    console.warn('Failed to trigger device notification:', err);
    return null;
  }
}

/**
 * Schedule recurring daily welcome notification at 9:00 AM with today's quote.
 */
export async function scheduleDailyWelcomeNotification(userName = 'Citizen') {
  if (Platform.OS === 'web') return;

  try {
    const hasPermission = await requestNotificationPermissions();
    if (!hasPermission) return;

    const quote = getTodayQuote();

    await Notifications.scheduleNotificationAsync({
      content: {
        title: `Welcome, ${userName}! 🌿`,
        body: quote,
        sound: 'default',
        data: { type: 'daily_welcome' },
      },
      trigger: {
        hour: 9,
        minute: 0,
        repeats: true,
      },
    });
  } catch (err) {
    console.warn('Failed to schedule daily welcome notification:', err);
  }
}

/**
 * Default notification items displayed on the Notifications Screen.
 */
export function getDefaultNotifications(userName = 'Citizen') {
  return [
    {
      id: 'notif_peak_hours',
      type: 'alert',
      title: 'Peak Grid Hours Approaching',
      body: 'Peak power demand occurs between 6:00 PM – 9:00 PM. Shift washing machine and heavy appliance use to off-peak hours.',
      time: '2 hours ago',
      read: false,
      priority: 'high',
    },
    {
      id: 'notif_solar_subsidy',
      type: 'solar',
      title: 'PM Surya Ghar: Up to ₹78,000 Subsidy',
      body: 'Residential rooftop solar installations in Gujarat qualify for central subsidy plus net-metering benefits.',
      time: 'Yesterday',
      read: false,
      priority: 'medium',
    },
    {
      id: 'notif_habit_streak',
      type: 'activity',
      title: 'Maintain Your Mission LiFE Streak',
      body: 'Complete your daily eco-check-ins today to increase your EcoScore and earn Green Points.',
      time: '2 days ago',
      read: true,
      priority: 'normal',
    },
  ];
}
