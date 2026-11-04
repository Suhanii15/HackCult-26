import React, { useState } from 'react';
import { StyleSheet, View, StatusBar } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import SplashScreen from './src/screens/SplashScreen';
import WelcomeScreen from './src/screens/WelcomeScreen';
import AuthScreen from './src/screens/AuthScreen';
import OnboardingScreen from './src/screens/OnboardingScreen';
import { RootShell } from './src/navigation';
import LeaderboardScreen from './src/screens/LeaderboardScreen';
import { LanguageProvider, useLanguage } from './src/i18n/LanguageContext';
import LanguageModal from './src/components/LanguageModal';

function MainApp() {
  const [currentScreen, setCurrentScreen] = useState('splash');
  const [authMode, setAuthMode] = useState('signup');
  const [currentUser, setCurrentUser] = useState(null);
  const { openLanguageModal } = useLanguage();

  const handleSplashFinish = () => {
    setCurrentScreen('welcome');
    // Popup language modal immediately after splash screen
    openLanguageModal();
  };

  const handleNavigateToAuth = (mode) => {
    setAuthMode(mode);
    setCurrentScreen('auth');
  };

  const handleAuthSuccess = (userData) => {
    setCurrentUser(userData);
    if (userData?.hasCompletedOnboarding || userData?.onboardingCompleted) {
      setCurrentScreen('dashboard');
    } else {
      setCurrentScreen('onboarding');
    }
  };

  const handleOnboardingComplete = () => {
    setCurrentScreen('dashboard');
  };

  const handleBackToWelcome = () => {
    setCurrentScreen('welcome');
  };

  const handleRestartFlow = () => {
    setCurrentUser(null);
    setCurrentScreen('splash');
  };

  return (
    <View style={styles.container}>
      {currentScreen === 'splash' && (
        <SplashScreen onFinish={handleSplashFinish} />
      )}

      {currentScreen === 'welcome' && (
        <WelcomeScreen onNavigateToAuth={handleNavigateToAuth} />
      )}

      {currentScreen === 'auth' && (
        <AuthScreen
          initialMode={authMode}
          onAuthSuccess={handleAuthSuccess}
          onBack={handleBackToWelcome}
        />
      )}

      {currentScreen === 'onboarding' && (
        <OnboardingScreen
          user={currentUser}
          onRestart={handleRestartFlow}
          onComplete={handleOnboardingComplete}
        />
      )}

      {currentScreen === 'dashboard' && (
        <RootShell
          user={currentUser}
          onLogout={handleRestartFlow}
        />
      )}

      {currentScreen === 'leaderboard' && (
        <LeaderboardScreen
          onBack={() => setCurrentScreen('dashboard')}
        />
      )}

      {/* Global Language Modal Popup accessible from anywhere */}
      <LanguageModal />
    </View>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <LanguageProvider>
        <SafeAreaView
          style={styles.safeArea}
          edges={['top', 'bottom', 'left', 'right']}
        >
          <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
          <MainApp />
        </SafeAreaView>
      </LanguageProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
});
