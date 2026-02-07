import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Dimensions,
  PixelRatio,
  Modal,
  Animated,
  TouchableWithoutFeedback,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MaskedView from '@react-native-masked-view/masked-view';
import LinearGradient from 'react-native-linear-gradient';
import { useTheme } from '../context/ThemeContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSocket } from '../context/Socket';
import Toast from 'react-native-toast-message';
import { useTranslation } from 'react-i18next';

const { width, height } = Dimensions.get('window');
const scaleFont = size => size * PixelRatio.getFontScale();

const Home = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const socket = useSocket();
  const { t } = useTranslation();

  const [isMuted, setIsMuted] = useState(false);

  // ✅ Challenge Notification State
  const [showChallengePopup, setShowChallengePopup] = useState(false);
  const [challengeData, setChallengeData] = useState(null);
  const [popupAnimation] = useState(new Animated.Value(0));

  // ✅ Game Start Loading State
  const [waitingForGame, setWaitingForGame] = useState(false);

  // ✅ Listen for Challenge Received Event
  useEffect(() => {
    if (!socket) {
      console.log('❌ Socket not available for challenge notifications');
      return;
    }

    console.log('✅ Setting up challenge notification listener in Home');

    const onChallengeReceived = data => {
      console.log('📩 Challenge received in Home:', data);

      setChallengeData(data);
      setShowChallengePopup(true);

      // Animate popup in
      Animated.spring(popupAnimation, {
        toValue: 1,
        useNativeDriver: true,
        tension: 50,
        friction: 7,
      }).start();

      // Auto-hide after 60 seconds (challenge expiration time)
      setTimeout(() => {
        handleDismissPopup();
      }, 60000);
    };

    const onChallengeExpired = data => {
      console.log('⏱️ Challenge expired:', data);
      if (challengeData?.challengeId === data.challengeId) {
        handleDismissPopup();
        Toast.show({
          type: 'info',
          text1: t('multiplayer.challengeExpired'),
          text2: t('multiplayer.challengeExpired'),
        });
      }
    };

    const onChallengeCancelled = data => {
      console.log('🚫 Challenge cancelled:', data);
      if (challengeData?.challengeId === data.challengeId) {
        handleDismissPopup();
        Toast.show({
          type: 'info',
          text1: t('multiplayer.challengeCancelled'),
          text2: `${data.canceller?.username || t('multiplayer.opponent')
            } ${t('multiplayer.challengeCancelled')}`,
        });
      }
    };

    socket.on('challenge-received', onChallengeReceived);
    socket.on('challenge-expired', onChallengeExpired);
    socket.on('challenge-cancelled', onChallengeCancelled);

    return () => {
      console.log('🧹 Cleaning up challenge listeners in Home');
      socket.off('challenge-received', onChallengeReceived);
      socket.off('challenge-expired', onChallengeExpired);
      socket.off('challenge-cancelled', onChallengeCancelled);
    };
  }, [socket, challengeData]);

  // ✅ Handle Accept Challenge
  const handleAcceptChallenge = async () => {
    if (!socket || !socket.connected) {
      Toast.show({
        type: 'error',
        text1: t('notifications.connectionError'),
        text2: t('notifications.checkConnection'),
      });
      return;
    }

    console.log('✅ Accepting challenge:', challengeData.challengeId);

    // Close popup and show loading
    handleDismissPopup();
    setWaitingForGame(true);

    // Show loading toast
    Toast.show({
      type: 'success',
      text1: t('multiplayer.challengeAccepted'),
      text2: t('multiplayer.startingGame'),
      visibilityTime: 2000,
    });

    // Emit accept event
    socket.emit('accept-challenge', {
      challengeId: challengeData.challengeId,
    });

    // ✅ Get user data for myMongoId
    const userData = await AsyncStorage.getItem('userData');
    const user = userData ? JSON.parse(userData) : null;
    const myMongoId = user?._id || user?.id;

    // ✅ Listen for match-found event
    const onMatchFound = data => {
      console.log('🎮 Match found:', data);

      // Store match data temporarily
      const matchData = {
        opponent: data.opponent,
        myPlayerId: data.myPlayerId,
        initialQuestionMeter: data.initialQuestionMeter,
        isChallenge: true,
      };

      // Wait for game-started event with question
      const onGameStarted = gameData => {
        console.log('🚀 Game started:', gameData);
        setWaitingForGame(false);

        // Navigate to game with all required data
        setTimeout(() => {
          navigation.navigate('MultiPlayerGame', {
            currentQuestion: gameData.currentQuestion,
            timer: challengeData.settings.timer,
            difficulty: challengeData.settings.diff,
            opponent: matchData.opponent,
            myMongoId: myMongoId,
            isChallenge: true,
          });
        }, 300);

        // Clean up listeners
        socket.off('game-started', onGameStarted);
      };

      socket.once('game-started', onGameStarted);

      // Timeout fallback (in case game-started doesn't arrive)
      setTimeout(() => {
        if (waitingForGame) {
          console.warn('⚠️ game-started timeout, navigating anyway');
          setWaitingForGame(false);

          navigation.navigate('MultiPlayerGame', {
            currentQuestion: null, // Will be loaded from socket
            timer: challengeData.settings.timer,
            difficulty: challengeData.settings.diff,
            opponent: matchData.opponent,
            myMongoId: myMongoId,
            isChallenge: true,
          });
        }
      }, 5000);
    };

    socket.once('match-found', onMatchFound);

    // Error handling
    const onChallengeError = err => {
      console.error('❌ Challenge error:', err);
      setWaitingForGame(false);
      Toast.show({
        type: 'error',
        text1: t('multiplayer.challenge'),
        text2: err.message || t('errors.somethingWentWrong'),
      });
    };

    socket.once('challenge-error', onChallengeError);
  };

  // ✅ Handle Decline Challenge
  const handleDeclineChallenge = () => {
    if (!socket || !socket.connected) {
      Toast.show({
        type: 'error',
        text1: t('notifications.connectionError'),
      });
      return;
    }

    console.log('❌ Declining challenge:', challengeData.challengeId);

    // Emit decline event
    socket.emit('decline-challenge', {
      challengeId: challengeData.challengeId,
    });

    // Close popup
    handleDismissPopup();

    Toast.show({
      type: 'info',
      text1: t('multiplayer.challengeDeclined'),
      text2: t('multiplayer.challengeDeclined'),
    });
  };

  // ✅ Dismiss Popup
  const handleDismissPopup = () => {
    Animated.timing(popupAnimation, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setShowChallengePopup(false);
      setChallengeData(null);
    });
  };

  // ✅ Challenge Notification Popup Component
  const ChallengePopup = () => {
    if (!challengeData) return null;

    const popupScale = popupAnimation.interpolate({
      inputRange: [0, 1],
      outputRange: [0.8, 1],
    });

    const popupOpacity = popupAnimation.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 1],
    });

    return (
      <Modal
        visible={showChallengePopup}
        transparent
        animationType="fade"
        onRequestClose={handleDismissPopup}>
        <TouchableWithoutFeedback onPress={handleDismissPopup}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <Animated.View
                style={[
                  styles.popupContainer,
                  {
                    transform: [{ scale: popupScale }],
                    opacity: popupOpacity,
                  },
                ]}>
                <LinearGradient
                  colors={['#1E293B', '#0F172A']}
                  style={styles.popupGradient}>
                  {/* Close Button */}
                  <TouchableOpacity
                    style={styles.closeButton}
                    onPress={handleDismissPopup}>
                    <Ionicons name="close" size={24} color="#94A3B8" />
                  </TouchableOpacity>

                  {/* Challenge Icon */}
                  <View style={styles.iconContainer}>
                    <LinearGradient
                      colors={['#F59E0B', '#EF4444']}
                      style={styles.iconGradient}>
                      <MaterialCommunityIcons
                        name="sword-cross"
                        size={40}
                        color="#fff"
                      />
                    </LinearGradient>
                  </View>

                  {/* Title */}
                  <Text style={styles.popupTitle}>⚔️ {t('multiplayer.challengeReceived')}</Text>

                  {/* Challenger Info */}
                  <View style={styles.challengerInfo}>
                    <View style={styles.challengerAvatar}>
                      <Text style={styles.avatarText}>
                        {challengeData.challenger.username
                          .charAt(0)
                          .toUpperCase()}
                      </Text>
                    </View>
                    <View style={styles.challengerDetails}>
                      <Text style={styles.challengerName}>
                        {challengeData.challenger.username}
                      </Text>
                      <Text style={styles.challengerRating}>
                        ⭐ {t('multiplayer.rating')}: {challengeData.challenger.rating}
                      </Text>
                    </View>
                  </View>

                  {/* Game Settings */}
                  <View style={styles.settingsContainer}>
                    <View style={styles.settingItem}>
                      <MaterialCommunityIcons
                        name="speedometer"
                        size={20}
                        color="#10B981"
                      />
                      <Text style={styles.settingText}>
                        {challengeData.settings.diff.toUpperCase()}
                      </Text>
                    </View>
                    <View style={styles.settingItem}>
                      <MaterialCommunityIcons
                        name="timer-outline"
                        size={20}
                        color="#3B82F6"
                      />
                      <Text style={styles.settingText}>
                        {challengeData.settings.timer}s
                      </Text>
                    </View>
                  </View>

                  {/* Message */}
                  <Text style={styles.popupMessage}>
                    {t('multiplayer.wantsToChallenge')}
                  </Text>

                  {/* Action Buttons */}
                  <View style={styles.actionButtons}>
                    <TouchableOpacity
                      style={styles.declineButton}
                      onPress={handleDeclineChallenge}
                      activeOpacity={0.8}>
                      <MaterialCommunityIcons
                        name="close-circle"
                        size={22}
                        color="#fff"
                      />
                      <Text style={styles.declineButtonText}>{t('multiplayer.declineChallenge')}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.acceptButton}
                      onPress={handleAcceptChallenge}
                      activeOpacity={0.8}>
                      <LinearGradient
                        colors={['#10B981', '#059669']}
                        style={styles.acceptButtonGradient}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}>
                        <MaterialCommunityIcons
                          name="check-circle"
                          size={22}
                          color="#fff"
                        />
                        <Text style={styles.acceptButtonText}>{t('multiplayer.acceptChallenge')}</Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  </View>

                  {/* Expiration Notice */}
                  <Text style={styles.expirationText}>
                    ⏱️ {t('multiplayer.challengeExpiresIn')}
                  </Text>
                </LinearGradient>
              </Animated.View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    );
  };

  // ✅ Loading Modal for Game Start
  const LoadingModal = () => (
    <Modal visible={waitingForGame} transparent animationType="fade">
      <View style={styles.loadingOverlay}>
        <View style={styles.loadingContainer}>
          <LinearGradient
            colors={['#1E293B', '#0F172A']}
            style={styles.loadingGradient}>
            <MaterialCommunityIcons
              name="gamepad-variant"
              size={60}
              color="#10B981"
            />
            <Text style={styles.loadingTitle}>{t('multiplayer.startingGame')}</Text>
            <Text style={styles.loadingSubtext}>{t('multiplayer.preparingMatch')}</Text>
            <View style={styles.dotsContainer}>
              <View style={[styles.dot, styles.dot1]} />
              <View style={[styles.dot, styles.dot2]} />
              <View style={[styles.dot, styles.dot3]} />
            </View>
          </LinearGradient>
        </View>
      </View>
    </Modal>
  );

  const Content = () => (
    <View style={[styles.contentContainer, { paddingTop: insets.top + 30 }]}>
      <View style={styles.iconGrid}>
        <View style={styles.iconColumn}>
          <TouchableOpacity onPress={() => navigation.navigate('CommingSoon')}>
            <Image
              source={require('../assets/funcation.png')}
              style={styles.gridIcon}
            />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => navigation.navigate('ProfileScreen')}>
            <Image
              source={require('../assets/profile.png')}
              style={styles.gridIcon}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.iconColumn}>
          <TouchableOpacity onPress={() => navigation.navigate('CommingSoon')}>
            <Image
              source={require('../assets/setting.png')}
              style={styles.gridIcon}
            />
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setIsMuted(prev => !prev)}>
            <MaskedView
              maskElement={
                <Ionicons
                  name={isMuted ? 'volume-mute' : 'volume-high'}
                  size={width * 0.07}
                  color="black"
                  style={{ marginBottom: height * 0.01 }}
                />
              }>
              <LinearGradient
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                colors={['#00F5FF', '#00C3FF', '#006BFF']}
                style={{ width: width * 0.08, height: width * 0.08 }}
              />
            </MaskedView>
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity
        onPress={() => navigation.navigate('PlayGame', { gametype: 'PRACTICE' })}
        style={[
          styles.newButton1,
          { backgroundColor: theme.primary || '#FB923C' },
        ]}>
        <Image
          source={require('../assets/pluse.png')}
          style={styles.ticketIcon}
        />
        <Text style={styles.newText}>{t('game.practice').toUpperCase()}</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => navigation.navigate('PlayGame', { gametype: 'PLAY' })}
        style={[
          styles.newButton,
          { backgroundColor: theme.primary || '#FB923C' },
        ]}>
        <Image
          source={require('../assets/pluse.png')}
          style={styles.ticketIcon}
        />
        <Text style={styles.newText}>{t('game.play').toUpperCase()}</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.safeArea}>
      {theme.backgroundGradient ? (
        <LinearGradient
          colors={theme.backgroundGradient}
          style={styles.container}>
          <Content />
        </LinearGradient>
      ) : (
        <View
          style={[
            styles.container,
            { backgroundColor: theme.backgroundColor || '#0B1220' },
          ]}>
          <Content />
        </View>
      )}

      {/* ✅ Challenge Popup */}
      <ChallengePopup />

      {/* ✅ Loading Modal */}
      <LoadingModal />

      {/* ✅ Toast Notifications */}
      <Toast />
    </View>
  );
};

