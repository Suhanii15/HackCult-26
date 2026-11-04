import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  SafeAreaView,
  StatusBar,
  Platform,
} from 'react-native';
import { COLORS } from '../theme';
import { apiGetLeaderboard } from '../services/api';
import { MICROCOPY } from '../constants/microcopy';

import { tr, useLanguage } from '../i18n/LanguageContext';
// ─── Constants ──────────────────────────────────────────────────────────────

const SCOPES = [
  { key: 'area', label: '📍 My Area' },
  { key: 'district', label: '🏙️ District' },
  { key: 'state', label: '🗺️ State' },
];

const METRICS = [
  { key: 'green', label: '🌿 GreenPoints', unit: 'pts', color: COLORS.primary, desc: 'Green Ws' },
  { key: 'eco', label: '⚡ EcoScore', unit: '/100', color: '#7C3AED', desc: 'Planet Rating' },
  { key: 'carbon', label: '🌱 CO₂ Avoided', unit: 't CO₂/yr', color: '#059669', desc: 'Carbon Flex' },
];

const AVATAR_COLORS = [
  '#00897B', '#7C3AED', '#EA580C', '#0284C7', '#DB2777',
  '#059669', '#D97706', '#9333EA', '#0891B2', '#65A30D',
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getInitials(name = '') {
  const parts = name.trim().split(' ');
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return (parts[0] || '?')[0].toUpperCase();
}

function getAvatarColor(name = '') {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function formatScore(value, metric) {
  if (value == null) return '—';
  if (metric === 'carbon') {
    const tonnes = (value / 1000).toFixed(1);
    return tonnes;
  }
  if (metric === 'eco') return Math.round(value).toString();
  return Math.round(value).toLocaleString();
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function Avatar({ name, size = 44, fontSize = 16 }) {
  const color = getAvatarColor(name);
  const initials = getInitials(name);
  return (
    <View style={[styles.avatar, { width: size, height: size, borderRadius: size / 2, backgroundColor: color }]}>
      <Text style={[styles.avatarText, { fontSize }]}>{initials}</Text>
    </View>
  );
}

function PodiumCard({ user, rank, metric, isCurrentUser }) {
  if (!user) return <View style={[styles.podiumSlot, { opacity: 0 }]} />;

  const heights = { 1: 100, 2: 72, 3: 50 };
  const avatarSizes = { 1: 56, 2: 48, 3: 44 };
  const medals = { 1: '👑', 2: '🥈', 3: '🥉' };
  const metricInfo = METRICS.find(m => m.key === metric);
  const isCenter = rank === 1;

  return (
    <View style={[styles.podiumSlot, isCenter && styles.podiumSlotCenter]}>
      {/* Medal icon */}
      <Text style={styles.podiumMedal}>{medals[rank]}</Text>

      {/* Avatar with crown/rank ring */}
      <View style={[styles.podiumAvatarWrap, isCenter && styles.podiumAvatarWrapCenter]}>
        <Avatar name={user.fullName} size={avatarSizes[rank]} fontSize={rank === 1 ? 20 : 16} />
        {user.streakDays >= 3 && (
          <View style={styles.streakBadge}>
            <Text style={styles.streakBadgeText}>🔥{user.streakDays}</Text>
          </View>
        )}
      </View>

      {/* User Name */}
      <Text style={[styles.podiumName, isCurrentUser && styles.podiumNameCurrent]} numberOfLines={1}>
        {isCurrentUser ? 'You' : user.fullName.split(' ')[0]}
      </Text>

      {/* Score */}
      <Text style={[styles.podiumScore, { color: metricInfo.color }]}>
        {formatScore(user.score, metric)}
        <Text style={styles.podiumUnit}> {metricInfo.unit}</Text>
      </Text>

      {/* Step block */}
      <View style={[styles.podiumBlock, { height: heights[rank], backgroundColor: isCenter ? metricInfo.color : '#E2E8F0' }]}>
        <Text style={[styles.podiumRankNum, { color: isCenter ? '#fff' : '#64748B' }]}>#{rank}</Text>
      </View>
    </View>
  );
}

function RankRow({ user, rank, metric, isCurrentUser }) {
  const metricInfo = METRICS.find(m => m.key === metric);

  return (
    <View style={[styles.rankRow, isCurrentUser && styles.rankRowCurrent]}>
      <Text style={[styles.rankNum, isCurrentUser && styles.rankNumCurrent]}>#{rank}</Text>
      <Avatar name={user.fullName} size={38} fontSize={14} />
      <View style={styles.rankInfo}>
        <View style={styles.rankNameRow}>
          <Text style={[styles.rankName, isCurrentUser && styles.rankNameCurrent]} numberOfLines={1}>
            {user.fullName}
          </Text>
          {isCurrentUser && (
            <View style={styles.youBadge}>
              <Text style={styles.youBadgeText}>{tr('YOU')}</Text>
            </View>
          )}
        </View>
        <Text style={styles.rankLocation}>
          {user.city ? `${user.city}, ` : ''}{user.district}
        </Text>
      </View>
      {user.streakDays >= 3 && (
        <View style={styles.rowStreak}>
          <Text style={styles.rowStreakText}>🔥{user.streakDays}d</Text>
        </View>
      )}
      <View style={styles.rankScoreWrap}>
        <Text style={[styles.rankScore, { color: metricInfo.color }]}>
          {formatScore(user.score, metric)}
        </Text>
        <Text style={styles.rankUnit}>{metricInfo.unit}</Text>
      </View>
    </View>
  );
}

// ─── Main Screen Component ────────────────────────────────────────────────────

export default function LeaderboardScreen({ onBack, user: propUser }) {
  useLanguage();
  const [scope, setScope] = useState('district');
  const [metric, setMetric] = useState('green');
  const [leaderboardData, setLeaderboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const fetchLeaderboard = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const res = await apiGetLeaderboard({ scope, metric });
      if (res && res.success) {
        setLeaderboardData(res.data);
      } else {
        setError(res?.message || 'Could not load leaderboard.');
      }
    } catch (err) {
      setError(err?.message || 'Failed to connect. Please check your network.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [scope, metric]);

  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  const metricInfo = METRICS.find(m => m.key === metric);
  const rankings = leaderboardData?.rankings || [];
  const top3 = rankings.slice(0, 3);
  const rest = rankings.slice(3);
  const currentUser = leaderboardData?.currentUser;

  // Podium order: [2nd, 1st, 3rd]
  const podiumOrder = [top3[1] || null, top3[0] || null, top3[2] || null];

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#064E3B" />

      {/* ── Top Header ── */}
      <View style={styles.header}>
        {onBack && (
          <TouchableOpacity style={styles.backBtn} onPress={onBack} activeOpacity={0.7} accessibilityLabel="Back">
            <Text style={styles.backBtnText}>‹</Text>
          </TouchableOpacity>
        )}
        <View style={styles.headerTitleWrap}>
          <Text style={styles.headerTitle}>{MICROCOPY.leaderboard.title}</Text>
          <Text style={styles.headerSub}>{MICROCOPY.leaderboard.subtitle}</Text>
        </View>
      </View>

      {/* ── Scope Selector (Area / District / State) ── */}
      <View style={styles.scopeBar}>
        {SCOPES.map(s => (
          <TouchableOpacity
            key={s.key}
            style={[styles.scopePill, scope === s.key && styles.scopePillActive]}
            onPress={() => setScope(s.key)}
            activeOpacity={0.8}
          >
            <Text style={[styles.scopePillText, scope === s.key && styles.scopePillTextActive]}>
              {s.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* ── Metric Tabs (GreenPoints / EcoScore / CO2 Avoided) ── */}
      <View style={styles.metricBar}>
        {METRICS.map(m => (
          <TouchableOpacity
            key={m.key}
            style={[styles.metricTab, metric === m.key && { borderBottomColor: m.color, borderBottomWidth: 3 }]}
            onPress={() => setMetric(m.key)}
            activeOpacity={0.8}
          >
            <Text style={[styles.metricTabText, metric === m.key && { color: m.color, fontWeight: '800' }]}>
              {m.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* ── Body ── */}
      {loading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color={metricInfo.color} />
          <Text style={styles.loadingText}>{tr('Calculating green rankings…')}</Text>
        </View>
      ) : error ? (
        <View style={styles.errorWrap}>
          <Text style={styles.errorEmoji}>🌱</Text>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={() => fetchLeaderboard()}>
            <Text style={styles.retryBtnText}>{tr('Retry ➔')}</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          style={styles.body}
          contentContainerStyle={styles.bodyContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => fetchLeaderboard(true)}
              colors={[metricInfo.color]}
              tintColor={metricInfo.color}
            />
          }
        >
          {/* Scope label */}
          <Text style={styles.scopeLabel}>
            {MICROCOPY.leaderboard.hallOfFame} • <Text style={{ color: metricInfo.color, fontWeight: '800' }}>{SCOPES.find(s => s.key === scope)?.label.replace(/[^a-zA-Z ]/g, '').trim()}</Text>
            {' · '}{metricInfo.desc}
          </Text>

          {/* ── Podium ── */}
          {top3.length > 0 ? (
            <View style={styles.podiumWrap}>
              <PodiumCard user={podiumOrder[0]} rank={2} metric={metric} isCurrentUser={podiumOrder[0]?._id === currentUser?._id} />
              <PodiumCard user={podiumOrder[1]} rank={1} metric={metric} isCurrentUser={podiumOrder[1]?._id === currentUser?._id} />
              <PodiumCard user={podiumOrder[2]} rank={3} metric={metric} isCurrentUser={podiumOrder[2]?._id === currentUser?._id} />
            </View>
          ) : (
            <View style={styles.emptyWrap}>
              <Text style={styles.emptyEmoji}>🌱</Text>
              <Text style={styles.emptyTitle}>{MICROCOPY.leaderboard.empty.title}</Text>
              <Text style={styles.emptyText}>{MICROCOPY.leaderboard.empty.subtitle}</Text>
            </View>
          )}

          {/* ── Ranks 4–10 ── */}
          {rest.length > 0 && (
            <View style={styles.rankListWrap}>
              <Text style={styles.rankListTitle}>{tr('Climbing the Green Ladder 🚀')}</Text>
              {rest.map((u, i) => (
                <RankRow
                  key={u._id || i}
                  user={u}
                  rank={i + 4}
                  metric={metric}
                  isCurrentUser={u._id === currentUser?._id}
                />
              ))}
            </View>
          )}

          <View style={{ height: 100 }} />
        </ScrollView>
      )}

      {/* ── Persistent "Your Standing" Footer Bar ── */}
      {!loading && !error && currentUser && (
        <View style={styles.myStandingBar}>
          <View style={styles.myStandingLeft}>
            <Avatar name={currentUser.fullName} size={40} fontSize={15} />
            <View style={styles.myStandingInfo}>
              <Text style={styles.myStandingName}>{tr('Your rank, your flex')}</Text>
              {currentUser.gapToNextRank > 0 ? (
                <Text style={styles.myStandingGap}>
                  🚀 <Text style={{ color: metricInfo.color, fontWeight: '800' }}>
                    {metric === 'carbon' ? (currentUser.gapToNextRank / 1000).toFixed(1) + 't' : currentUser.gapToNextRank + ' pts'}
                  </Text> to pass #{currentUser.rank - 1}! Keep collecting green Ws!
                </Text>
              ) : (
                <Text style={styles.myStandingGap}>{tr('🥇 Certified eco legend! You\'re running the game.')}</Text>
              )}
            </View>
          </View>
          <View style={[styles.myRankBadge, { backgroundColor: metricInfo.color }]}>
            <Text style={styles.myRankText}>#{currentUser.rank}</Text>
          </View>
        </View>
      )}

      {/* Show "Not logged in" bar when no token */}
      {!loading && !error && !currentUser && (
        <View style={styles.guestBar}>
          <Text style={styles.guestBarText}>{tr('🔒 Log in to flex your green rank')}</Text>
        </View>
      )}
    </SafeAreaView>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAF9',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 0,
  },

  // Header
  header: {
    backgroundColor: '#064E3B', // Deep forest green
    paddingTop: 16,
    paddingBottom: 14,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backBtn: {
    marginRight: 12,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backBtnText: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '300',
    lineHeight: 30,
  },
  headerTitleWrap: { flex: 1 },
  headerTitle: {
    color: '#fff',
    fontSize: 21,
    fontWeight: '900',
    letterSpacing: -0.3,
  },
  headerSub: {
    color: '#A7F3D0',
    fontSize: 12.5,
    marginTop: 2,
    fontWeight: '600',
  },

  // Scope bar
  scopeBar: {
    flexDirection: 'row',
    backgroundColor: '#064E3B',
    paddingHorizontal: 16,
    paddingBottom: 14,
    gap: 8,
  },
  scopePill: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
  },
  scopePillActive: {
    backgroundColor: '#10B981',
  },
  scopePillText: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 12.5,
    fontWeight: '600',
  },
  scopePillTextActive: {
    color: '#fff',
    fontWeight: '800',
  },

  // Metric bar
  metricBar: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  metricTab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  metricTabText: {
    fontSize: 12.5,
    color: '#64748B',
    fontWeight: '600',
  },

  // Body
  body: { flex: 1 },
  bodyContent: { paddingHorizontal: 16, paddingTop: 14 },
  scopeLabel: {
    fontSize: 12.5,
    color: '#64748B',
    fontWeight: '600',
    marginBottom: 14,
    textAlign: 'center',
  },

  // Podium
  podiumWrap: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
    marginBottom: 20,
    paddingHorizontal: 8,
  },
  podiumSlot: {
    flex: 1,
    alignItems: 'center',
  },
  podiumSlotCenter: {
    zIndex: 2,
  },
  podiumMedal: {
    fontSize: 20,
    marginBottom: 2,
  },
  podiumAvatarWrap: {
    marginBottom: 6,
    position: 'relative',
  },
  podiumAvatarWrapCenter: {
    shadowColor: '#00897B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  streakBadge: {
    position: 'absolute',
    bottom: -2,
    right: -4,
    backgroundColor: '#FEF3C7',
    borderRadius: 8,
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderWidth: 1,
    borderColor: '#F59E0B',
  },
  streakBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#B45309',
  },
  podiumName: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 2,
    maxWidth: 88,
    textAlign: 'center',
  },
  podiumNameCurrent: {
    color: '#047857',
    fontWeight: '900',
  },
  podiumScore: {
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 8,
  },
  podiumUnit: {
    fontSize: 9.5,
    fontWeight: '500',
  },
  podiumBlock: {
    width: '92%',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 8,
  },
  podiumRankNum: {
    fontSize: 17,
    fontWeight: '900',
  },

  // Rank List
  rankListWrap: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  rankListTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#065F46',
    letterSpacing: 0.3,
    marginBottom: 10,
    paddingLeft: 4,
  },
  rankRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 10,
  },
  rankRowCurrent: {
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  rankNum: {
    fontSize: 13,
    fontWeight: '700',
    color: '#94A3B8',
    width: 32,
  },
  rankNumCurrent: {
    color: '#059669',
    fontWeight: '900',
  },
  rankInfo: {
    flex: 1,
    marginLeft: 10,
  },
  rankNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  rankName: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#1E293B',
    maxWidth: 150,
  },
  rankNameCurrent: {
    color: '#047857',
    fontWeight: '900',
  },
  youBadge: {
    backgroundColor: '#D1FAE5',
    borderRadius: 4,
    paddingHorizontal: 5,
    paddingVertical: 1,
  },
  youBadgeText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#065F46',
  },
  rankLocation: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 1,
  },
  rowStreak: {
    marginRight: 10,
  },
  rowStreakText: {
    fontSize: 11.5,
    color: '#D97706',
    fontWeight: '700',
  },
  rankScoreWrap: {
    alignItems: 'flex-end',
  },
  rankScore: {
    fontSize: 14,
    fontWeight: '800',
  },
  rankUnit: {
    fontSize: 10,
    color: '#94A3B8',
  },

  // Persistent Standing Bar
  myStandingBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderTopWidth: 1.5,
    borderTopColor: '#D1FAE5',
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 8,
  },
  myStandingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 10,
  },
  myStandingInfo: {
    flex: 1,
  },
  myStandingName: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
  },
  myStandingGap: {
    fontSize: 11.5,
    color: '#64748B',
    marginTop: 1,
  },
  myRankBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginLeft: 10,
  },
  myRankText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '900',
  },
  guestBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#F1F5F9',
    paddingVertical: 14,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  guestBarText: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '600',
  },

  // Loading & Error & Empty
  loadingWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 13.5,
    color: '#64748B',
    fontWeight: '600',
  },
  errorWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    gap: 10,
  },
  errorEmoji: { fontSize: 36 },
  errorText: {
    fontSize: 13.5,
    color: '#EF4444',
    textAlign: 'center',
    fontWeight: '600',
  },
  retryBtn: {
    backgroundColor: '#047857',
    paddingHorizontal: 18,
    paddingVertical: 9,
    borderRadius: 10,
    marginTop: 6,
  },
  retryBtnText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
  },
  emptyWrap: {
    alignItems: 'center',
    paddingVertical: 40,
    gap: 8,
  },
  emptyEmoji: { fontSize: 36 },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#064E3B',
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
  },

  // Avatar
  avatar: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#fff',
    fontWeight: '800',
  },
});
