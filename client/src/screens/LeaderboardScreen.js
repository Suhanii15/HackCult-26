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

// ─── Constants ──────────────────────────────────────────────────────────────

const SCOPES = [
  { key: 'area', label: '📍 Area' },
  { key: 'district', label: '🏙️ District' },
  { key: 'state', label: '🗺️ State' },
];

const METRICS = [
  { key: 'green', label: '🌿 Green', unit: 'pts', color: COLORS.primary, desc: 'Green Score' },
  { key: 'eco', label: '⚡ Eco', unit: '/100', color: '#7C3AED', desc: 'Eco Rating' },
  { key: 'carbon', label: '📉 Carbon', unit: 't CO₂/yr', color: '#EA580C', desc: 'Carbon Score' },
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
      <Text style={styles.podiumMedal}>{medals[rank]}</Text>
      <View style={[
        styles.podiumAvatarWrap,
        isCenter && { borderWidth: 3, borderColor: '#FFD700', borderRadius: 999 },
        isCurrentUser && { borderWidth: 3, borderColor: COLORS.primary },
      ]}>
        <Avatar name={user.name} size={avatarSizes[rank]} fontSize={avatarSizes[rank] / 3} />
      </View>
      <Text style={styles.podiumName} numberOfLines={1}>{user.name?.split(' ')[0] || '—'}</Text>
      <View style={[styles.scorePill, { backgroundColor: metricInfo.color }]}>
        <Text style={styles.scorePillText}>
          {formatScore(user.score, metric)} <Text style={styles.scorePillUnit}>{metricInfo.unit}</Text>
        </Text>
      </View>
      <View style={[styles.podiumBase, { height: heights[rank], backgroundColor: isCenter ? '#FFD700' : rank === 2 ? '#C0C0C0' : '#CD7F32' }]}>
        <Text style={styles.podiumRankNum}>#{rank}</Text>
      </View>
    </View>
  );
}

function RankRow({ user, rank, metric, isCurrentUser }) {
  const metricInfo = METRICS.find(m => m.key === metric);
  return (
    <View style={[styles.rankRow, isCurrentUser && styles.rankRowHighlight]}>
      <View style={[styles.rankBadge, { backgroundColor: metricInfo.color }]}>
        <Text style={styles.rankBadgeText}>#{rank}</Text>
      </View>
      <Avatar name={user.name} size={40} fontSize={14} />
      <View style={styles.rankInfo}>
        <View style={styles.rankNameRow}>
          <Text style={styles.rankName} numberOfLines={1}>{user.name}</Text>
          {isCurrentUser && (
            <View style={styles.youBadge}>
              <Text style={styles.youBadgeText}>YOU</Text>
            </View>
          )}
        </View>
        <Text style={styles.rankSub}>
          {user.city || user.district || ''}
          {user.currentStreakDays ? `  🔥 ${user.currentStreakDays}d` : ''}
        </Text>
      </View>
      <View style={[styles.rankScorePill, { backgroundColor: metricInfo.color + '22' }]}>
        <Text style={[styles.rankScoreText, { color: metricInfo.color }]}>
          {formatScore(user.score, metric)}
        </Text>
        <Text style={[styles.rankScoreUnit, { color: metricInfo.color }]}>{metricInfo.unit}</Text>
      </View>
    </View>
  );
}

// ─── Main Screen ─────────────────────────────────────────────────────────────