export default Home;

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: { flex: 1 },
  contentContainer: {
    flex: 1,
    paddingHorizontal: width * 0.04,
  },
  iconGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  iconColumn: {
    flexDirection: 'column',
    justifyContent: 'space-between',
    height: height * 0.12,
  },
  gridIcon: {
    width: width * 0.08,
    height: width * 0.08,
    resizeMode: 'contain',
    marginBottom: height * 0.015,
  },
  newButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    paddingVertical: height * 0.015,
    paddingHorizontal: width * 0.12,
    marginTop: height * 0.02,
    width: width * 0.7,
    height: height * 0.07,
    borderRadius: width * 0.053,
    justifyContent: 'center',
  },
  newButton1: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    paddingVertical: height * 0.015,
    paddingHorizontal: width * 0.12,
    marginTop: height * 0.3,
    width: width * 0.7,
    height: height * 0.07,
    borderRadius: width * 0.053,
    justifyContent: 'center',
  },
  ticketIcon: {
    width: width * 0.07,
    height: width * 0.07,
    resizeMode: 'contain',
    marginRight: width * 0.03,
  },
  newText: {
    fontSize: scaleFont(18),
    color: '#fff',
    fontWeight: '700',
  },

  // ✅ Popup Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  popupContainer: {
    width: width * 0.9,
    maxWidth: 400,
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
  },
  popupGradient: {
    padding: 24,
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    padding: 8,
    zIndex: 10,
  },
  iconContainer: {
    marginBottom: 16,
  },
  iconGradient: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  popupTitle: {
    fontSize: scaleFont(24),
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
    textAlign: 'center',
  },
  challengerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: 12,
    borderRadius: 12,
    width: '100%',
    marginBottom: 16,
  },
  challengerAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#F59E0B',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: scaleFont(20),
    fontWeight: 'bold',
    color: '#fff',
  },
  challengerDetails: {
    flex: 1,
  },
  challengerName: {
    fontSize: scaleFont(18),
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  challengerRating: {
    fontSize: scaleFont(14),
    color: '#94A3B8',
  },
  settingsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  settingText: {
    color: '#fff',
    fontSize: scaleFont(14),
    fontWeight: '600',
  },
  popupMessage: {
    fontSize: scaleFont(16),
    color: '#94A3B8',
    textAlign: 'center',
    marginBottom: 24,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
    marginBottom: 12,
  },
  declineButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EF4444',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 6,
  },
  declineButtonText: {
    color: '#fff',
    fontSize: scaleFont(16),
    fontWeight: 'bold',
  },
  acceptButton: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  acceptButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    gap: 6,
  },
  acceptButtonText: {
    color: '#fff',
    fontSize: scaleFont(16),
    fontWeight: 'bold',
  },
  expirationText: {
    fontSize: scaleFont(12),
    color: '#64748B',
    textAlign: 'center',
  },

  // ✅ Loading Modal Styles
  loadingOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    width: width * 0.7,
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 10,
  },
  loadingGradient: {
    padding: 30,
    alignItems: 'center',
  },
  loadingTitle: {
    fontSize: scaleFont(20),
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 16,
    marginBottom: 8,
  },
  loadingSubtext: {
    fontSize: scaleFont(14),
    color: '#94A3B8',
    marginBottom: 20,
  },
  dotsContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#10B981',
  },
  dot1: {
    opacity: 0.4,
  },
  dot2: {
    opacity: 0.7,
  },
  dot3: {
    opacity: 1,
  },
});
