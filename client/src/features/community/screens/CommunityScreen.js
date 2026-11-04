import React, { useState } from 'react';
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
} from 'react-native';
import LeaderboardScreen from '../../../screens/LeaderboardScreen';
import { COLORS, RADII, SPACING } from '../../../theme';
import { MICROCOPY } from '../../../constants/microcopy';

import { tr, useLanguage } from '../../../i18n/LanguageContext';
const INITIAL_POSTS = [
  {
    id: 'post_1',
    author: 'Priya Patel',
    district: 'Ahmedabad',
    time: '2h ago',
    tag: '☀️ Solar Rooftop',
    title: 'Rooftop solar live in Bopal! ⚡',
    body: 'Generated 38 kWh this week with our new 3kW system. PM Surya Ghar subsidy was credited smoothly. Less grid power, more sunshine!',
    likes: 24,
    celebrates: 18,
    isLiked: false,
  },
  {
    id: 'post_2',
    author: 'Devansh Mehta',
    district: 'Gandhinagar',
    time: '4h ago',
    tag: '🚲 Green Commute',
    title: 'Cycled to Infocity 5 days in a row',
    body: 'Dodged traffic, saved 12 kg of CO₂ and felt 100x more energized every morning. Habit streak is officially locked in! 🔥',
    likes: 31,
    celebrates: 26,
    isLiked: true,
  },
  {
    id: 'post_3',
    author: 'Ananya Joshi',
    district: 'Surat',
    time: '6h ago',
    tag: '🌱 Kitchen Composting',
    title: 'Zero wet waste to landfill this month',
    body: 'Turned 15kg of organic veggie scraps into rich plant compost. It feels so good seeing that waste become soil food instead of methane.',
    likes: 19,
    celebrates: 14,
    isLiked: false,
  },
];

