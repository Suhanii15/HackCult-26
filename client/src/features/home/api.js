import { apiGetMe, apiGetFootprintHistory } from '../../services/api';

export const fetchHomeDashboard = async (currentUser) => {
  try {
    const meData = await apiGetMe().catch(() => null);
    const historyData = await apiGetFootprintHistory().catch(() => null);

    const user = meData?.user || currentUser || {
      fullName: 'Priya Patel',
      district: 'Ahmedabad',
      totalPoints: 120,
    };

    const latestBaseline = historyData?.history?.[0] || null;

    return {
      user,
      streakDays: 4,
      targetDays: 7,
      totalPoints: user.totalPoints || 120,
      monthlyCO2Kg: latestBaseline?.totalMonthlyCO2Kg || 106.5,
      completedToday: false,
    };
  } catch (error) {
    // Offline / fallback demo data
    return {
      user: currentUser || {
        fullName: 'Priya Patel',
        district: 'Ahmedabad',
        totalPoints: 120,
      },
      streakDays: 4,
      targetDays: 7,
      totalPoints: currentUser?.totalPoints || 120,
      monthlyCO2Kg: 106.5,
      completedToday: false,
    };
  }
};
