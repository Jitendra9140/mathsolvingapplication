import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  PixelRatio,
  StatusBar,
  Animated,
  Easing,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../context/ThemeContext';
import { useTranslation } from 'react-i18next';

const { width, height } = Dimensions.get('window');
const scale = size => (width / 375) * size;
const scaleFont = size => size * PixelRatio.getFontScale();

const MultiplayerResultScreen = ({ route }) => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { theme } = useTheme();
  const { t } = useTranslation();

  // State
  const [gameResult, setGameResult] = useState(null); // 'win', 'lose', or 'draw'
  const [isProcessing, setIsProcessing] = useState(true);
  const [user, setUser] = useState(null);
  const [authToken, setAuthToken] = useState(null);

  // Modal State
  const [showModal, setShowModal] = useState(true);

  const hasSubmittedRef = useRef(false);

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  /* ================= ROUTE PARAMS ================= */
  const {
    totalScore,
    opponentScore,
    player2Id,
    durationSeconds,
    correctCount,
    inCorrectCount,
    skippedQuestions,
    correctPercentage,
  } = route.params;

  /* ================= GET LOGIN DATA ================= */
  useEffect(() => {
    const getLoginData = async () => {
      try {
        const storedUser = await AsyncStorage.getItem('userData');
        const storedToken = await AsyncStorage.getItem('authToken');
        const parsedUser = storedUser ? JSON.parse(storedUser) : null;
        setUser(parsedUser);
        setAuthToken(storedToken);
      } catch (err) {
        console.log('AsyncStorage Error:', err?.message);
        setIsProcessing(false);
      }
    };
    getLoginData();
  }, []);

  /* ================= RESULT API ================= */
  useEffect(() => {
    // Start Animation immediately
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic),
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
        easing: Easing.out(Easing.back(1.5)),
      }),
    ]).start();

    // ✅ Determine game result (win/lose/draw)
    const determineResult = () => {
      if (totalScore > opponentScore) return 'win';
      if (totalScore < opponentScore) return 'lose';
      return 'draw';
    };

    const result = determineResult();
    setGameResult(result);
    setIsProcessing(false); // ✅ Set immediately - no API call needed

    console.log('🎯 Game Result:', result);
    console.log('📊 Scores:', { you: totalScore, opponent: opponentScore });

    // ✅ REMOVED: API call to /api/match/result
    // The backend already saved the game when it ended via GameRoom.saveGameToDatabase()
    // No need to call API again from frontend
  }, [totalScore, opponentScore]);

  /* ================= UI HELPERS ================= */
  const getResultColor = () => {
    switch (gameResult) {
      case 'win':
        return '#4ade80'; // Green
      case 'lose':
        return '#f87171'; // Red
      case 'draw':
        return '#fbbf24'; // Yellow/Amber
      default:
        return '#ffffff';
    }
  };

  const getResultTitle = () => {
    switch (gameResult) {
      case 'win':
        return t('multiplayer.youWinTitle');
      case 'lose':
        return t('multiplayer.youLoseTitle');
      case 'draw':
        return t('multiplayer.drawTitle');
      default:
        return t('multiplayer.matchComplete');
    }
  };

  const getResultMessage = () => {
    switch (gameResult) {
      case 'win':
        return t('multiplayer.youWon');
      case 'lose':
        return t('multiplayer.youLost');
      case 'draw':
        return t('multiplayer.matchDrawn');
      default:
        return t('multiplayer.matchComplete');
    }
  };

  const getResultEmoji = () => {
    switch (gameResult) {
      case 'win':
        return '🏆';
      case 'lose':
        return '😥';
      case 'draw':
        return '🤝';
      default:
        return '🎮';
    }
  };

  /* ================= UI COMPONENTS ================= */

  return (
    <View style={styles.mainContainer}>
      {/* 1. BACKGROUND: ORIGINAL STATS PAGE */}
      <LinearGradient
        colors={theme.backgroundGradient || ['#0B1220', '#0B1220']}
        style={styles.background}
      />

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { marginTop: insets.top }]}>
        <Text
          style={[
            styles.title,
            { color: getResultColor() },
          ]}>
          {getResultTitle()}
        </Text>

        {/* ✅ Draw Badge (only shown when draw) */}
        {gameResult === 'draw' && (
          <View style={styles.drawBadge}>
            <Text style={styles.drawBadgeText}>🤝 {t('multiplayer.drawMatch')}</Text>
          </View>
        )}

        <View
          style={[
            styles.scoreBox,
            { backgroundColor: theme.cardBackground || '#1f2937' },
          ]}>
          <Text style={styles.label}>{t('multiplayer.yourScore')}</Text>
          <Text style={styles.value}>{totalScore}</Text>
        </View>

        <View
          style={[
            styles.scoreBox,
            { backgroundColor: theme.cardBackground || '#1f2937' },
          ]}>
          <Text style={styles.label}>{t('multiplayer.opponentScore')}</Text>
          <Text style={styles.value}>{opponentScore}</Text>
        </View>

        {/* ✅ Show score difference or "Equal" for draw */}
        <View
          style={[
            styles.scoreBox,
            {
              backgroundColor: theme.cardBackground || '#1f2937',
              borderWidth: 2,
              borderColor: getResultColor(),
            },
          ]}>
          <Text style={styles.label}>{t('multiplayer.scoreDifference')}</Text>
          <Text style={[styles.value, { color: getResultColor() }]}>
            {gameResult === 'draw'
              ? t('multiplayer.equal')
              : `${Math.abs(totalScore - opponentScore)}`}
          </Text>
        </View>

        <View
          style={[
            styles.scoreBox,
            { backgroundColor: theme.cardBackground || '#1f2937' },
          ]}>
          <Text style={styles.label}>{t('multiplayer.correctAnswers')}</Text>
          <Text style={styles.value}>{correctCount || 0}</Text>
        </View>

        <View
          style={[
            styles.scoreBox,
            { backgroundColor: theme.cardBackground || '#1f2937' },
          ]}>
          <Text style={styles.label}>{t('multiplayer.incorrectAnswers')}</Text>
          <Text style={styles.value}>{inCorrectCount || 0}</Text>
        </View>

        <View
          style={[
            styles.scoreBox,
            { backgroundColor: theme.cardBackground || '#1f2937' },
          ]}>
          <Text style={styles.label}>{t('multiplayer.skipped')}</Text>
          <Text style={styles.value}>{skippedQuestions || 0}</Text>
        </View>

        <View
          style={[
            styles.scoreBox,
            { backgroundColor: theme.cardBackground || '#1f2937' },
          ]}>
          <Text style={styles.label}>{t('game.accuracy')}</Text>
          <Text style={styles.value}>{correctPercentage || 0}%</Text>
        </View>

        {/* New Game Button */}
        <LinearGradient
          colors={[theme.primary || '#f97316', theme.primary || '#f97316']}
          style={styles.newGameBtn}>
          <TouchableOpacity
            onPress={() =>
              navigation.navigate('PlayGame', { gametype: 'MULTIPLAYER' })
            }
            style={{ width: '100%', alignItems: 'center' }}>
            <Text style={styles.newGameText}>{t('multiplayer.playAgain')}</Text>
          </TouchableOpacity>
        </LinearGradient>

        {/* Home Button */}
        <TouchableOpacity
          onPress={() => navigation.navigate('BottomTab')}
          style={[
            styles.homeBtn,
            { backgroundColor: theme.cardBackground || '#052757ff' },
          ]}>
          <Text style={styles.homeText}>{t('multiplayer.home')}</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* 2. OVERLAY MODAL: PREMIUM CARD */}
      {showModal && (
        <View style={styles.modalOverlay}>
          <Animated.View
            style={[
              styles.resultCard,
              {
                opacity: fadeAnim,
                transform: [{ scale: scaleAnim }],
                borderColor: getResultColor(),
                borderWidth: 2,
              },
            ]}>
            {/* ✅ Result Badge at Top */}
            <View
              style={[
                styles.resultBadge,
                { backgroundColor: getResultColor() },
              ]}>
              <Text style={styles.resultBadgeText}>
                {gameResult === 'win'
                  ? t('multiplayer.victory')
                  : gameResult === 'lose'
                    ? t('multiplayer.defeat')
                    : t('multiplayer.draw').toUpperCase()}
              </Text>
            </View>

            {/* Players Row */}
            <View style={styles.playersRow}>
              {/* Player */}
              <View style={styles.playerSide}>
                <View style={styles.playerHeader}>
                  <Text style={styles.starIcon}>⭐</Text>
                  <Text style={styles.labelTitle}>{t('game.you').toUpperCase()}</Text>
                </View>
                <Text style={styles.playerRating}>
                  {user?.pr?.pvp?.medium || user?.rating || 1000}
                </Text>
                <Text
                  style={[
                    styles.mainScore,
                    gameResult === 'win' && { color: '#4ade80' },
                    gameResult === 'draw' && { color: '#fbbf24' },
                  ]}>
                  {totalScore}
                </Text>
              </View>

              {/* VS Badge */}
              <View
                style={[
                  styles.vsBadge,
                  gameResult === 'draw' && {
                    backgroundColor: '#fbbf24',
                    borderColor: '#fbbf24',
                  },
                ]}>
                <Text style={styles.vsText}>
                  {gameResult === 'draw' ? '=' : 'VS'}
                </Text>
              </View>

              {/* Opponent */}
              <View style={styles.opponentSide}>
                <View style={styles.playerHeader}>
                  <Text style={styles.labelTitle}>{t('multiplayer.opponent').toUpperCase()}</Text>
                  <View style={styles.miniAvatar}>
                    <Text style={{ color: '#fff', fontSize: 10 }}>{t('multiplayer.op')}</Text>
                  </View>
                </View>
                <Text style={styles.playerRating}>1000</Text>
                <Text
                  style={[
                    styles.mainScore,
                    gameResult === 'lose' && { color: '#f87171' },
                    gameResult === 'draw' && { color: '#fbbf24' },
                  ]}>
                  {opponentScore}
                </Text>
              </View>
            </View>

            {/* ✅ Score Difference Indicator */}
            {gameResult !== 'draw' && (
              <View style={styles.scoreDiffContainer}>
                <Text style={styles.scoreDiffLabel}>{t('multiplayer.scoreDifference')}</Text>
                <Text
                  style={[
                    styles.scoreDiffValue,
                    { color: getResultColor() },
                  ]}>
                  {Math.abs(totalScore - opponentScore)} {t('multiplayer.points')}
                </Text>
              </View>
            )}

            {/* Result Message */}
            <View style={styles.messageContainer}>
              <Text style={[styles.resultTitle, { color: getResultColor() }]}>
                {getResultTitle().replace('\n', ' ')} {getResultEmoji()}
              </Text>
              <Text style={styles.resultSubtitle}>{getResultMessage()}</Text>
              {/* Duration */}
              <Text style={styles.durationText}>
                {t('multiplayer.duration')}:{' '}
                <Text style={{ fontWeight: 'bold', color: '#fff' }}>
                  {durationSeconds}s
                </Text>
              </Text>
            </View>

            {/* OK Button - Closes Modal */}
            <TouchableOpacity
              style={[
                styles.okButton,
                { backgroundColor: getResultColor() },
              ]}
              onPress={() => setShowModal(false)}>
              <Text style={styles.okButtonText}>{t('common.continue')}</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      )}
    </View>
  );
};

