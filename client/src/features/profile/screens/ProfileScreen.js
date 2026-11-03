import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Modal,
  TextInput,
  Alert,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { COLORS, RADII, SPACING, TYPOGRAPHY } from '../../../theme';
import { useLanguage } from '../../../i18n/LanguageContext';
import { useProfile, useProfileLikedActivities, useUpdateProfile } from '../hooks';
import {
  MoreDotsIcon,
  EditPencilIcon,
  ChevronRightIcon,
  UserCircleIcon,
  SettingsIcon,
  PhoneCallIcon,
  TermsChainIcon,
  PrivacyShieldIcon,
  HelpCircleIcon,
  LogoutIcon,
} from '../components/ProfileIcons';
import { HeartIcon } from '../../home/components/HomeIcons';
import { BellIcon, ArrowLeftIcon, CloseIcon } from '../../solar/components/SolarIcons';

export default function ProfileScreen({ user, onLogout }) {
  const navigation = useNavigation();
  const { t, openLanguageModal } = useLanguage();

  const { data: profile } = useProfile(user);
  const { data: likedActivities = [] } = useProfileLikedActivities();
  const updateProfileMutation = useUpdateProfile();

  const rawName = profile?.fullName || profile?.name || 'Alex Jacob';
  const initial = (rawName.trim()[0] || 'A').toUpperCase();
  const district = profile?.district || 'Ahmedabad';
  const stateName = profile?.state || 'Gujarat';
  const avatarUri = profile?.avatar || null;

  // Modal states
  const [photoOptionsVisible, setPhotoOptionsVisible] = useState(false);
  const [viewPhotoVisible, setViewPhotoVisible] = useState(false);
  const [editNameVisible, setEditNameVisible] = useState(false);
  const [editedName, setEditedName] = useState(rawName);
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);
  const [likedModalVisible, setLikedModalVisible] = useState(false);
  const [accountDetailsVisible, setAccountDetailsVisible] = useState(false);
  const [infoModalContent, setInfoModalContent] = useState(null); // { title, text }

  // 1. Photo Picker & Actions
  const handlePickFromLibrary = async () => {
    setPhotoOptionsVisible(false);
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert(
          'Permission Required',
          'Please grant media library access to upload a profile picture.'
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets[0]?.uri) {
        const newUri = result.assets[0].uri;
        updateProfileMutation.mutate({ avatar: newUri });
      }
    } catch (err) {
      console.warn('Image picker error:', err.message);
    }
  };

  const handleTakePhoto = async () => {
    setPhotoOptionsVisible(false);
    try {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
        Alert.alert(
          'Permission Required',
          'Please grant camera access to take a profile picture.'
        );
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets[0]?.uri) {
        const newUri = result.assets[0].uri;
        updateProfileMutation.mutate({ avatar: newUri });
      }
    } catch (err) {
      console.warn('Camera error:', err.message);
    }
  };

  const handleRemovePhoto = () => {
    setPhotoOptionsVisible(false);
    updateProfileMutation.mutate({ avatar: null });
  };

  // 2. Name Editing
  const handleSaveName = () => {
    const trimmed = editedName.trim();
    if (!trimmed) {
      Alert.alert('Invalid Name', 'Name cannot be empty.');
      return;
    }
    updateProfileMutation.mutate({ fullName: trimmed });
    setEditNameVisible(false);
  };

  return (
    <View style={styles.container}>
      {/* Top Header Bar */}
      <View style={styles.headerBar}>
        <View style={styles.headerLeft}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
            activeOpacity={0.7}
            accessibilityLabel="Back"
          >
            <ArrowLeftIcon size={18} color="#0F172A" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t('profile_title') || 'Profile'}</Text>
        </View>

        <TouchableOpacity
          style={styles.moreButton}
          activeOpacity={0.7}
          onPress={() => setAccountDetailsVisible(true)}
          accessibilityLabel="More options"
        >
          <MoreDotsIcon size={18} color="#0F172A" />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* User Profile Card */}
        <View style={styles.profileCard}>
          <TouchableOpacity
            style={styles.avatarContainer}
            activeOpacity={0.8}
            onPress={() => setPhotoOptionsVisible(true)}
            accessibilityLabel="Profile photo options"
          >
            {avatarUri ? (
              <Image source={{ uri: avatarUri }} style={styles.avatarImage} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarText}>{initial}</Text>
              </View>
            )}
            <View style={styles.cameraBadge}>
              <Text style={styles.cameraBadgeText}>📷</Text>
            </View>
          </TouchableOpacity>

          <View style={styles.userInfoCol}>
            <Text style={styles.userName} numberOfLines={1}>
              {rawName}
            </Text>
            <Text style={styles.userSubtitle} numberOfLines={1}>
              {`Welcome to ${district}, ${stateName}`}
            </Text>
          </View>

          {/* Edit icon button beside name */}
          <TouchableOpacity
            style={styles.editNameButton}
            activeOpacity={0.8}
            onPress={() => {
              setEditedName(rawName);
              setEditNameVisible(true);
            }}
            accessibilityLabel="Edit name"
          >
            <EditPencilIcon size={18} color="#0F172A" />
          </TouchableOpacity>
        </View>

        {/* Section 1: Account, Liked, Notifications, Settings */}
        <View style={styles.menuGroupCard}>
          {/* Account Details */}
          <TouchableOpacity
            style={styles.menuRow}
            activeOpacity={0.7}
            onPress={() => setAccountDetailsVisible(true)}
          >
            <View style={styles.menuIconBox}>
              <UserCircleIcon size={20} color="#0F172A" />
            </View>
            <View style={styles.menuTextCol}>
              <Text style={styles.menuTitle}>Account Details</Text>
              <Text style={styles.menuSubtitle}>Manage your Account Details</Text>
            </View>
            <ChevronRightIcon size={18} color="#94A3B8" />
          </TouchableOpacity>

          <View style={styles.menuDivider} />

          {/* Liked Activities */}
          <TouchableOpacity
            style={styles.menuRow}
            activeOpacity={0.7}
            onPress={() => setLikedModalVisible(true)}
          >
            <View style={styles.menuIconBox}>
              <HeartIcon size={20} filled={true} color="#EF4444" />
            </View>
            <View style={styles.menuTextCol}>
              <Text style={styles.menuTitle}>Liked Activities</Text>
              <Text style={styles.menuSubtitle}>
                {likedActivities.length > 0
                  ? `${likedActivities.length} saved action${likedActivities.length > 1 ? 's' : ''}`
                  : 'View your saved favorite activities'}
              </Text>
            </View>
            <ChevronRightIcon size={18} color="#94A3B8" />
          </TouchableOpacity>

          <View style={styles.menuDivider} />

          {/* Notification */}
          <TouchableOpacity
            style={styles.menuRow}
            activeOpacity={0.7}
            onPress={() => navigation.navigate('Notifications')}
          >
            <View style={styles.menuIconBox}>
              <BellIcon size={20} color="#0F172A" />
            </View>
            <View style={styles.menuTextCol}>
              <Text style={styles.menuTitle}>Notification</Text>
              <Text style={styles.menuSubtitle}>Alerts, daily tips & reminders</Text>
            </View>
            <ChevronRightIcon size={18} color="#94A3B8" />
          </TouchableOpacity>

          <View style={styles.menuDivider} />

          {/* Settings */}
          <TouchableOpacity
            style={styles.menuRow}
            activeOpacity={0.7}
            onPress={openLanguageModal}
          >
            <View style={styles.menuIconBox}>
              <SettingsIcon size={20} color="#0F172A" />
            </View>
            <View style={styles.menuTextCol}>
              <Text style={styles.menuTitle}>Settings</Text>
              <Text style={styles.menuSubtitle}>Language & preferences</Text>
            </View>
            <ChevronRightIcon size={18} color="#94A3B8" />
          </TouchableOpacity>
        </View>

        {/* Section 2: Contact, Terms, Privacy, Help, Logout */}
        <View style={styles.menuGroupCard}>
          {/* Contact Us */}
          <TouchableOpacity
            style={styles.menuRow}
            activeOpacity={0.7}
            onPress={() =>
              setInfoModalContent({
                title: 'Contact Us',
                text: 'Mission LiFE Helpdesk\n\nEmail: contact@missionlife.gov.in\nToll-Free Helpline: 1800-11-2026\nOffice: Paryavaran Bhavan, CGO Complex, New Delhi.',
              })
            }
          >
            <View style={styles.menuIconBox}>
              <PhoneCallIcon size={20} color="#0F172A" />
            </View>
            <View style={styles.menuTextCol}>
              <Text style={styles.menuTitle}>Contact Us</Text>
            </View>
            <ChevronRightIcon size={18} color="#94A3B8" />
          </TouchableOpacity>

          <View style={styles.menuDivider} />

          {/* Terms & Conditions */}
          <TouchableOpacity
            style={styles.menuRow}
            activeOpacity={0.7}
            onPress={() =>
              setInfoModalContent({
                title: 'Terms & Conditions',
                text: 'By using the Mission LiFE Carbon & Solar Platform, you agree to participate in voluntary sustainable habits, track lifestyle carbon footprints, and explore verified rooftop solar guidelines following Ministry of New and Renewable Energy (MNRE) standards.',
              })
            }
          >
            <View style={styles.menuIconBox}>
              <TermsChainIcon size={20} color="#0F172A" />
            </View>
            <View style={styles.menuTextCol}>
              <Text style={styles.menuTitle}>Terms & condition</Text>
            </View>
            <ChevronRightIcon size={18} color="#94A3B8" />
          </TouchableOpacity>

          <View style={styles.menuDivider} />

          {/* Privacy Policy */}
          <TouchableOpacity
            style={styles.menuRow}
            activeOpacity={0.7}
            onPress={() =>
              setInfoModalContent({
                title: 'Privacy Policy',
                text: 'Your privacy is paramount. Energy, travel, and lifestyle inputs are calculated deterministically on-device without third-party ad tracking. Your data is protected according to national Digital Personal Data Protection standards.',
              })
            }
          >
            <View style={styles.menuIconBox}>
              <PrivacyShieldIcon size={20} color="#0F172A" />
            </View>
            <View style={styles.menuTextCol}>
              <Text style={styles.menuTitle}>Privacy Policy</Text>
            </View>
            <ChevronRightIcon size={18} color="#94A3B8" />
          </TouchableOpacity>

          <View style={styles.menuDivider} />

          {/* Get Help */}
          <TouchableOpacity
            style={styles.menuRow}
            activeOpacity={0.7}
            onPress={() =>
              setInfoModalContent({
                title: 'Get Help',
                text: 'Frequently Asked Questions:\n\n1. How is rooftop solar subsidy calculated?\nSubsidy is based on official PM Surya Ghar: Muft Bijli Yojana slabs (₹30,000/kW for first 2 kW, ₹18,000 for 3rd kW, capped at ₹78,000).\n\n2. How do daily check-ins work?\nComplete recurring actions (e.g., public transit, LED bulbs) to earn Eco Score & Green Points.',
              })
            }
          >
            <View style={styles.menuIconBox}>
              <HelpCircleIcon size={20} color="#0F172A" />
            </View>
            <View style={styles.menuTextCol}>
              <Text style={styles.menuTitle}>Get Help</Text>
            </View>
            <ChevronRightIcon size={18} color="#94A3B8" />
          </TouchableOpacity>

          <View style={styles.menuDivider} />

          {/* Log out */}
          <TouchableOpacity
            style={styles.menuRow}
            activeOpacity={0.7}
            onPress={() => setLogoutModalVisible(true)}
          >
            <View style={styles.menuIconBox}>
              <LogoutIcon size={20} color="#0F172A" />
            </View>
            <View style={styles.menuTextCol}>
              <Text style={styles.menuTitle}>Log out</Text>
            </View>
            <ChevronRightIcon size={18} color="#94A3B8" />
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* MODAL 1: Photo Options (View photo / Change photo / Remove photo) */}
      <Modal
        visible={photoOptionsVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setPhotoOptionsVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalBackdrop}
          activeOpacity={1}
          onPress={() => setPhotoOptionsVisible(false)}
        >
          <View style={styles.actionSheetCard}>
            <View style={styles.sheetHandle} />
            <Text style={styles.sheetTitle}>Profile Photo</Text>

            {avatarUri ? (
              <TouchableOpacity
                style={styles.sheetOption}
                onPress={() => {
                  setPhotoOptionsVisible(false);
                  setViewPhotoVisible(true);
                }}
              >
                <Text style={styles.sheetOptionText}>👁️ View Photo</Text>
              </TouchableOpacity>
            ) : null}

            <TouchableOpacity
              style={styles.sheetOption}
              onPress={handlePickFromLibrary}
            >
              <Text style={styles.sheetOptionText}>🖼️ Choose from Library</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.sheetOption}
              onPress={handleTakePhoto}
            >
              <Text style={styles.sheetOptionText}>📸 Take Photo</Text>
            </TouchableOpacity>

            {avatarUri ? (
              <TouchableOpacity
                style={styles.sheetOption}
                onPress={handleRemovePhoto}
              >
                <Text style={[styles.sheetOptionText, { color: '#EF4444' }]}>
                  🗑️ Remove Photo
                </Text>
              </TouchableOpacity>
            ) : null}

            <TouchableOpacity
              style={[styles.sheetOption, styles.sheetCancelOption]}
              onPress={() => setPhotoOptionsVisible(false)}
            >
              <Text style={styles.sheetCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* MODAL 2: View Photo Fullscreen Preview */}
      <Modal
        visible={viewPhotoVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setViewPhotoVisible(false)}
      >
        <View style={styles.fullPhotoBackdrop}>
          <TouchableOpacity
            style={styles.closeFullPhotoBtn}
            onPress={() => setViewPhotoVisible(false)}
          >
            <CloseIcon size={24} color="#FFFFFF" />
          </TouchableOpacity>

          {avatarUri ? (
            <Image
              source={{ uri: avatarUri }}
              style={styles.fullPhotoImage}
              resizeMode="contain"
            />
          ) : null}
        </View>
      </Modal>

      {/* MODAL 3: Edit Name Modal */}
      <Modal
        visible={editNameVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setEditNameVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.editNameCard}>
            <Text style={styles.dialogTitle}>Change Name</Text>
            <Text style={styles.dialogSubtitle}>
              Enter your preferred full name for Mission LiFE.
            </Text>

            <TextInput
              style={styles.textInput}
              value={editedName}
              onChangeText={setEditedName}
              placeholder="Full Name"
              placeholderTextColor="#94A3B8"
              autoFocus={true}
              maxLength={60}
            />

            <View style={styles.dialogButtonRow}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setEditNameVisible(false)}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.confirmBtn}
                onPress={handleSaveName}
              >
                <Text style={styles.confirmBtnText}>Save Name</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* MODAL 4: Liked Activities Modal */}
      <Modal
        visible={likedModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setLikedModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.likedSheetCard}>
            <View style={styles.sheetHeaderRow}>
              <View style={styles.likedHeaderLeft}>
                <HeartIcon size={22} filled={true} color="#EF4444" />
                <Text style={styles.likedTitle}>Liked Activities</Text>
              </View>
              <TouchableOpacity
                onPress={() => setLikedModalVisible(false)}
                style={styles.closeModalBtn}
              >
                <CloseIcon size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            <Text style={styles.likedSubtitle}>
              Your saved favorite climate actions and habits
            </Text>

            <ScrollView style={styles.likedListScroll} showsVerticalScrollIndicator={false}>
              {likedActivities.length === 0 ? (
                <View style={styles.emptyLikedBox}>
                  <Text style={styles.emptyLikedIcon}>🤍</Text>
                  <Text style={styles.emptyLikedTitle}>No Liked Activities Yet</Text>
                  <Text style={styles.emptyLikedDesc}>
                    Explore activities and tap the heart icon on any challenge to save it here!
                  </Text>
                </View>
              ) : (
                likedActivities.map((act) => {
                  const actTitle = act.titleKey && t(act.titleKey) !== act.titleKey
                    ? t(act.titleKey)
                    : act.title || act.id;

                  return (
                    <TouchableOpacity
                      key={act.id || act.activityId}
                      style={styles.likedItemCard}
                      activeOpacity={0.8}
                      onPress={() => {
                        setLikedModalVisible(false);
                        navigation.navigate('Activities', {
                          screen: 'ActivityDetail',
                          params: { key: act.id || act.activityId },
                        });
                      }}
                    >
                      <View style={styles.likedItemInfo}>
                        <Text style={styles.likedItemName} numberOfLines={2}>
                          {actTitle}
                        </Text>
                        <Text style={styles.likedItemMeta}>
                          {act.category?.toUpperCase() || 'LIFESTYLE'} • +{act.ecoScoreReward || 5} Eco Score
                        </Text>
                      </View>
                      <ChevronRightIcon size={18} color="#00897B" />
                    </TouchableOpacity>
                  );
                })
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* MODAL 5: Account Details Modal */}
      <Modal
        visible={accountDetailsVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setAccountDetailsVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.likedSheetCard}>
            <View style={styles.sheetHeaderRow}>
              <Text style={styles.likedTitle}>Account Details</Text>
              <TouchableOpacity
                onPress={() => setAccountDetailsVisible(false)}
                style={styles.closeModalBtn}
              >
                <CloseIcon size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Full Name</Text>
              <Text style={styles.detailValue}>{rawName}</Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Location</Text>
              <Text style={styles.detailValue}>{`${district}, ${stateName}`}</Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Reward Points</Text>
              <Text style={styles.detailValue}>{profile?.totalPoints || 120} pts</Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Household Type</Text>
              <Text style={styles.detailValue}>
                {profile?.household?.houseType || 'Apartment'}
              </Text>
            </View>

            <TouchableOpacity
              style={styles.doneBtn}
              onPress={() => setAccountDetailsVisible(false)}
            >
              <Text style={styles.doneBtnText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* MODAL 6: Info Modal (Contact / Terms / Privacy / Help) */}
      <Modal
        visible={!!infoModalContent}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setInfoModalContent(null)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.infoSheetCard}>
            <Text style={styles.dialogTitle}>{infoModalContent?.title}</Text>
            <ScrollView style={{ maxHeight: 280 }} showsVerticalScrollIndicator={false}>
              <Text style={styles.infoModalText}>{infoModalContent?.text}</Text>
            </ScrollView>
            <TouchableOpacity
              style={styles.doneBtn}
              onPress={() => setInfoModalContent(null)}
            >
              <Text style={styles.doneBtnText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* MODAL 7: Logout Confirmation Sheet (Matching Reference Pic 2) */}
      <Modal
        visible={logoutModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setLogoutModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalBackdrop}
          activeOpacity={1}
          onPress={() => setLogoutModalVisible(false)}
        >
          <View style={styles.logoutSheet}>
            <View style={styles.sheetHandle} />

            <Text style={styles.logoutSheetTitle}>Logout</Text>

            <View style={styles.logoutDivider} />

            <Text style={styles.logoutQuestion}>
              Are you sure you want to log out?
            </Text>

            <View style={styles.logoutButtonsRow}>
              {/* Cancel Button */}
              <TouchableOpacity
                style={styles.logoutCancelBtn}
                activeOpacity={0.8}
                onPress={() => setLogoutModalVisible(false)}
              >
                <Text style={styles.logoutCancelText}>Cancel</Text>
              </TouchableOpacity>

              {/* Yes, Logout Button */}
              <TouchableOpacity
                style={styles.logoutConfirmBtn}
                activeOpacity={0.8}
                onPress={() => {
                  setLogoutModalVisible(false);
                  if (onLogout) onLogout();
                }}
              >
                <Text style={styles.logoutConfirmText}>Yes, Logout</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F1F5F9', // Clean light gray/slate matching reference background
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingTop: Platform.OS === 'android' ? 16 : 14,
    paddingBottom: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.3,
  },
  moreButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  scrollContent: {
    paddingHorizontal: SPACING.md,
    paddingBottom: 40,
  },

  /* User Profile Card */
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 18,
    marginTop: 6,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 14,
  },
  avatarImage: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#E2E8F0',
  },
  avatarPlaceholder: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#E0F2F1',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#80CBC4',
  },
  avatarText: {
    fontSize: 22,
    fontWeight: '800',
    color: '#004D40',
  },
  cameraBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  cameraBadgeText: {
    fontSize: 10,
  },
  userInfoCol: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 2,
  },
  userSubtitle: {
    fontSize: 13,
    color: '#64748B',
  },
  editNameButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },

  /* Menu Groups */
  menuGroupCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingVertical: 6,
    paddingHorizontal: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
  },
  menuIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  menuTextCol: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0F172A',
  },
  menuSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  menuDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginLeft: 50,
  },

  /* Modals Common */
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'flex-end',
  },
  actionSheetCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: SPACING.lg,
    paddingTop: 12,
    paddingBottom: 32,
  },
  sheetHandle: {
    width: 44,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#CBD5E1',
    alignSelf: 'center',
    marginBottom: 16,
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    textAlign: 'center',
    marginBottom: 16,
  },
  sheetOption: {
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  sheetOptionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0F172A',
  },
  sheetCancelOption: {
    marginTop: 10,
    borderBottomWidth: 0,
    alignItems: 'center',
  },
  sheetCancelText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#64748B',
  },

  /* Full Photo View */
  fullPhotoBackdrop: {
    flex: 1,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeFullPhotoBtn: {
    position: 'absolute',
    top: 48,
    right: 20,
    zIndex: 10,
    padding: 10,
  },
  fullPhotoImage: {
    width: '90%',
    height: '70%',
    borderRadius: 16,
  },

  /* Edit Name Modal */
  editNameCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: SPACING.lg,
    paddingBottom: 32,
  },
  dialogTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
  },
  dialogSubtitle: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 16,
  },
  textInput: {
    height: 50,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#00897B',
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#0F172A',
    backgroundColor: '#F8FAFC',
    marginBottom: 18,
  },
  dialogButtonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelBtn: {
    flex: 1,
    height: 48,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#64748B',
  },
  confirmBtn: {
    flex: 1,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#00897B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  /* Liked Activities Modal Sheet */
  likedSheetCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: SPACING.lg,
    maxHeight: '80%',
    minHeight: 380,
  },
  sheetHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  likedHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  likedTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  closeModalBtn: {
    padding: 6,
  },
  likedSubtitle: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 16,
  },
  likedListScroll: {
    marginVertical: 4,
  },
  emptyLikedBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyLikedIcon: {
    fontSize: 36,
    marginBottom: 10,
  },
  emptyLikedTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4,
  },
  emptyLikedDesc: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  likedItemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  likedItemInfo: {
    flex: 1,
    marginRight: 10,
  },
  likedItemName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 3,
  },
  likedItemMeta: {
    fontSize: 11,
    fontWeight: '600',
    color: '#00897B',
  },

  /* Detail Rows for Account Info */
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  detailLabel: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 15,
    color: '#0F172A',
    fontWeight: '700',
  },
  doneBtn: {
    marginTop: 20,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#00897B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  doneBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  infoSheetCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: SPACING.lg,
    paddingBottom: 32,
  },
  infoModalText: {
    fontSize: 14,
    color: '#334155',
    lineHeight: 22,
    marginVertical: 10,
  },

  /* LOGOUT SHEET (Matching Reference Pic 2) */
  logoutSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: SPACING.lg,
    paddingTop: 12,
    paddingBottom: 36,
  },
  logoutSheetTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    textAlign: 'center',
    marginVertical: 12,
  },
  logoutDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginBottom: 20,
  },
  logoutQuestion: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 24,
  },
  logoutButtonsRow: {
    flexDirection: 'row',
    gap: 14,
  },
  logoutCancelBtn: {
    flex: 1,
    height: 48,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  logoutCancelText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  logoutConfirmBtn: {
    flex: 1,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.primary, // Brand vibrant teal-green #00897B
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutConfirmText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
