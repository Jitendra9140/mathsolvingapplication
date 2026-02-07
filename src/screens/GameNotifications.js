import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
  PixelRatio,
  ScrollView,
  ActivityIndicator,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import Toast from 'react-native-toast-message';
import { useSocket } from '../context/Socket';
import { useTheme } from '../context/AuthProvider';
import { useTranslation } from 'react-i18next';

const { width, height } = Dimensions.get('window');
const scaleFont = size => size * PixelRatio.getFontScale();

if (Platform.OS === 'android') {
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
}

const GameNotifications = () => {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const socket = useSocket();
  const { t } = useTranslation();

  const [notifications, setNotifications] = useState([]); // Friend requests
  const [loading, setLoading] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const [challengeNotifications, setChallengeNotifications] = useState([]); // Challenges
  const [inAppNotifications, setInAppNotifications] = useState([]);

  // 1. Fetch Friend Request Notifications
  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('authToken');
      if (!token) return;

      const res = await axios.get(
        'http://43.204.167.118:3000/api/friend/friend-request',
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (res.data.success) {
        const mappedData = (res.data.requests || [])
          .filter(req => req.requester && req.requester._id)
          .map(req => ({
            id: `friend-${req.requester._id}`,
            user: req.requester.username || t('notifications.unknownUser'),
            time: req.createdAt,
            type: 'friend_request',
            message: t('notifications.friendRequestMessage'),
            fullMessage: `${t('notifications.user')} ${req.requester.username || t('notifications.unknown')
              } ${t('notifications.wantsToBeFriend')}`,
            actions: [t('friends.acceptRequest'), t('friends.declineRequest')],
            recipient: req.recipient,
            requesterId: req.requester._id,
          }));
        setNotifications(mappedData);
      }
    } catch (error) {
      console.log('Fetch Friend Notif Error:', error);
    } finally {
      setLoading(false);
    }
  };

  // 2. Fetch In-App Notifications
  const fetchInAppNotifications = async () => {
    try {
      const res = await axios.get(
        'https://mataletics-backend.onrender.com/api/notifications/in-app',
      );

      if (res.data?.success) {
        const mapped = (res.data.data || []).map((item, index) => ({
          id: `inapp-${index}-${Date.now()}`,
          user: item.title,
          time: item.date,
          type: 'in_app',
          message: item.body,
          fullMessage: item.body,
          image: item.image,
          actions: [],
        }));

        setInAppNotifications(mapped);
      }
    } catch (e) {
      console.log('In-app notif error:', e);
    }
  };

  // ✅ 3. Listen for Challenge Notifications from Socket
  useEffect(() => {
    if (!socket) {
      console.log('❌ Socket not available for challenge notifications');
      return;
    }

    console.log('✅ Setting up challenge notification listener');

    const onChallengeReceived = data => {
      console.log('📩 Challenge notification received:', data);

      const newChallenge = {
        id: `challenge-${data.challengeId}`,
        user: data.challenger.username,
        time: new Date().toISOString(),
        type: 'challenge_received',
        message: t('notifications.challengeMessage'),
        fullMessage: `${data.challenger.username
          } ${t('notifications.wantsToPlay')}: ${data.gameSettings.diff.toUpperCase()} ${t('difficulty.difficulty')}, ${data.gameSettings.timer
          }s ${t('game.timer')}`,
        actions: [t('friends.acceptRequest'), t('notifications.decline')],
        challengeData: data,
      };

      // ✅ Add to challenge notifications state
      setChallengeNotifications(prev => {
        console.log('Adding challenge to notifications list');
        return [newChallenge, ...prev];
      });

      // ✅ Show toast notification
      Toast.show({
        type: 'info',
        text1: t('notifications.gameChallenge'),
        text2: `${data.challenger.username} ${t('notifications.challengedYou')}`,
        position: 'top',
        visibilityTime: 4000,
      });
    };

    socket.on('challenge-received', onChallengeReceived);

    return () => {
      console.log('🧹 Cleaning up challenge listener');
      socket.off('challenge-received', onChallengeReceived);
    };
  }, [socket]);

  // ✅ 4. Initial Data Fetch
  useEffect(() => {
    console.log('📱 GameNotifications mounted, fetching data...');
    fetchNotifications();
    fetchInAppNotifications();
  }, []);

  // Helper: Relative Time
  const getRelativeTime = isoString => {
    const now = new Date();
    const past = new Date(isoString);
    const diffInSeconds = Math.floor((now - past) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `${diffInMinutes} min ago`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} hr ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 30) return `${diffInDays} d ago`;

    return past.toLocaleDateString();
  };

  // Handle Expand/Collapse
  const toggleExpand = id => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedId(prev => (prev === id ? null : id));
  };

  // ✅ Merge ALL notifications (Friend + Challenge + In-App)
  const allNotifications = [
    ...notifications,
    ...challengeNotifications,
    ...inAppNotifications,
  ].sort((a, b) => new Date(b.time) - new Date(a.time));

  console.log('📊 Total notifications:', {
    friends: notifications.length,
    challenges: challengeNotifications.length,
    inApp: inAppNotifications.length,
    total: allNotifications.length,
  });

  // Handle Actions
  const handleAction = async (notification, actionType) => {
    console.log(
      '🎬 Action triggered:',
      actionType,
      'for type:',
      notification.type,
    );

    // ✅ Handle FRIEND REQUESTS
    if (notification.type === 'friend_request') {
      try {
        const token = await AsyncStorage.getItem('authToken');
        const url =
          actionType === 'Accept'
            ? 'http://43.204.167.118:3000/api/friend/accept-friend'
            : 'http://43.204.167.118:3000/api/friend/reject-friend';

        // Optimistic UI update
        setNotifications(prev => prev.filter(n => n.id !== notification.id));

        await axios.post(
          url,
          {
            requester: notification.requesterId,
            recipient: notification.recipient,
          },
          { headers: { Authorization: `Bearer ${token}` } },
        );

        Toast.show({
          type: 'success',
          text1: `${t('friends.friendRequest')} ${actionType}ed`,
        });
      } catch (error) {
        console.error('Friend request action error:', error);
        Toast.show({ type: 'error', text1: t('notifications.actionFailed') });
        fetchNotifications();
      }
    }

    // ✅ Handle GAME CHALLENGES
    if (notification.type === 'challenge_received') {
      if (!socket || !socket.connected) {
        Toast.show({ type: 'error', text1: t('notifications.connectionError') });
        return;
      }

      // Optimistic UI update - remove notification immediately
      setChallengeNotifications(prev =>
        prev.filter(n => n.id !== notification.id),
      );

      if (actionType === 'Accept') {
        console.log(
          '✅ Accepting challenge:',
          notification.challengeData.challengeId,
        );

        socket.emit('accept-challenge', {
          challengeId: notification.challengeData.challengeId,
        });

        // Listen for challenge accepted confirmation
        const handleChallengeAccepted = data => {
          console.log('✅ Challenge accepted response:', data);

          Toast.show({
            type: 'success',
            text1: t('notifications.challengeAccepted'),
            text2: t('notifications.startingGame'),
          });

          // Navigate to game
          setTimeout(() => {
            navigation.navigate('PlayGame', {
              gameRoom: data.gameRoom,
              opponent: data.opponent,
              myPlayerId: data.myPlayerId,
              initialQuestionMeter: data.initialQuestionMeter,
            });
          }, 500);
        };

        socket.once('challenge-accepted', handleChallengeAccepted);

        // Backup listener for game-started
        socket.once('game-started', data => {
          console.log('🎮 Game started event');
        });
      } else if (actionType === 'Decline') {
        console.log(
          '❌ Declining challenge:',
          notification.challengeData.challengeId,
        );

        socket.emit('decline-challenge', {
          challengeId: notification.challengeData.challengeId,
        });

        Toast.show({
          type: 'info',
          text1: t('notifications.challengeDeclined'),
        });
      }
    }
  };

  // ---------- COMPONENTS ----------

  const ActionButton = ({ type, action, notification }) => {
    if (type === 'friend_request') {
      const isAccept = action === 'Accept';
      return (
        <TouchableOpacity
          onPress={() => handleAction(notification, action)}
          style={styles.actionIconWrapper}>
          <MaterialCommunityIcons
            name={isAccept ? 'check-circle' : 'close-circle'}
            size={scaleFont(30)}
            color={isAccept ? '#10B981' : '#EF4444'}
          />
        </TouchableOpacity>
      );
    }

    if (type === 'challenge_received') {
      const isAccept = action === 'Accept';
      return (
        <TouchableOpacity
          onPress={() => handleAction(notification, action)}
          style={[
            styles.challengeActionButton,
            isAccept ? styles.acceptButton : styles.declineButton,
          ]}>
          <Text style={styles.challengeActionText}>{action}</Text>
        </TouchableOpacity>
      );
    }

    return null;
  };

  const NotificationCard = ({ data }) => {
    const isExpanded = expandedId === data.id;

    return (
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => toggleExpand(data.id)}
        style={[
          styles.notificationCard,
          {
            backgroundColor: theme.cardBackground || '#1E293B',
            borderColor: theme.borderColor || '#334155',
          },
          data.type === 'challenge_received' && styles.challengeCard,
        ]}>
        {/* Header */}
        <View style={styles.cardHeader}>
          <View style={styles.userSection}>
            {data.type === 'challenge_received' && (
              <Text style={styles.challengeBadge}>🎮</Text>
            )}
            {data.type === 'friend_request' && (
              <Text style={styles.challengeBadge}>👥</Text>
            )}
            <Text style={[styles.username, { color: theme.text }]}>
              {data.user}
            </Text>
          </View>
          <View style={styles.headerRight}>
            <Text style={[styles.time, { color: theme.subText || '#94A3B8' }]}>
              {getRelativeTime(data.time)}
            </Text>
            <MaterialCommunityIcons
              name={isExpanded ? 'chevron-up' : 'chevron-down'}
              size={scaleFont(20)}
              color={theme.text}
            />
          </View>
        </View>

        {/* Body */}
        <View style={styles.cardBody}>
          <Text style={[styles.message, { color: theme.text }]}>
            {data.message}
          </Text>

          {/* Action Buttons */}
          {data.actions && data.actions.length > 0 && (
            <View style={styles.actionsRow}>
              {data.actions.map((act, idx) => (
                <ActionButton
                  key={idx}
                  type={data.type}
                  action={act}
                  notification={data}
                />
              ))}
            </View>
          )}
        </View>

        {/* Expanded Content */}
        {isExpanded && (
          <View style={styles.expandedContent}>
            <Text style={[styles.detailText, { color: theme.subText || '#ccc' }]}>
              {data.fullMessage}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const Content = () => (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}>
          <Ionicons
            name="caret-back-outline"
            size={scaleFont(28)}
            color={theme.text || 'black'}
          />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text || 'black' }]}>
          {t('notifications.notifications')}
        </Text>
        <View style={styles.rightPlaceholder} />
      </View>
      <View style={styles.headerSeparator} />

      {/* Notification Count Badge */}
      {allNotifications.length > 0 && (
        <View style={styles.countBadge}>
          <Text style={styles.countText}>
            {allNotifications.length} {t('notifications.notification')}
            {allNotifications.length !== 1 ? 's' : ''}
          </Text>
        </View>
      )}

      {/* List */}
      {loading ? (
        <ActivityIndicator
          size="large"
          color={theme.primary}
          style={{ marginTop: 50 }}
        />
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          style={styles.notificationsList}>
          {allNotifications.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>🔔</Text>
              <Text style={[styles.emptyText, { color: theme.subText }]}>
                {t('notifications.noNewNotifications')}
              </Text>
              <Text style={[styles.emptySubtext, { color: theme.subText }]}>
                {t('notifications.allCaughtUp')}
              </Text>
            </View>
          ) : (
            allNotifications.map(n => <NotificationCard key={n.id} data={n} />)
          )}
          <View style={{ height: 30 }} />
        </ScrollView>
      )}
      <Toast />
    </SafeAreaView>
  );

  return theme.backgroundGradient ? (
    <LinearGradient colors={theme.backgroundGradient} style={{ flex: 1 }}>
      <Content />
    </LinearGradient>
  ) : (
    <View
      style={{ flex: 1, backgroundColor: theme.backgroundColor || '#f4f4f4' }}>
      <Content />
    </View>
  );
};