export default function LeaderboardScreen({ onBack }) {
  const [scope, setScope] = useState('district');
  const [metric, setMetric] = useState('green');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const metricInfo = METRICS.find(m => m.key === metric);

  const fetchLeaderboard = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);
    try {
      const result = await apiGetLeaderboard({ scope, metric });
      setData(result);
    } catch (err) {
      setError(err.message || 'Could not load leaderboard');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [scope, metric]);

  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  const top3 = data?.top10?.slice(0, 3) || [];
  const rest = data?.top10?.slice(3) || [];
  const currentUser = data?.currentUser;

  const podiumOrder = [top3[1], top3[0], top3[2]]; // left=rank2, center=rank1, right=rank3

  // Height of the bottom bar so ScrollView can pad past it
  const BOTTOM_BAR_HEIGHT = 80 + (Platform.OS === 'android' ? 12 : 20);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primaryDark} />

      {/* ── Header ── */}
      <View style={styles.header}>
        {onBack && (
          <TouchableOpacity onPress={onBack} style={styles.backBtn}>
            <Text style={styles.backBtnText}>‹</Text>
          </TouchableOpacity>
        )}
        <View style={styles.headerTitleWrap}>
          <Text style={styles.headerTitle}>🏆 Leaderboard</Text>
          <Text style={styles.headerSub}>Mission LiFE Community</Text>
        </View>
      </View>

      {/* ── Scope Pills ── */}
      <View style={styles.scopeBar}>
        {SCOPES.map(s => (
          <TouchableOpacity
            key={s.key}
            style={[styles.scopePill, scope === s.key && styles.scopePillActive]}
            onPress={() => setScope(s.key)}
          >
            <Text style={[styles.scopePillText, scope === s.key && styles.scopePillTextActive]}>
              {s.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* ── Metric Tabs ── */}
      <View style={styles.metricBar}>
        {METRICS.map(m => (
          <TouchableOpacity
            key={m.key}
            style={[styles.metricTab, metric === m.key && { borderBottomColor: m.color, borderBottomWidth: 3 }]}
            onPress={() => setMetric(m.key)}
          >
            <Text style={[styles.metricTabText, metric === m.key && { color: m.color, fontWeight: '700' }]}>
              {m.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* ── Body ── */}
      {loading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color={metricInfo.color} />
          <Text style={styles.loadingText}>Loading rankings…</Text>
        </View>
      ) : error ? (
        <View style={styles.errorWrap}>
          <Text style={styles.errorEmoji}>😕</Text>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={() => fetchLeaderboard()}>
            <Text style={styles.retryBtnText}>Retry</Text>
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
            Top players in <Text style={{ color: metricInfo.color, fontWeight: '700' }}>{SCOPES.find(s => s.key === scope)?.label.replace(/[^a-zA-Z ]/g, '').trim()}</Text>
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
              <Text style={styles.emptyText}>No players yet in this area.{'\n'}Be the first to set the benchmark!</Text>
            </View>
          )}

          {/* ── Ranks 4–10 ── */}
          {rest.length > 0 && (
            <View style={styles.rankListWrap}>
              <Text style={styles.rankListTitle}>Rankings</Text>
              {rest.map((user, i) => (
                <RankRow
                  key={user._id || i}
                  user={user}
                  rank={i + 4}
                  metric={metric}
                  isCurrentUser={user._id === currentUser?._id}
                />
              ))}
            </View>
          )}

          {/* Bottom padding so content clears the sticky bar */}
          <View style={{ height: BOTTOM_BAR_HEIGHT }} />
        </ScrollView>
      )}

      {/* ── Sticky "Your Standing" Bar ── */}
      {!loading && !error && currentUser && (
        <View style={styles.myStandingBar}>
          <View style={styles.myStandingLeft}>
            <Avatar name={currentUser.name} size={40} fontSize={14} />
            <View style={styles.myStandingInfo}>
              <Text style={styles.myStandingName} numberOfLines={1}>{currentUser.name}</Text>
              {currentUser.gapToNextRank > 0 ? (
                <Text style={styles.myStandingGap}>
                  🚀 Only <Text style={{ color: metricInfo.color, fontWeight: '700' }}>{metric === 'carbon' ? (currentUser.gapToNextRank / 1000).toFixed(1) + 't' : currentUser.gapToNextRank + ' pts'}</Text> to reach #{currentUser.rank - 1}!
                </Text>
              ) : (
                <Text style={styles.myStandingGap}>🥇 You're at the top!</Text>
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
          <Text style={styles.guestBarText}>🔒 Log in to see your rank</Text>
        </View>
      )}
    </SafeAreaView>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 0,
  },

  // Header
  header: {
    backgroundColor: COLORS.primaryDark,
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
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  headerSub: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    marginTop: 2,
  },

  // Scope bar
  scopeBar: {
    flexDirection: 'row',
    backgroundColor: COLORS.primaryDark,
    paddingHorizontal: 16,
    paddingBottom: 14,
    gap: 8,
  },
  scopePill: {
    flex: 1,
    paddingVertical: 7,
    borderRadius: 20,
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  scopePillActive: {
    backgroundColor: '#fff',
    borderColor: '#fff',
  },
  scopePillText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    fontWeight: '600',
  },
  scopePillTextActive: {
    color: COLORS.primaryDark,
    fontWeight: '700',
  },

  // Metric tabs
  metricBar: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  metricTab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  metricTabText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },

  // Body
  body: { flex: 1 },
  bodyContent: { paddingTop: 16, paddingHorizontal: 16 },

  scopeLabel: {
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 20,
  },

  // Loading / Error / Empty
  loadingWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: {
    color: COLORS.textSecondary,
    fontSize: 14,
  },
  errorWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    gap: 12,
  },
  errorEmoji: { fontSize: 48 },
  errorText: {
    color: COLORS.textSecondary,
    fontSize: 14,
    textAlign: 'center',
  },
  retryBtn: {
    marginTop: 8,
    paddingHorizontal: 24,
    paddingVertical: 10,
    backgroundColor: COLORS.primary,
    borderRadius: 20,
  },
  retryBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  emptyWrap: {
    alignItems: 'center',
    paddingVertical: 40,
    gap: 10,
  },
  emptyEmoji: { fontSize: 52 },
  emptyText: {
    color: COLORS.textSecondary,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 22,
  },

  // Podium
  podiumWrap: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 24,
    paddingHorizontal: 8,
  },
  podiumSlot: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
    maxWidth: 120,
  },
  podiumSlotCenter: {
    marginBottom: 0,
  },
  podiumMedal: {
    fontSize: 22,
  },
  podiumAvatarWrap: {
    padding: 2,
    borderRadius: 999,
  },
  podiumName: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textPrimary,
    textAlign: 'center',
    maxWidth: 90,
  },
  scorePill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    marginTop: 2,
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 2,
  },
  scorePillText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  scorePillUnit: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 9,
    fontWeight: '500',
  },
  podiumBase: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
    marginTop: 6,
  },
  podiumRankNum: {
    color: 'rgba(0,0,0,0.5)',
    fontWeight: '800',
    fontSize: 18,
  },

  // Rank list
  rankListWrap: {
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  rankListTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textSecondary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  rankRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  rankRowHighlight: {
    backgroundColor: COLORS.primaryLight,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primary,
  },
  rankBadge: {
    width: 34,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankBadgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '800',
  },
  rankInfo: { flex: 1 },
  rankNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  rankName: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
    flexShrink: 1,
  },
  youBadge: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  youBadgeText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: '800',
  },
  rankSub: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  rankScorePill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    alignItems: 'center',
    minWidth: 56,
  },
  rankScoreText: {
    fontSize: 14,
    fontWeight: '800',
  },
  rankScoreUnit: {
    fontSize: 9,
    fontWeight: '500',
    marginTop: 1,
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

  // Sticky bottom bar
  myStandingBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderTopWidth: 2,
    borderTopColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'android' ? 16 : 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 10,
  },
  myStandingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  myStandingInfo: { flex: 1 },
  myStandingName: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  myStandingGap: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  myRankBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  myRankText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '800',
  },

  // Guest bar
  guestBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.primaryLight,
    borderTopWidth: 1,
    borderTopColor: COLORS.primary,
    paddingTop: 14,
    paddingBottom: Platform.OS === 'android' ? 16 : 28,
    alignItems: 'center',
  },
  guestBarText: {
    color: COLORS.primaryDark,
    fontSize: 13,
    fontWeight: '600',
  },
});
