import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  FlatList,
  Platform,
  StatusBar,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import LeaderboardScreen from '../../../screens/LeaderboardScreen';
import { COLORS, RADII, SPACING } from '../../../theme';
import { MICROCOPY } from '../../../constants/microcopy';
import { tr, useLanguage } from '../../../i18n/LanguageContext';
import {
  fetchCommunityPosts,
  createCommunityPost,
  likeCommunityPost,
  unlikeCommunityPost,
  celebrateCommunityPost,
  removeCelebrateCommunityPost,
  deleteCommunityPost,
} from '../api';

const SORT_OPTIONS = [
  { key: 'recent', label: '🕒 Recent', trKey: 'Recent' },
  { key: 'liked', label: '💚 Most Liked', trKey: 'Most Liked' },
  { key: 'celebrated', label: '👏 Celebrated', trKey: 'Celebrated' },
  { key: 'mine', label: '👤 My Posts', trKey: 'My Posts' },
];

const CATEGORY_TAGS = [
  { label: 'All', tag: 'all', icon: '🌐' },
  { label: 'Energy', tag: 'Energy', icon: '⚡' },
  { label: 'Transport', tag: 'Transport', icon: '🚲' },
  { label: 'Waste', tag: 'Waste', icon: '♻️' },
  { label: 'Water', tag: 'Water', icon: '💧' },
];

function formatTimeAgo(dateInput) {
  if (!dateInput) return 'Recently';
  const now = Date.now();
  const past = new Date(dateInput).getTime();
  if (isNaN(past)) return 'Recently';
  const diffSec = Math.max(0, Math.floor((now - past) / 1000));
  if (diffSec < 60) return 'Just now';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  return new Date(dateInput).toLocaleDateString();
}

