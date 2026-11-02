import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { TopBar } from '../../../components/ui';
import { COLORS } from '../../../theme';
import { useHomeDashboard } from '../hooks';
import HabitProgressCard from '../components/HabitProgressCard';
import FootprintSummaryCard from '../components/FootprintSummaryCard';

export default function HomeScreen({ user }) {
  const navigation = useNavigation();
  const { data } = useHomeDashboard(user);

  const currentUser = data?.user || user;

  const handleOpenActivities = () => {
    navigation.navigate('Activities');
  };

  return (
    <View style={styles.container}>
      <TopBar isHome={true} user={currentUser} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <HabitProgressCard
          streakDays={data?.streakDays || 4}
          targetDays={data?.targetDays || 7}
          onExploreActivities={handleOpenActivities}
        />

        <FootprintSummaryCard monthlyCO2Kg={data?.monthlyCO2Kg || 106.5} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    paddingBottom: 32,
  },
});