export default MultiplayerResultScreen;

/* ================= STYLES ================= */
const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  background: {
    ...StyleSheet.absoluteFillObject,
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
    paddingBottom: 100,
  },

  // ORIGINAL SCREEN STYLES
  title: {
    fontSize: scaleFont(30),
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 20,
    marginTop: 20,
  },
  drawBadge: {
    backgroundColor: '#fbbf24',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginBottom: 30,
  },
  drawBadgeText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 1,
  },
  scoreBox: {
    width: '100%',
    borderRadius: 12,
    paddingVertical: 15,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  label: {
    color: '#B0BEC5',
    fontSize: 14,
    fontWeight: '600',
  },
  value: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  newGameBtn: {
    width: '80%',
    borderRadius: 30,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 40,
    overflow: 'hidden',
  },
  newGameText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  homeBtn: {
    width: '80%',
    borderRadius: 30,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 15,
  },
  homeText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },

  // MODAL OVERLAY STYLES
  modalOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    zIndex: 100,
  },
  resultCard: {
    width: '100%',
    maxWidth: 340,
    padding: 24,
    borderRadius: 24,
    alignItems: 'center',
    backgroundColor: '#111827',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  resultBadge: {
    paddingHorizontal: 24,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 20,
    marginTop: -10,
  },
  resultBadgeText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 2,
  },
  playersRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    width: '100%',
    marginBottom: 30,
  },
  playerSide: { flex: 1, alignItems: 'center' },
  opponentSide: { flex: 1, alignItems: 'center' },
  playerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  starIcon: { fontSize: 12, marginRight: 4, color: '#FFD700' },
  labelTitle: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  miniAvatar: {
    width: 20,
    height: 20,
    backgroundColor: '#334155',
    borderRadius: 4,
    marginLeft: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playerRating: { color: '#64748b', fontSize: 10, marginBottom: 10 },
  mainScore: { fontSize: 32, fontWeight: '700', color: '#fff' },

  vsBadge: {
    position: 'absolute',
    left: '50%',
    top: 10,
    marginLeft: -20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1f2937',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  vsText: { color: '#fff', fontWeight: '900', fontSize: 14 },

  scoreDiffContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  scoreDiffLabel: {
    color: '#64748b',
    fontSize: 11,
    marginBottom: 4,
  },
  scoreDiffValue: {
    fontSize: 16,
    fontWeight: '700',
  },

  messageContainer: { alignItems: 'center', marginBottom: 30 },
  resultTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 8,
  },
  resultSubtitle: {
    color: '#94a3b8',
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 10,
  },
  durationText: { color: '#64748b', fontSize: 12 },

  okButton: {
    backgroundColor: '#f97316',
    paddingVertical: 12,
    paddingHorizontal: 50,
    borderRadius: 25,
    shadowColor: '#f97316',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  okButtonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
