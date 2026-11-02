import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import SplashScreen from './src/screens/SplashScreen';
import WelcomeScreen from './src/screens/WelcomeScreen';
import AuthScreen from './src/screens/AuthScreen';
import OnboardingScreen from './src/screens/OnboardingScreen';
import LeaderboardScreen from './src/screens/LeaderboardScreen';
import { LanguageProvider, useLanguage } from './src/i18n/LanguageContext';
import LanguageModal from './src/components/LanguageModal';

function MainApp() {
  // PREVIEW: set to 'leaderboard' to preview; change back to 'splash' for normal flow
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
    setCurrentScreen('onboarding');
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
        />
      )}

      {currentScreen === 'leaderboard' && (
        <LeaderboardScreen
          onBack={() => setCurrentScreen('welcome')}
        />
      )}

      {/* Global Language Modal Popup accessible from anywhere */}
      <LanguageModal />
    </View>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <MainApp />
    </LanguageProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
});
