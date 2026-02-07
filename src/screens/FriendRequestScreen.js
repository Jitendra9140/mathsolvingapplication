import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Image,
  Dimensions,
  PixelRatio,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import Icon from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/FontAwesome';
import { useNavigation } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import LinearGradient from 'react-native-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import CustomHeader from '../components/CustomHeader';
import { useTranslation } from 'react-i18next';

const { width, height } = Dimensions.get('window');
const guidelineBaseWidth = 375;
const guidelineBaseHeight = 812;

const scale = size => (width / guidelineBaseWidth) * size;
const verticalScale = size => (height / guidelineBaseHeight) * size;
const scaleFont = size =>
  Math.round(PixelRatio.roundToNearestPixel(size * (width / guidelineBaseWidth)));

const FriendRequestScreen = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();
  const fetchCalled = useRef(false);
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();

  const fetchFriendRequests = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('authToken');
      if (!token) {
        Toast.show({
          type: 'error',
          text1: t('errors.authError'),
          text2: t('auth.loginError'),
        });
        return;
      }

      const response = await axios.get(
        'http://43.204.167.118:3000/api/friend/friend-request',
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        },
      );

      if (response.data.success) {
        setRequests(response.data.requests || []);
      } else if (response.data.message === 'No friend requests received') {
        setRequests([]);
      } else {
        Toast.show({
          type: 'error',
          text1: t('friends.failedToLoad'),
          text2: response.data.message || t('errors.somethingWentWrong'),
        });
      }
    } catch (error) {
      console.log('Error fetching friend requests:', error);
      Toast.show({
        type: 'error',
        text1: t('errors.networkError'),
        text2: t('friends.unableToFetch'),
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (requesterId, recipientId, actionType) => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (!token) return;

      const url =
        actionType === 'accepted'
          ? 'http://43.204.167.118:3000/api/friend/accept-friend'
          : 'http://43.204.167.118:3000/api/friend/reject-friend';

      setRequests(prev =>
        prev.map(req =>
          req.requester._id === requesterId ? { ...req, processing: true } : req,
        ),
      );

      const response = await axios.post(
        url,
        { requester: requesterId, recipient: recipientId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        },
      );

      if (response.data.success) {
        Toast.show({
          type: 'success',
          text1:
            actionType === 'accepted'
              ? t('friends.requestAccepted') + ' 🎉'
              : t('friends.requestRejected') + ' ❌',
        });
        setRequests(prev =>
          prev.filter(req => req.requester._id !== requesterId),
        );
      } else {
        Toast.show({
          type: 'error',
          text1: response.data.message || t('friends.failedToUpdate'),
        });
        setRequests(prev =>
          prev.map(req =>
            req.requester._id === requesterId
              ? { ...req, processing: false }
              : req,
          ),
        );
      }
    } catch (error) {
      const msg = error.response?.data?.message;
      Toast.show({
        type: 'error',
        text1: msg || t('errors.somethingWentWrong'),
      });
      console.log('Error handling request:', error);
      setRequests(prev =>
        prev.map(req =>
          req.requester._id === requesterId ? { ...req, processing: false } : req,
        ),
      );
    }
  };

  useEffect(() => {
    if (!fetchCalled.current) {
      fetchCalled.current = true;
      fetchFriendRequests();
    }
  }, []);

  const renderItem = ({ item }) => {
    const user = item.requester;

    const fullName =
      user.firstName || user.lastName
        ? `${user.firstName || ''} ${user.lastName || ''}`.trim()
        : user.username;
    return (
      <View
        style={[
          styles.card,
          { backgroundColor: theme.cardBackground || '#1E293B' },
        ]}>
        <View style={styles.row}>
          <View
            style={[
              styles.leftBox,
              { borderColor: theme.border || '#94A3B8' },
            ]}>
            <Image
              source={
                user.profileImage
                  ? { uri: user.profileImage }
                  : require('../assets/avater.png')
              }
              style={styles.avatar}
            />
          </View>

          <View style={styles.infoBox}>
            <View style={styles.infoRow}>
              <Text style={[styles.label, { color: theme.subText }]}>
                {t('friends.username')}:{' '}
              </Text>
              <Text style={[styles.label, { color: theme.text }]}>
                {item.requester?.username}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={[styles.label, { color: theme.subText }]}>{t('friends.name')}: </Text>
              <Text style={[styles.label, { color: theme.text }]}> {fullName}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={[styles.label, { color: theme.subText }]}>{t('profile.rating')}: </Text>
              <Text style={[styles.label, { color: theme.text }]}>1000</Text>
            </View>
          </View>

          <View style={styles.iconBox}>
            <TouchableOpacity
              disabled={item.processing}
              onPress={() =>
                handleAction(item.requester._id, item.recipient, 'accepted')
              }>
              <MaterialIcons
                name="check"
                size={scaleFont(24)}
                color={'#177f57ff'}
                style={{ marginBottom: verticalScale(6) }}
              />
            </TouchableOpacity>
            <TouchableOpacity
              disabled={item.processing}
              onPress={() =>
                handleAction(item.requester._id, item.recipient, 'rejected')
              }>
              <MaterialIcons
                name="close"
                size={scaleFont(24)}
                color={'#EF4444'}
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  return (
    <LinearGradient
      colors={theme.backgroundGradient || ['#0F172A', '#1E293B']}
      style={{ flex: 1 }}>
      <View style={{ flex: 1, paddingTop: insets.top + 30 }}>
        <CustomHeader
          title={t('friends.pendingRequests')}
          onBack={() => navigation.goBack()}
        />

        <View style={styles.contentContainer}>
          <View
            style={[
              styles.titleContainer,
              { backgroundColor: theme.cardBackground || '#1E293B' },
            ]}>
            <Text style={[styles.titleText, { color: theme.text }]}>
              {t('friends.pendingRequests')} ({requests.length})
            </Text>
          </View>

          {loading ? (
            <ActivityIndicator
              color={theme.primary || '#FB923C'}
              size="large"
              style={{ marginTop: verticalScale(40) }}
            />
          ) : (
            <FlatList
              data={requests}
              keyExtractor={item => item._id}
              renderItem={renderItem}
              ListEmptyComponent={
                <Text style={[styles.emptyText, { color: theme.subText }]}>
                  {t('friends.noPendingRequests')}
                </Text>
              }
              contentContainerStyle={{ paddingBottom: verticalScale(60) }}
              showsVerticalScrollIndicator={false}
            />
          )}
        </View>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  contentContainer: {
    flex: 1,
    paddingHorizontal: scale(16),
  },

  titleContainer: {
    paddingVertical: verticalScale(10),
    paddingHorizontal: scale(10),
    borderRadius: scale(6),
    marginBottom: verticalScale(12),
  },
  titleText: {
    fontSize: scaleFont(15),
    fontWeight: '600',
  },
  card: {
    borderRadius: scale(8),
    borderWidth: 1,
    marginBottom: verticalScale(12),
    padding: scale(15),
    borderColor: '#334155',
    top: verticalScale(12)
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  leftBox: {
    width: scale(60),
    height: scale(60),
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: scale(10),
    borderRadius: scale(15),
    borderWidth: 1,
  },
  avatar: {
    width: '80%',
    height: '80%',
    resizeMode: 'contain',
  },
  infoBox: {
    flex: 1,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: verticalScale(2),
  },
  label: {
    fontSize: scaleFont(12),
  },
  iconBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: verticalScale(15),
  },
  emptyText: {
    textAlign: 'center',
    marginTop: verticalScale(40),
    fontSize: scaleFont(15),
    fontWeight: 'bold',
  },
});

export default FriendRequestScreen;