export default function CommunityScreen({ user }) {
  useLanguage();
  const [activeTab, setActiveTab] = useState('feed'); // 'feed' | 'leaderboard'
  const [posts, setPosts] = useState([]);
  const [activeSort, setActiveSort] = useState('recent');
  const [selectedTag, setSelectedTag] = useState('all');

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState(null);

  // New Post Modal State
  const [showPostModal, setShowPostModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newBody, setNewBody] = useState('');
  const [newTag, setNewTag] = useState('Energy');
  const [submitting, setSubmitting] = useState(false);
  const [modalError, setModalError] = useState('');

  // Fetch posts from real backend
  const loadPosts = useCallback(
    async ({ sort = activeSort, tag = selectedTag, pageNum = 1, isRefresh = false } = {}) => {
      if (pageNum === 1 && !isRefresh) {
        setLoading(true);
      }
      setError(null);
      try {
        const response = await fetchCommunityPosts({
          sort,
          tag,
          page: pageNum,
          limit: 15,
        });

        if (response && response.success) {
          const fetched = response.data || [];
          if (pageNum === 1) {
            setPosts(fetched);
          } else {
            setPosts((prev) => [...prev, ...fetched]);
          }
          setPage(response.pagination?.page || pageNum);
          setTotalPages(response.pagination?.pages || 1);
        } else {
          throw new Error(response?.message || 'Failed to load community feed');
        }
      } catch (err) {
        console.error('Error fetching community posts:', err);
        setError(err.message || 'Unable to connect to community server');
      } finally {
        setLoading(false);
        setRefreshing(false);
        setLoadingMore(false);
      }
    },
    [activeSort, selectedTag]
  );

  useEffect(() => {
    if (activeTab === 'feed') {
      loadPosts({ sort: activeSort, tag: selectedTag, pageNum: 1 });
    }
  }, [activeTab, activeSort, selectedTag, loadPosts]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadPosts({ sort: activeSort, tag: selectedTag, pageNum: 1, isRefresh: true });
  }, [activeSort, selectedTag, loadPosts]);

  const handleLoadMore = () => {
    if (!loadingMore && page < totalPages) {
      setLoadingMore(true);
      loadPosts({ sort: activeSort, tag: selectedTag, pageNum: page + 1 });
    }
  };

  // Like / Unlike with optimistic update & rollback
  const handleLike = async (postId) => {
    const postIndex = posts.findIndex((p) => (p._id || p.id) === postId);
    if (postIndex === -1) return;

    const originalPost = posts[postIndex];
    const nextLiked = !originalPost.isLiked;
    const nextCount = Math.max(0, (originalPost.likesCount || 0) + (nextLiked ? 1 : -1));

    // Optimistic UI update
    const updatedPosts = [...posts];
    updatedPosts[postIndex] = {
      ...originalPost,
      isLiked: nextLiked,
      likesCount: nextCount,
    };
    setPosts(updatedPosts);

    try {
      if (nextLiked) {
        await likeCommunityPost(postId);
      } else {
        await unlikeCommunityPost(postId);
      }
    } catch (err) {
      console.error('Like action failed, rolling back:', err);
      // Rollback
      updatedPosts[postIndex] = originalPost;
      setPosts([...updatedPosts]);
      Alert.alert(tr('Notice'), err.message || tr('Failed to update like'));
    }
  };

  // Celebrate / Remove celebration with optimistic update & rollback
  const handleCelebrate = async (postId) => {
    const postIndex = posts.findIndex((p) => (p._id || p.id) === postId);
    if (postIndex === -1) return;

    const originalPost = posts[postIndex];
    const nextCelebrated = !originalPost.isCelebrated;
    const nextCount = Math.max(0, (originalPost.celebratesCount || 0) + (nextCelebrated ? 1 : -1));

    // Optimistic UI update
    const updatedPosts = [...posts];
    updatedPosts[postIndex] = {
      ...originalPost,
      isCelebrated: nextCelebrated,
      celebratesCount: nextCount,
    };
    setPosts(updatedPosts);

    try {
      if (nextCelebrated) {
        await celebrateCommunityPost(postId);
      } else {
        await removeCelebrateCommunityPost(postId);
      }
    } catch (err) {
      console.error('Celebrate action failed, rolling back:', err);
      // Rollback
      updatedPosts[postIndex] = originalPost;
      setPosts([...updatedPosts]);
      Alert.alert(tr('Notice'), err.message || tr('Failed to update celebration'));
    }
  };

  // Delete own post
  const handleDeletePost = (postId) => {
    Alert.alert(
      tr('Delete Post'),
      tr('Are you sure you want to delete this eco-post? This action cannot be undone.'),
      [
        { text: tr('Cancel'), style: 'cancel' },
        {
          text: tr('Delete'),
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteCommunityPost(postId);
              setPosts((prev) => prev.filter((p) => (p._id || p.id) !== postId));
            } catch (err) {
              Alert.alert(tr('Error'), err.message || tr('Failed to delete post'));
            }
          },
        },
      ]
    );
  };

  // Create real post
  const handleCreatePost = async () => {
    const titleTrimmed = newTitle.trim();
    const bodyTrimmed = newBody.trim();

    if (titleTrimmed.length < 3) {
      setModalError(tr('Please provide a heading with at least 3 characters.'));
      return;
    }
    if (bodyTrimmed.length < 5) {
      setModalError(tr('Please provide story details with at least 5 characters.'));
      return;
    }

    setSubmitting(true);
    setModalError('');

    try {
      const response = await createCommunityPost({
        title: titleTrimmed,
        content: bodyTrimmed,
        tag: newTag,
      });

      if (response && response.success) {
        setShowPostModal(false);
        setNewTitle('');
        setNewBody('');
        // Prepend new post to local feed
        if (response.data) {
          setPosts((prev) => [response.data, ...prev]);
        } else {
          loadPosts({ sort: activeSort, pageNum: 1 });
        }
      } else {
        setModalError(response?.message || tr('Failed to publish post.'));
      }
    } catch (err) {
      console.error('Post creation error:', err);
      setModalError(err.message || tr('Could not publish post. Please try again.'));
    } finally {
      setSubmitting(false);
    }
  };

  // Tab switch to Leaderboard (keeps existing Leaderboard component intact!)
  if (activeTab === 'leaderboard') {
    return (
      <View style={styles.container}>
        <View style={styles.topSegmentBar}>
          <TouchableOpacity
            style={[styles.segmentBtn, activeTab === 'feed' && styles.segmentBtnActive]}
            onPress={() => setActiveTab('feed')}
            activeOpacity={0.8}
          >
            <Text style={[styles.segmentBtnText, activeTab === 'feed' && styles.segmentBtnTextActive]}>
              {tr('The Green Corner 🌱')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.segmentBtn, activeTab === 'leaderboard' && styles.segmentBtnActive]}
            onPress={() => setActiveTab('leaderboard')}
            activeOpacity={0.8}
          >
            <Text style={[styles.segmentBtnText, activeTab === 'leaderboard' && styles.segmentBtnTextActive]}>
              {tr('Leaderboards 🏆')}
            </Text>
          </TouchableOpacity>
        </View>

        <LeaderboardScreen user={user} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#064E3B" />

      {/* Top Header */}
      <View style={styles.header}>
        <View style={styles.headerTitleWrap}>
          <Text style={styles.headerTitle}>{MICROCOPY.community.title}</Text>
          <Text style={styles.headerSub}>{MICROCOPY.community.subtitle}</Text>
        </View>

        <TouchableOpacity
          style={styles.postCtaBtn}
          onPress={() => {
            setModalError('');
            setShowPostModal(true);
          }}
          activeOpacity={0.85}
        >
          <Text style={styles.postCtaText}>+ {MICROCOPY.community.buttons.dropPost}</Text>
        </TouchableOpacity>
      </View>

      {/* Top Segmented Switcher (Feed vs Leaderboard) */}
      <View style={styles.topSegmentBar}>
        <TouchableOpacity
          style={[styles.segmentBtn, activeTab === 'feed' && styles.segmentBtnActive]}
          onPress={() => setActiveTab('feed')}
          activeOpacity={0.8}
        >
          <Text style={[styles.segmentBtnText, activeTab === 'feed' && styles.segmentBtnTextActive]}>
            {tr('The Green Corner 🌱')}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.segmentBtn, activeTab === 'leaderboard' && styles.segmentBtnActive]}
          onPress={() => setActiveTab('leaderboard')}
          activeOpacity={0.8}
        >
          <Text style={[styles.segmentBtnText, activeTab === 'leaderboard' && styles.segmentBtnTextActive]}>
            {tr('Leaderboards 🏆')}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Sub-Filter Pills Bar (Recent, Most Liked, Celebrated, My Posts) */}
      <View style={styles.subFilterBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterPillsScroll}>
          {SORT_OPTIONS.map((opt) => {
            const isActive = activeSort === opt.key;
            return (
              <TouchableOpacity
                key={opt.key}
                style={[styles.sortPill, isActive && styles.sortPillActive]}
                onPress={() => setActiveSort(opt.key)}
                activeOpacity={0.75}
              >
                <Text style={[styles.sortPillText, isActive && styles.sortPillTextActive]}>
                  {tr(opt.label)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#047857']} />}
      >
        {/* Banner Prompt */}
        <View style={styles.promptCard}>
          <View style={styles.promptLeft}>
            <Text style={styles.promptTitle}>{MICROCOPY.community.sharePrompt} 💡</Text>
            <Text style={styles.promptSub}>{MICROCOPY.community.showOff}</Text>
          </View>
          <TouchableOpacity
            style={styles.promptBtn}
            onPress={() => {
              setModalError('');
              setShowPostModal(true);
            }}
            activeOpacity={0.85}
          >
            <Text style={styles.promptBtnText}>{MICROCOPY.community.buttons.shareMove} ➔</Text>
          </TouchableOpacity>
        </View>

        {/* Section Heading & Category Filter Row */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.feedHeading}>
            {activeSort === 'mine'
              ? tr('My Shared Eco-Moves')
              : activeSort === 'liked'
              ? tr('Most Liked Community Wins 💚')
              : activeSort === 'celebrated'
              ? tr('Celebrated Milestones 👏')
              : MICROCOPY.community.feedHeader}
          </Text>
        </View>

        {/* Category Filter Chips */}
        <View style={styles.catChipsRow}>
          {CATEGORY_TAGS.map((c) => {
            const isCatActive = selectedTag === c.tag;
            return (
              <TouchableOpacity
                key={c.tag}
                style={[styles.catChip, isCatActive && styles.catChipActive]}
                onPress={() => setSelectedTag(c.tag)}
                activeOpacity={0.7}
              >
                <Text style={[styles.catChipText, isCatActive && styles.catChipTextActive]}>
                  {c.icon} {tr(c.label)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Loading Spinner */}
        {loading && (
          <View style={styles.centerBox}>
            <ActivityIndicator size="large" color="#047857" />
            <Text style={styles.loadingText}>{tr('Syncing Gujarat Green Corner...')}</Text>
          </View>
        )}

        {/* Error State */}
        {!loading && error && (
          <View style={styles.errorCard}>
            <Text style={styles.errorIcon}>⚠️</Text>
            <Text style={styles.errorTitle}>{tr('Failed to load community feed')}</Text>
            <Text style={styles.errorSub}>{error}</Text>
            <TouchableOpacity
              style={styles.retryBtn}
              onPress={() => loadPosts({ sort: activeSort, tag: selectedTag, pageNum: 1 })}
            >
              <Text style={styles.retryBtnText}>{tr('Tap to Retry')}</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Empty State */}
        {!loading && !error && posts.length === 0 && (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyIcon}>🌱</Text>
            <Text style={styles.emptyTitle}>
              {activeSort === 'mine'
                ? tr('No posts yet! Share your first green victory.')
                : MICROCOPY.community.empty.title}
            </Text>
            <Text style={styles.emptySub}>
              {activeSort === 'mine'
                ? tr('Your shared eco-habits and wins will be saved to your profile and visible to citizens across Gujarat.')
                : MICROCOPY.community.empty.subtitle}
            </Text>
            <TouchableOpacity
              style={styles.emptyCtaBtn}
              onPress={() => {
                setModalError('');
                setShowPostModal(true);
              }}
            >
              <Text style={styles.emptyCtaBtnText}>+ {MICROCOPY.community.buttons.dropPost}</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Community Posts List */}
        {!loading &&
          !error &&
          posts.map((post) => {
            const postId = post._id || post.id;
            const authorInitial = (post.authorName || 'E')[0].toUpperCase();
            const timeAgo = post.createdAt ? formatTimeAgo(post.createdAt) : post.time || 'Recently';

            return (
              <View key={postId} style={styles.postCard}>
                <View style={styles.postTopRow}>
                  <View style={styles.authorAvatar}>
                    <Text style={styles.authorInitial}>{authorInitial}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.authorName}>{post.authorName || 'Eco Citizen'}</Text>
                    <Text style={styles.authorMeta}>
                      📍 {post.authorDistrict || 'Gujarat'} • {timeAgo}
                    </Text>
                  </View>
                  <View style={styles.tagBadge}>
                    <Text style={styles.tagText}>{post.tag || 'Eco Move'}</Text>
                  </View>

                  {/* Owner Delete Option */}
                  {post.isOwner && (
                    <TouchableOpacity
                      style={styles.deleteBtn}
                      onPress={() => handleDeletePost(postId)}
                      activeOpacity={0.6}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      <Text style={styles.deleteIcon}>🗑️</Text>
                    </TouchableOpacity>
                  )}
                </View>

                <Text style={styles.postTitle}>{post.title}</Text>
                <Text style={styles.postBody}>{post.content || post.body}</Text>

                <View style={styles.postActionRow}>
                  {/* Like Button */}
                  <TouchableOpacity
                    style={[styles.actionBtn, post.isLiked && styles.actionBtnActive]}
                    onPress={() => handleLike(postId)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.actionIcon}>{post.isLiked ? '💚' : '🤍'}</Text>
                    <Text style={[styles.actionCount, post.isLiked && styles.actionCountActive]}>
                      {post.likesCount || 0}
                    </Text>
                  </TouchableOpacity>

                  {/* Celebrate Button */}
                  <TouchableOpacity
                    style={[styles.actionBtn, post.isCelebrated && styles.actionBtnCelebrateActive]}
                    onPress={() => handleCelebrate(postId)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.actionIcon}>👏</Text>
                    <Text
                      style={[
                        styles.actionCount,
                        post.isCelebrated && styles.actionCountCelebrateActive,
                      ]}
                    >
                      {post.celebratesCount || 0} {tr('celebrates')}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}

        {/* Load More Button if more pages exist */}
        {!loading && !error && page < totalPages && (
          <TouchableOpacity
            style={styles.loadMoreBtn}
            onPress={handleLoadMore}
            disabled={loadingMore}
            activeOpacity={0.8}
          >
            {loadingMore ? (
              <ActivityIndicator size="small" color="#047857" />
            ) : (
              <Text style={styles.loadMoreText}>{tr('Load More Posts ➔')}</Text>
            )}
          </TouchableOpacity>
        )}

        {/* Moderation & Guidelines Note */}
        <View style={styles.guidelinesBox}>
          <Text style={styles.guidelinesText}>
            🛡️ <Text style={{ fontWeight: '700' }}>{tr('EcoPulse Guidelines:')}</Text> Verified, respectful eco-actions only. All shared community achievements are persisted to Mission LiFE Gujarat.
          </Text>
        </View>

        <View style={{ height: 80 }} />
      </ScrollView>

      {/* Drop a Green W Modal */}
      <Modal visible={showPostModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalHeading}>{tr('Drop a Green W 🌱')}</Text>
              <TouchableOpacity
                onPress={() => {
                  if (!submitting) setShowPostModal(false);
                }}
                disabled={submitting}
              >
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.modalSub}>
              {tr('Share your latest planet-saving achievement with fellow Gujarat citizens.')}
            </Text>

            {/* Error Message inside modal */}
            {modalError ? (
              <View style={styles.modalErrorBox}>
                <Text style={styles.modalErrorText}>{modalError}</Text>
              </View>
            ) : null}

            {/* Category Selector */}
            <View style={styles.modalInputGroup}>
              <Text style={styles.modalInputLabel}>{tr('Category')}</Text>
              <View style={styles.modalTagRow}>
                {['Energy', 'Transport', 'Waste', 'Water'].map((cat) => {
                  const isSelected = newTag === cat;
                  return (
                    <TouchableOpacity
                      key={cat}
                      style={[styles.modalTagChip, isSelected && styles.modalTagChipActive]}
                      onPress={() => setNewTag(cat)}
                    >
                      <Text
                        style={[
                          styles.modalTagChipText,
                          isSelected && styles.modalTagChipTextActive,
                        ]}
                      >
                        {cat === 'Energy'
                          ? '⚡ Energy'
                          : cat === 'Transport'
                          ? '🚲 Transport'
                          : cat === 'Waste'
                          ? '♻️ Waste'
                          : '💧 Water'}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            <View style={styles.modalInputGroup}>
              <Text style={styles.modalInputLabel}>{tr('Heading / Win')}</Text>
              <TextInput
                style={styles.modalTextInput}
                placeholder={tr('e.g. Switched entire home to 9W LEDs!')}
                placeholderTextColor="#94A3B8"
                value={newTitle}
                onChangeText={setNewTitle}
                maxLength={120}
                editable={!submitting}
              />
            </View>

            <View style={styles.modalInputGroup}>
              <Text style={styles.modalInputLabel}>{tr('Story / Details')}</Text>
              <TextInput
                style={[styles.modalTextInput, { height: 90, textAlignVertical: 'top' }]}
                placeholder={tr('What motivated you? How much energy or waste did you save?')}
                placeholderTextColor="#94A3B8"
                value={newBody}
                onChangeText={setNewBody}
                maxLength={1500}
                multiline
                editable={!submitting}
              />
            </View>

            <TouchableOpacity
              style={[styles.publishBtn, submitting && styles.publishBtnDisabled]}
              onPress={handleCreatePost}
              disabled={submitting}
              activeOpacity={0.85}
            >
              {submitting ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.publishBtnText}>{tr('Publish Green Move ➔')}</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAF9',
  },
  header: {
    backgroundColor: '#064E3B',
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + 12 : 16,
    paddingBottom: 14,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitleWrap: {
    flex: 1,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: -0.3,
  },
  headerSub: {
    color: '#A7F3D0',
    fontSize: 12.5,
    marginTop: 2,
    fontWeight: '600',
  },
  postCtaBtn: {
    backgroundColor: '#10B981',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 12,
  },
  postCtaText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  topSegmentBar: {
    flexDirection: 'row',
    backgroundColor: '#064E3B',
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 8,
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
  },
  segmentBtnActive: {
    backgroundColor: '#10B981',
  },
  segmentBtnText: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 12.5,
    fontWeight: '600',
  },
  segmentBtnTextActive: {
    color: '#fff',
    fontWeight: '800',
  },
  subFilterBar: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    paddingVertical: 10,
  },
  filterPillsScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  sortPill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
  },
  sortPillActive: {
    backgroundColor: '#047857',
  },
  sortPillText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#475569',
  },
  sortPillTextActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 110,
  },
  promptCard: {
    backgroundColor: '#D1FAE5',
    borderWidth: 1.5,
    borderColor: '#A7F3D0',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  promptLeft: {
    flex: 1,
    marginRight: 12,
  },
  promptTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#065F46',
    marginBottom: 4,
  },
  promptSub: {
    fontSize: 12,
    color: '#047857',
    fontWeight: '500',
  },
  promptBtn: {
    backgroundColor: '#047857',
    paddingVertical: 9,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  promptBtnText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '800',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  feedHeading: {
    fontSize: 15,
    fontWeight: '800',
    color: '#064E3B',
    letterSpacing: -0.2,
  },
  catChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 16,
  },
  catChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  catChipActive: {
    backgroundColor: '#ECFDF5',
    borderColor: '#10B981',
  },
  catChipText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#64748B',
  },
  catChipTextActive: {
    color: '#047857',
    fontWeight: '800',
  },
  centerBox: {
    paddingVertical: 40,
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 13,
    color: '#047857',
    fontWeight: '600',
  },
  errorCard: {
    backgroundColor: '#FEF2F2',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    marginVertical: 12,
  },
  errorIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  errorTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#991B1B',
    marginBottom: 4,
  },
  errorSub: {
    fontSize: 12.5,
    color: '#7F1D1D',
    textAlign: 'center',
    marginBottom: 14,
  },
  retryBtn: {
    backgroundColor: '#DC2626',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
  },
  retryBtnText: {
    color: '#FFFFFF',
    fontSize: 12.5,
    fontWeight: '700',
  },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginVertical: 12,
  },
  emptyIcon: {
    fontSize: 36,
    marginBottom: 8,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#064E3B',
    marginBottom: 4,
    textAlign: 'center',
  },
  emptySub: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 16,
  },
  emptyCtaBtn: {
    backgroundColor: '#047857',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  emptyCtaBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  postCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 5,
    elevation: 1,
  },
  postTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  authorAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#047857',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  authorInitial: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 15,
  },
  authorName: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#0F172A',
  },
  authorMeta: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 1,
  },
  tagBadge: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#A7F3D0',
    marginRight: 6,
  },
  tagText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#047857',
  },
  deleteBtn: {
    padding: 4,
  },
  deleteIcon: {
    fontSize: 14,
  },
  postTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 6,
  },
  postBody: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 19,
    marginBottom: 12,
  },
  postActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 10,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    gap: 6,
  },
  actionBtnActive: {
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  actionBtnCelebrateActive: {
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  actionIcon: {
    fontSize: 13,
  },
  actionCount: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
  },
  actionCountActive: {
    color: '#047857',
    fontWeight: '800',
  },
  actionCountCelebrateActive: {
    color: '#B45309',
    fontWeight: '800',
  },
  loadMoreBtn: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#047857',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    marginVertical: 10,
  },
  loadMoreText: {
    color: '#047857',
    fontSize: 13,
    fontWeight: '800',
  },
  guidelinesBox: {
    marginTop: 10,
    backgroundColor: '#F1F5F9',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  guidelinesText: {
    fontSize: 11.5,
    color: '#64748B',
    lineHeight: 16,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    gap: 14,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalHeading: {
    fontSize: 18,
    fontWeight: '900',
    color: '#064E3B',
  },
  modalCloseText: {
    fontSize: 18,
    color: '#64748B',
    fontWeight: '800',
  },
  modalSub: {
    fontSize: 13,
    color: '#64748B',
    lineHeight: 18,
  },
  modalErrorBox: {
    backgroundColor: '#FEE2E2',
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: '#F87171',
  },
  modalErrorText: {
    color: '#B91C1C',
    fontSize: 12,
    fontWeight: '600',
  },
  modalInputGroup: {
    gap: 6,
  },
  modalInputLabel: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#334155',
  },
  modalTagRow: {
    flexDirection: 'row',
    gap: 8,
  },
  modalTagChip: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  modalTagChipActive: {
    backgroundColor: '#ECFDF5',
    borderColor: '#047857',
  },
  modalTagChipText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#64748B',
  },
  modalTagChipTextActive: {
    color: '#047857',
  },
  modalTextInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: '#0F172A',
  },
  publishBtn: {
    backgroundColor: '#047857',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 6,
  },
  publishBtnDisabled: {
    opacity: 0.6,
  },
  publishBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
});
