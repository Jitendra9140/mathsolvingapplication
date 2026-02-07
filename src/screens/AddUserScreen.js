import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Image,
  TouchableOpacity,
  FlatList,
  ScrollView,
  Dimensions,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import messaging from '@react-native-firebase/messaging';
import LinearGradient from 'react-native-linear-gradient';
import { useTheme } from '../context/ThemeContext';
import CustomHeader from '../components/CustomHeader';
import { useTranslation } from 'react-i18next';

const { width, height } = Dimensions.get('window');
const scale = size => (width / 375) * size;
const scaleFont = size => size * (width / 375);

const AddUserScreen = () => {
  const navigation = useNavigation();
  const isFocused = useIsFocused();
  const { theme } = useTheme();
  const { t } = useTranslation();

  const [refreshing, setRefreshing] = useState(false);
  const [myFriends, setMyFriends] = useState([]); // Store friends separately
  const [displayedUsers, setDisplayedUsers] = useState([]); // Users shown in list
  const [searchText, setSearchText] = useState('');
  const [loading, setLoading] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);

  const onRefresh = () => {
    setRefreshing(true);
    fetchPendingCount();
    if (searchText.trim() !== '') {
      fetchSearchedUsers(searchText);
    } else {
      fetchMyFriends();
    }
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  };

  /* ================= API CALLS ================= */

  const fetchPendingCount = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      const response = await axios.get(
        'http://43.204.167.118:3000/api/friend/friend-request',
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      setPendingCount(response.data.total);
    } catch (error) {
      console.log('❌ Error fetching pending count:', error.message);
    }
  };

  // 🔹 FETCH MY FRIENDS (Default View)
  const fetchMyFriends = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('authToken');
      if (!token) {
        console.log('❌ No Auth Token found');
        setLoading(false);
        return;
      }

      const response = await axios.get(
        'http://43.204.167.118:3000/api/friend/my-friend-list',
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
        }
      );

      if (response.data.success) {
        console.log('🔹 My Friends API Response:', JSON.stringify(response.data, null, 2));
        // Adjust based on actual API response structure. 
        const friendsList = response.data.friends || [];
        console.log('🔹 Friends List Extracted:', friendsList);
        // Important: Ensure friendshipStatus is 'accepted' for these
        const formattedFriends = friendsList.map(f => ({ ...f, friendshipStatus: 'accepted' }));

        setMyFriends(formattedFriends);
        if (searchText.trim() === '') {
          setDisplayedUsers(formattedFriends);
        }
      }
    } catch (error) {
      console.log('❌ Error fetching friends:', error.message);
    } finally {
      setLoading(false);
    }
  };

  // 🔹 SEARCH ALL USERS
  const fetchSearchedUsers = async text => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('authToken');
      console.log('🔹 Search Text:', token);
      const response = await axios.post(
        'http://43.204.167.118:3000/api/friend/search-user-list',
        { searchText: text },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        },
      );

      if (response.data.success) {
        console.log('🔍 Search API Response:', JSON.stringify(response.data, null, 2));
        setDisplayedUsers(response.data.users);
      }
    } catch (error) {
      console.log('❌ Error searching users:', error.message);
    } finally {
      setLoading(false);
    }
  };

  /* ================= ACTIONS ================= */

  const handleAddFriend = async recipientId => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      const user = await AsyncStorage.getItem('userData');
      if (!token || !user) return;

      const parsedUser = JSON.parse(user);
      const requesterId = parsedUser?.id || parsedUser?._id;

      if (!requesterId || !recipientId) return;

      const payload = {
        requester: requesterId,
        recipient: recipientId,
      };

      const response = await fetch(
        'http://43.204.167.118:3000/api/friend/add-friend',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        },
      );

      const data = await response.json();

      if (data.success) {
        Toast.show({ type: 'success', text1: t('friends.requestSent') });
        // Update specific user in the list
        setDisplayedUsers(prev =>
          prev.map(u =>
            u._id === recipientId ? { ...u, friendshipStatus: 'pending' } : u,
          ),
        );
      } else {
        Toast.show({ type: 'error', text1: t('errors.somethingWentWrong'), text2: data.message });
      }
    } catch (error) {
      console.log('Error sending friend request:', error);
    }
  };

  const handleCancelRequest = async (friendId) => {
    // console.log("🔍 UserProfile Response:", friendId);
    try {
      // Optimistic Update
      setDisplayedUsers(prev =>
        prev.map(u =>
          u._id === friendId ? { ...u, friendshipStatus: 'none' } : u,
        ),
      );

      const token = await AsyncStorage.getItem('authToken');
      const response = await axios.delete(
        'http://43.204.167.118:3000/api/friend/deleteFriendShipByUser',
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          data: { friendId } // DELETE body often needs 'data' key in axios
        }
      );

      if (response.data.success) {
        Toast.show({ type: 'success', text1: t('friends.requestCancelled') });
      } else {
        // Revert if failed
        Toast.show({ type: 'error', text1: t('friends.failedToCancel') });
        fetchSearchedUsers(searchText); // Refresh to get true state
      }

    } catch (error) {
      console.log("❌ Error cancelling request:", error);
      Toast.show({ type: 'error', text1: t('friends.errorCancelling') });
    }
  }

  const handleSearch = text => {
    setSearchText(text);
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchText.trim() === '') {
        fetchMyFriends();
      } else {
        // Only search if text is present to avoid empty search calls if trim() check fails
        fetchSearchedUsers(searchText);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchText]);

  /* ================= UI RENDER ================= */

  const renderItem = ({ item }) => {
    const status = item.friendshipStatus; // 'accepted', 'pending', 'none'/null

    const fullName =
      item.firstName || item.lastName
        ? `${item.firstName || ''} ${item.lastName || ''}`.trim()
        : `null`;

    // Only show country if available
    const userCountry = item.country;

    return (
      <View
        style={[
          styles.friendRow,
          { backgroundColor: theme.backgroundGradient || '#1E293B' },
        ]}>
        <TouchableOpacity
          style={styles.friendInfo}
          onPress={() => navigation.navigate('UserProfile', { userId: item._id })}
        >

          <Image
            source={
              item.profileImage
                ? { uri: item.profileImage }
                : require('../assets/avater.png')
            }
            style={styles.avatar}
          />

          <View>
            <View style={{ flexDirection: 'row' }}>
              <Text style={[styles.usernameText, { color: theme.subText }]}>
                {t('friends.username')}:{' '}
              </Text>
              <Text style={[styles.usernameText1, { color: theme.text }]}>
                {item.username}
              </Text>
            </View>

            <View style={{ flexDirection: 'row' }}>
              <Text style={[styles.nameText, { color: theme.subText }]}>
                {t('friends.name')}:{' '}
              </Text>
              <Text style={[styles.usernameText1, { color: theme.text }]}>
                {fullName}
              </Text>
            </View>

            {/* Show PvP Rating instead of Country */}
            {(() => {
              const pvpStats = item.pr?.find(p => p.mode === 'pvp');
              const pvpRating = pvpStats?.medium || 'N/A';
              return (
                <View style={{ flexDirection: 'row' }}>
                  <Text style={[styles.ratingText, { color: theme.subText }]}>
                    {t('friends.pvpRating')}:{' '}
                  </Text>
                  <Text style={[styles.usernameText1, { color: theme.text }]}>
                    {pvpRating}
                  </Text>
                </View>
              );
            })()}
          </View>
        </TouchableOpacity>

        {/* BUTTON ACTIONS */}
        {status === 'accepted' ? (
          <View
            style={[
              styles.statusButton,
              { roomId: 'transparent' }, // No background for text status or subtle
            ]}>
            <Text style={[styles.statusText, { color: '#4ADE80' }]}>{t('friends.friend')}</Text>
          </View>
        ) : status === 'pending' ? (
          <TouchableOpacity
            style={[
              styles.addButton,
              { backgroundColor: theme.secondary || '#64748B' },
            ]}
            onPress={() => handleCancelRequest(item._id)}>
            {/* Click to Cancel */}
            <Text style={styles.addText}>{t('friends.pending')}</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[
              styles.addButton,
              { backgroundColor: theme.primary || '#17677F' },
            ]}
            onPress={() => handleAddFriend(item._id)}>
            <Text style={styles.addText}>+</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };


  useEffect(() => {
    if (isFocused) {
      if (searchText.trim() === '') {
        fetchMyFriends();
      } else {
        fetchSearchedUsers(searchText);
      }
      fetchPendingCount();
    }
  }, [isFocused]);

  useEffect(() => {
    const auth = messaging();
    const unsubscribe = auth.onMessage(async remoteMessage => {
      const { data } = remoteMessage;
      if (!data) return;

      const userData = await AsyncStorage.getItem('fullLoginResponse');
      const parsedData = userData ? JSON.parse(userData) : null;
      const myUserId = parsedData?.player?.id;
      if (!myUserId) return;

      const { requester, recipient, type } = data;

      if (type === 'FRIEND_ACCEPTED' || type === 'FRIEND_REJECTED') {
        // Refresh list to show new friend or removed status
        if (searchText.trim() !== '') fetchSearchedUsers(searchText);
        else fetchMyFriends();
        fetchPendingCount();
      }

      if (type === 'FRIEND_REQUEST' && recipient === myUserId) {
        fetchPendingCount();
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <LinearGradient
      colors={theme.backgroundGradient || ['#0F172A', '#1E293B']}
      style={{ flex: 1, }}>
      <View style={{ flex: 1, paddingTop: height * 0.03 }}>
        <CustomHeader
          title={t('menu.friends').toUpperCase()}
          onBack={() => navigation.goBack()}
          rightIcon={
            <View style={styles.notificationContainer}>
              <TouchableOpacity
                onPress={() => navigation.navigate('FriendRequestScreen')}>
                <Icon
                  name="notifications-outline"
                  size={scale(22)}
                  color={theme.text || '#fff'}
                />
              </TouchableOpacity>
              <View
                style={[
                  styles.badge,
                  { backgroundColor: theme.error || '#EF4444' },
                ]}>
                <Text style={styles.badgeText}>{pendingCount || 0}</Text>
              </View>
            </View>
          }
        />

        <View style={[styles.container, { paddingTop: 0 }]}>
          {/* Main content now inside container with padding */}

          {/* 🔍 Search */}
          <View style={{ top: 20, flex: 1 }}>

            <View
              style={[
                styles.searchContainer,
                { backgroundColor: theme.cardBackground || '#1E293B' },
              ]}>
              <Icon
                name="search"
                size={scale(22)}
                color={theme.subText || '#94A3B8'}
              />
              <TextInput
                placeholder={t('friends.searchPlaceholder')}
                placeholderTextColor={theme.subText || '#94A3B8'}
                style={[styles.searchInput, { color: theme.text }]}
                value={searchText}
                onChangeText={handleSearch}
              />
            </View>

            {loading ? (
              <ActivityIndicator
                size="large"
                color={theme.primary || '#FB923C'}
                style={{ marginTop: height * 0.05 }}
              />
            ) : (
              <>
                {searchText.trim() === '' && (
                  <View
                    style={[
                      styles.inviteSection,
                      { backgroundColor: theme.cardBackground || '#1E293B' },
                    ]}>
                    <Text style={[styles.sectionTitle, { color: theme.text }]}>
                      {t('friends.inviteConnect')}
                    </Text>

                    <TouchableOpacity
                      style={[styles.inviteButton1, { backgroundColor: '#25D366' }]}>
                      <FontAwesome
                        name="whatsapp"
                        size={scale(20)}
                        color="#fff"
                        style={styles.iconLeft}
                      />
                      <Text style={styles.inviteText}>
                        {t('friends.inviteViaWhatsApp')}
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[
                        styles.inviteButton,
                        { backgroundColor: theme.cardBackground || '#1E293B' },
                      ]}>
                      <View style={styles.fbIconCircle}>
                        <FontAwesome name="facebook" size={scale(22)} color="#fff" />
                      </View>
                      <Text style={[styles.inviteText, { color: theme.text }]}>
                        {t('friends.facebookFriends')}
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}

                <Text style={[styles.sectionTitle, { color: theme.text }]}>
                  {searchText.trim() !== '' ? t('friends.searchResults') : `${t('friends.myFriends')} (${displayedUsers.length})`}
                </Text>
                <ScrollView
                  refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                  }
                  showsVerticalScrollIndicator={false}>
                  <FlatList
                    data={displayedUsers}
                    keyExtractor={item => item._id}
                    renderItem={renderItem}
                    scrollEnabled={false}
                    contentContainerStyle={{ paddingBottom: height * 0.1 }}
                    ListEmptyComponent={
                      <View style={{ alignItems: 'center', marginTop: 20 }}>
                        <Text style={{ color: theme.subText }}>{t('friends.noUsersFound')}</Text>
                      </View>
                    }
                  />
                </ScrollView>
              </>
            )}
          </View>
        </View>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: width * 0.04,
    paddingTop: height * 0.03,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: height * 0.02,
  },
  leftHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: width * 0.3,
    borderRadius: 10,
    padding: width * 0.015,
  },
  header: {
    fontSize: scaleFont(18),
    fontWeight: '700',
  },
  notificationContainer: {
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -6,
    right: -8,
    borderRadius: 8,
    paddingHorizontal: 4,
    minWidth: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: '#fff',
    fontSize: scaleFont(10),
    fontWeight: '700',
  },
  searchContainer: {
    borderRadius: 8,
    marginBottom: height * 0.02,
    flexDirection: 'row',
    alignItems: 'center',
    paddingStart: '3%',
  },
  searchInput: {
    height: height * 0.055,
    paddingHorizontal: 12,
    flex: 1,
  },
  inviteSection: {
    borderRadius: 10,
    padding: width * 0.03,
    marginBottom: height * 0.03,
  },
  sectionTitle: {
    fontSize: scaleFont(16),
    fontWeight: '700',
    marginBottom: height * 0.015,
  },
  inviteButton1: {
    borderRadius: 8,
    paddingVertical: height * 0.012,
    paddingHorizontal: width * 0.03,
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: height * 0.012,
  },
  inviteButton: {
    borderRadius: 8,
    paddingVertical: height * 0.012,
    paddingHorizontal: width * 0.03,
    alignItems: 'center',
    flexDirection: 'row',
  },
  iconLeft: {
    marginRight: width * 0.03,
  },
  inviteText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: scaleFont(14),
  },
  fbIconCircle: {
    backgroundColor: '#1877F2',
    width: scale(34),
    height: scale(34),
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: width * 0.03,
  },
  friendRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 8,
    padding: width * 0.03,
    marginBottom: height * 0.015,
  },
  friendInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: scale(50),
    height: scale(50),
    marginRight: width * 0.03,
    borderRadius: 10
  },
  addButton: {
    borderRadius: 6,
    paddingHorizontal: width * 0.05,
    paddingVertical: height * 0.006,
  },
  statusButton: {
    borderRadius: 6,
    paddingHorizontal: width * 0.02,
    paddingVertical: height * 0.006,
  },
  addText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: scaleFont(14), // Resized for "Pending"
  },
  statusText: {
    fontWeight: 'bold',
    fontSize: scaleFont(14),
  },
  usernameText: {
    fontSize: scaleFont(13),
    fontWeight: '600',
  },
  usernameText1: {
    fontSize: scaleFont(13),
    fontWeight: 'bold',
  },
  nameText: {
    fontSize: scaleFont(12),
    marginTop: 2,
  },
  ratingText: {
    fontSize: scaleFont(11),
    marginTop: 2,
  },
});

export default AddUserScreen;