export default GameNotifications;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: width * 0.05,
    paddingTop: height * 0.03,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: height * 0.01,
    paddingBottom: height * 0.03,
  },
  headerTitle: {
    fontSize: scaleFont(22),
    fontWeight: '800',
    flex: 1,
    textAlign: 'center',
  },
  backButton: {
    paddingRight: 15,
    flex: 0.15,
  },
  rightPlaceholder: {
    flex: 0.15,
  },
  headerSeparator: {
    height: 1,
    backgroundColor: '#94A3B8',
    opacity: 0.5,
    marginHorizontal: -width * 0.05,
    marginBottom: height * 0.02,
  },
  countBadge: {
    backgroundColor: 'rgba(0, 224, 255, 0.1)',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginBottom: height * 0.02,
  },
  countText: {
    color: '#00e0ff',
    fontSize: scaleFont(13),
    fontWeight: '600',
  },
  notificationsList: {
    flex: 1,
  },
  notificationCard: {
    padding: 15,
    borderWidth: 1,
    borderRadius: 12,
    marginBottom: height * 0.02,
    overflow: 'hidden',
  },
  challengeCard: {
    borderColor: '#00e0ff',
    borderWidth: 2,
    backgroundColor: 'rgba(0, 224, 255, 0.05)',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  userSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  challengeBadge: {
    fontSize: scaleFont(18),
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  username: {
    fontSize: scaleFont(16),
    fontWeight: '700',
    flexShrink: 1,
  },
  time: {
    fontSize: scaleFont(12),
  },
  cardBody: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 5,
    gap: 10,
  },
  message: {
    fontSize: scaleFont(14),
    flex: 1,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  actionIconWrapper: {
    padding: 2,
  },
  challengeActionButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    minWidth: 65,
    alignItems: 'center',
  },
  acceptButton: {
    backgroundColor: '#10B981',
  },
  declineButton: {
    backgroundColor: '#EF4444',
  },
  challengeActionText: {
    color: '#fff',
    fontSize: scaleFont(13),
    fontWeight: '600',
  },
  expandedContent: {
    marginTop: 15,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  detailText: {
    fontSize: scaleFont(13),
    fontStyle: 'italic',
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: height * 0.2,
  },
  emptyIcon: {
    fontSize: scaleFont(50),
    marginBottom: 15,
  },
  emptyText: {
    textAlign: 'center',
    fontSize: scaleFont(18),
    fontWeight: '600',
  },
  emptySubtext: {
    textAlign: 'center',
    fontSize: scaleFont(14),
    marginTop: 5,
  },
});
