
import { useNavigation, useIsFocused } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Dimensions,
  PixelRatio,
  ScrollView,
  ActivityIndicator,
  Platform,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../context/ThemeContext';
import Geolocation from 'react-native-geolocation-service';
import { request, PERMISSIONS, RESULTS } from 'react-native-permissions';
import { CountryList } from '../utils/CountryList';
import CustomHeader from '../components/CustomHeader';

const { width, height } = Dimensions.get('window');
const scale = width / 375;
const normalize = size =>
  Math.round(PixelRatio.roundToNearestPixel(size * scale));

const ProfileScreen = () => {
  const Navigation = useNavigation();
  const isFocused = useIsFocused();
  const { t, i18n } = useTranslation();
  const { theme } = useTheme();

  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  /* ================= FETCH USER ================= */
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = await AsyncStorage.getItem('authToken');
        if (!token) {
          setLoading(false);
          return;
        }

        const response = await fetch(
          'http://43.204.167.118:3000/api/auth/getUser',
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );

        const result = await response.json();
        if (result.success) {
          setUserData(result.user);
        }
      } catch (e) {
        console.log(e);
      } finally {
        setLoading(false);
      }
    };

    if (isFocused) {
      fetchUserData();
    }
  }, [isFocused]);


  /* ================= HELPERS ================= */
  const formatDate = d => {
    if (!d) return t('common.na');
    const date = new Date(d);
    return `${date.getDate().toString().padStart(2, '0')}-${date.toLocaleString(
      i18n.language,
      { month: 'short' },
    )}-${date.getFullYear().toString().slice(-2)}`;
  };

  const getFlagFromCountryName = name => {
    if (!name) return '';
    // Normalize comparison (case-insensitive) just in case
    const country = CountryList.find(c => c.name.toLowerCase() === name.toLowerCase() || c.code.toLowerCase() === name.toLowerCase());
    return country ? country.flag : '🏳️'; // Return flag or a default if not found
  };

  // ✅ Main screen content separated for cleaner theme wrapping
  const Content = () => {
    const insets = useSafeAreaInsets(); // ✅ Hook moved here
    return (
      <View style={{ flex: 1, paddingTop: insets.top + 30 }}>
        {/* Header - Outside Padding */}
        <CustomHeader
          title={t('profile.profile').toUpperCase()}
          onBack={() => Navigation.goBack()}
          rightIcon={
            <TouchableOpacity
              onPress={() => {
                Navigation.navigate("UpdateProfile")
              }}>
              <FontAwesome5 name="user-edit" size={normalize(16)} color="#fff" />
            </TouchableOpacity>
          }
        />

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}>

          {loading ? (
            <ActivityIndicator
              size="large"
              color="#fff"
              style={{ marginTop: 50 }}
            />
          ) : (
            <View style={styles.profileSection}>
              {/* Profile Section */}
              <View style={styles.profileTop}>
                <View style={styles.imageContainer}>
                  <Image
                    source={
                      userData?.profileImage
                        ? { uri: userData.profileImage }
                        : require('../assets/dummyProfile.jpg')
                    }
                    style={styles.profileImage}
                  />

                </View>
                <View style={styles.profileText}>
                  <Text style={styles.userName}>
                    {userData?.username || t('common.unknown')}
                  </Text>
                  <Text style={styles.joinDate}>
                    {t('profile.joined')}{formatDate(userData?.createdAt)}
                  </Text>
                </View>
              </View>

              {/* Info */}
              <View style={styles.userInfo}>
                <Text style={styles.email}>
                  {t('profile.email')}:{' '}
                  <Text style={styles.emailText}>{userData?.email || t('common.na')}</Text>
                </Text>
                <Text style={styles.detail}>
                  {t('profile.firstName')}: {userData?.firstName || t('common.na')}
                </Text>
                <Text style={styles.detail}>
                  {t('profile.lastName')}: {userData?.lastName || t('common.na')}
                </Text>
                <Text style={styles.detail}>
                  <Text style={styles.detail}>
                    {t('date.yearOfBirth')} : {userData?.dateOfBirth ? new Date(userData.dateOfBirth).getFullYear() : t('common.na')}
                  </Text>

                </Text>
                <Text style={styles.detail}>
                  {t('profile.gender')}: {userData?.gender ? (userData.gender === 'other' ? t('gender.others') : t(`gender.${userData.gender}`)) : t('common.na')}
                </Text>
                {/* 🔥 LOCATION DISPLAY (ADDED) */}
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Text style={styles.detail}>{t('profile.country')}:</Text>

                  {userData?.country ? (
                    <View style={{ marginStart: 12, marginTop: -6 }}>
                      <Text style={{ fontSize: normalize(22) }}>
                        {getFlagFromCountryName(userData.country)}
                      </Text>
                    </View>
                  ) : (
                    <Text style={{ color: '#777', marginStart: 10 }}>
                      {t('common.notSet')}
                    </Text>
                  )}
                </View>

              </View>

              {/* Rank Tabs */}
              <View style={styles.tabRow}>
                {['E2', 'E4', 'M2', 'M4', 'H2', 'H4'].map((item, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[styles.tab, item === 'M4' && styles.activeTab]}>
                    <Text
                      style={[
                        styles.tabText,
                        item === 'M4' && styles.activeTabText,
                      ]}>
                      {item}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Rank Bar */}
              <View style={styles.rankContainer}>
                <Text style={styles.rankText}>{t('profile.currentRank')}: 10,456</Text>
                <View style={styles.rankBar}>
                  <View style={[styles.rankBarFillGreen, { width: '50%' }]} />
                  <View style={[styles.rankBarFillRed, { width: '45%' }]} />
                </View>
              </View>

              {/* Achievements */}
              <View style={styles.achievementsContainer}>
                <Text style={styles.achievementTitle}>{t('profile.achievements')}</Text>
                <View style={styles.achievementRow}>
                  {['Ach. 1', 'Ach. 2', 'Ach. 3', 'Ach. 4'].map((item, index) => (
                    <View key={index} style={styles.achievementBox}>
                      <Text style={styles.achievementText}>{item}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </View>
          )}
        </ScrollView>
      </View >
    );
  };

  // ✅ Apply theme background here
  return theme.backgroundGradient ? (
    <LinearGradient colors={theme.backgroundGradient} style={{ flex: 1 }}>
      <Content />
    </LinearGradient>
  ) : (
    <View
      style={{
        flex: 1,
        backgroundColor: theme.backgroundColor || '#0D0D26',
      }}>
      <Content />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: normalize(10) },
  scrollContent: {
    paddingBottom: normalize(30),
    paddingHorizontal: normalize(16),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: normalize(15),
  },
  headerTitle: { color: '#fff', fontSize: normalize(18), fontWeight: '700' },
  headerSeparator: {
    height: 1,
    backgroundColor: '#94A3B8',
    opacity: 0.5,
    top: 10,
    marginHorizontal: -width * 0.05,
    marginBottom: height * 0.02,
    bottom: '1%',
  },
  profileSection: { marginVertical: normalize(10) },
  profileTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: normalize(12),
  },
  imageContainer: {
    borderWidth: 2,
    borderColor: '#444',
    borderRadius: normalize(30),
    overflow: 'hidden',
  },
  profileImage: {
    width: normalize(70),
    height: normalize(70),
  },
  profileText: { marginLeft: normalize(30) },
  userName: {
    color: '#fff',
    fontSize: normalize(18),
    fontWeight: '600',
    marginBottom: normalize(4),
  },
  joinDate: { color: '#999', fontSize: normalize(12) },
  userInfo: { marginTop: normalize(10), alignItems: 'flex-start' },
  email: { color: '#bbb', fontSize: normalize(14), marginBottom: normalize(2) },
  emailText: { color: '#4da6ff' },
  detail: {
    color: '#ccc',
    fontSize: normalize(14),
    marginVertical: normalize(2),
  },
  tabRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: normalize(35),
  },
  tab: {
    flex: 1,
    paddingVertical: normalize(8),
    alignItems: 'center',
    marginHorizontal: normalize(2),
    backgroundColor: '#1b1b3a',
    borderRadius: normalize(6),
  },
  activeTab: { backgroundColor: '#4e54c8' },
  tabText: { color: '#bbb', fontSize: normalize(14) },
  activeTabText: { color: '#fff', fontWeight: '600' },
  rankContainer: { marginTop: normalize(28) },
  rankText: {
    color: '#fff',
    fontSize: normalize(13),
    textAlign: 'center',
    marginBottom: normalize(20),
  },
  rankBar: {
    flexDirection: 'row',
    height: normalize(8),
    borderRadius: 6,
    overflow: 'hidden',
  },
  rankBarFillGreen: { backgroundColor: '#4CAF50' },
  rankBarFillRed: { backgroundColor: '#F44336' },
  achievementsContainer: { marginTop: normalize(25) },
  achievementTitle: {
    color: '#fff',
    fontSize: normalize(14),
    marginBottom: normalize(10),
    textAlign: 'center',
  },
  achievementRow: { flexDirection: 'row', justifyContent: 'space-between' },
  achievementBox: {
    flex: 1,
    backgroundColor: '#1e1e40',
    paddingVertical: normalize(10),
    marginHorizontal: normalize(4),
    borderRadius: normalize(8),
    alignItems: 'center',
  },
  achievementText: { color: '#ddd', fontSize: normalize(12) },
});

export default ProfileScreen;