export default function CommunityScreen({ user }) {
  useLanguage();
  const [activeTab, setActiveTab] = useState('feed'); // 'feed' | 'leaderboard'
  const [posts, setPosts] = useState(INITIAL_POSTS);
  const [showPostModal, setShowPostModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newBody, setNewBody] = useState('');
  const [newTag, setNewTag] = useState('🌱 Eco Move');

  const handleLike = (id) => {
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          const nextLiked = !p.isLiked;
          return {
            ...p,
            isLiked: nextLiked,
            likes: nextLiked ? p.likes + 1 : p.likes - 1,
          };
        }
        return p;
      })
    );
  };

  const handleCreatePost = () => {
    if (!newTitle.trim()) return;
    const newPost = {
      id: `post_${Date.now()}`,
      author: user?.fullName || 'Eco Citizen',
      district: user?.district || 'Gujarat',
      time: 'Just now',
      tag: newTag,
      title: newTitle.trim(),
      body: newBody.trim() || 'Dropped a fresh green W for the planet!',
      likes: 1,
      celebrates: 1,
      isLiked: true,
    };
    setPosts([newPost, ...posts]);
    setNewTitle('');
    setNewBody('');
    setShowPostModal(false);
  };

  if (activeTab === 'leaderboard') {
    return (
      <View style={styles.container}>
        {/* Top Segmented Tab Switcher */}
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
          onPress={() => setShowPostModal(true)}
          activeOpacity={0.85}
        >
          <Text style={styles.postCtaText}>+ {MICROCOPY.community.buttons.dropPost}</Text>
        </TouchableOpacity>
      </View>

      {/* Segmented Switcher */}
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

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Banner Prompt */}
        <View style={styles.promptCard}>
          <View style={styles.promptLeft}>
            <Text style={styles.promptTitle}>{MICROCOPY.community.sharePrompt} 💡</Text>
            <Text style={styles.promptSub}>{MICROCOPY.community.showOff}</Text>
          </View>
          <TouchableOpacity
            style={styles.promptBtn}
            onPress={() => setShowPostModal(true)}
            activeOpacity={0.85}
          >
            <Text style={styles.promptBtnText}>{MICROCOPY.community.buttons.shareMove} ➔</Text>
          </TouchableOpacity>
        </View>

        {/* Section Title */}
        <Text style={styles.feedHeading}>{MICROCOPY.community.feedHeader}</Text>

        {/* Community Posts */}
        {posts.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyIcon}>🌱</Text>
            <Text style={styles.emptyTitle}>{MICROCOPY.community.empty.title}</Text>
            <Text style={styles.emptySub}>{MICROCOPY.community.empty.subtitle}</Text>
          </View>
        ) : (
          posts.map((post) => (
            <View key={post.id} style={styles.postCard}>
              <View style={styles.postTopRow}>
                <View style={styles.authorAvatar}>
                  <Text style={styles.authorInitial}>
                    {(post.author || 'E')[0].toUpperCase()}
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.authorName}>{post.author}</Text>
                  <Text style={styles.authorMeta}>
                    📍 {post.district} • {post.time}
                  </Text>
                </View>
                <View style={styles.tagBadge}>
                  <Text style={styles.tagText}>{post.tag}</Text>
                </View>
              </View>

              <Text style={styles.postTitle}>{post.title}</Text>
              <Text style={styles.postBody}>{post.body}</Text>

              <View style={styles.postActionRow}>
                <TouchableOpacity
                  style={[styles.actionBtn, post.isLiked && styles.actionBtnActive]}
                  onPress={() => handleLike(post.id)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.actionIcon}>{post.isLiked ? '💚' : '🤍'}</Text>
                  <Text style={[styles.actionCount, post.isLiked && styles.actionCountActive]}>
                    {post.likes}
                  </Text>
                </TouchableOpacity>

                <View style={styles.actionBtn}>
                  <Text style={styles.actionIcon}>👏</Text>
                  <Text style={styles.actionCount}>{post.celebrates} celebrates</Text>
                </View>
              </View>
            </View>
          ))
        )}

        {/* Moderation & Guidelines Note */}
        <View style={styles.guidelinesBox}>
          <Text style={styles.guidelinesText}>
            🛡️ <Text style={{ fontWeight: '700' }}>{tr('EcoPulse Guidelines:')}</Text> Verified, respectful eco-actions only. Report inappropriate posts to GEDA moderators.
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
              <TouchableOpacity onPress={() => setShowPostModal(false)}>
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.modalSub}>
              {tr('Share your latest planet-saving achievement with fellow Gujarat citizens.')}
            </Text>

            <View style={styles.modalInputGroup}>
              <Text style={styles.modalInputLabel}>{tr('Heading / Win')}</Text>
              <TextInput
                style={styles.modalTextInput}
                placeholder={tr('e.g. Switched entire home to 9W LEDs!')}
                placeholderTextColor="#94A3B8"
                value={newTitle}
                onChangeText={setNewTitle}
              />
            </View>

            <View style={styles.modalInputGroup}>
              <Text style={styles.modalInputLabel}>{tr('Story / Details')}</Text>
              <TextInput
                style={[styles.modalTextInput, { height: 80, textAlignVertical: 'top' }]}
                placeholder={tr('What motivated you? How much energy or waste did you save?')}
                placeholderTextColor="#94A3B8"
                value={newBody}
                onChangeText={setNewBody}
                multiline
              />
            </View>

            <TouchableOpacity
              style={styles.publishBtn}
              onPress={handleCreatePost}
              activeOpacity={0.85}
            >
              <Text style={styles.publishBtnText}>{tr('Publish Green Move ➔')}</Text>
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
    marginBottom: 20,
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
  feedHeading: {
    fontSize: 15,
    fontWeight: '800',
    color: '#064E3B',
    letterSpacing: -0.2,
    marginBottom: 12,
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
  },
  tagText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#047857',
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
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 5,
  },
  actionBtnActive: {
    backgroundColor: '#ECFDF5',
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
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
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
  modalInputGroup: {
    gap: 6,
  },
  modalInputLabel: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#334155',
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
  publishBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
});
