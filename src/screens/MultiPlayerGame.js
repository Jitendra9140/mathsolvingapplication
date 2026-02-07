import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  PixelRatio,
  SafeAreaView,
  StatusBar,
  Animated,
  AppState,
  Alert,
  BackHandler,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/Ionicons';
import {
  useNavigation,
  useRoute,
  useFocusEffect,
} from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Feather from 'react-native-vector-icons/Feather';
import { useSocket } from '../context/Socket';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { useSound } from '../context/SoundContext';
import { KEYPAD_LAYOUTS } from '../utils/keyboardLayouts';
import { initSound, playEffect, stopEffect } from '../utils/SoundManager';
import { useTranslation } from 'react-i18next';

const { width, height } = Dimensions.get('window');
const scaleFont = size => size * PixelRatio.getFontScale();

const getMathSymbol = word => {
  const symbolMap = {
    Sum: '+',
    Difference: '-',
    Product: '*',
    Quotient: '/',
    Modulus: '%',
    Exponent: '^',
  };
  return symbolMap[word] || word;
};

const MultiPlayerGame = () => {
  /* ================= HOOKS & CONTEXT ================= */
  const socket = useSocket();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const route = useRoute();
  const { theme, keyboardTheme } = useTheme();
  const { isSoundOn, toggleSound } = useSound();
  const { t } = useTranslation();

  /* ================= PARAMS ================= */
  const { currentQuestion, timer, difficulty, opponent, myMongoId } =
    route.params || {};

  console.log('🎮 Game Screen Params:', {
    myMongoId,
    opponent,
    difficulty,
    timer,
  });

  const currentLayout = KEYPAD_LAYOUTS[keyboardTheme] || KEYPAD_LAYOUTS.type1;

  /* ================= STATE ================= */
  const [input, setInput] = useState('');
  const [question, setQuestion] = useState('');
  const [correctAnswer, setCorrectAnswer] = useState('');
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [isReverse, setIsReverse] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [awaitingResult, setAwaitingResult] = useState(false);
  const [isConnected, setIsConnected] = useState(true);
  const [gameEnded, setGameEnded] = useState(false);

  // Timer State
  const [minutes, setMinutes] = useState(Math.floor((timer ?? 60) / 60));
  const [seconds, setSeconds] = useState((timer ?? 60) % 60);
  const [animateWatch] = useState(new Animated.Value(1));
  const [isThirtySecPhase, setIsThirtySecPhase] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  // Local Stats State
  const [score, setScore] = useState(0);
  const [opponentScore, setOpponentScore] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [skippedCount, setSkippedCount] = useState(0);

  /* ================= REFS ================= */
  const socketRef = useRef(null);
  const totalTimeRef = useRef(timer ?? 60);
  const scoreRef = useRef(0);
  const correctAnswersRef = useRef(0);
  const incorrectCountRef = useRef(0);
  const skippedCountRef = useRef(0);
  const opponentScoreRef = useRef(0);
  const isSoundOnRef = useRef(isSoundOn);
  const last10PlayedRef = useRef(false);
  const appState = useRef(AppState.currentState);
  const hasNavigatedToResultRef = useRef(false);

  // MongoDB ID refs
  const myMongoIdRef = useRef(myMongoId);
  const opponentMongoIdRef = useRef(opponent?.id);

  /* ================= DIAGNOSTIC LOGGING ================= */
  useEffect(() => {
    console.log('=== GAME SCREEN DIAGNOSTIC ===');
    console.log('1. My MongoDB ID (from params):', myMongoId);
    console.log('2. Opponent MongoDB ID:', opponent?.id);
    console.log('3. Opponent Username:', opponent?.username);
    console.log('4. Difficulty:', difficulty);
    console.log('5. Timer:', timer);
    console.log('==============================');
  }, []);

  // ADD THIS NEW useEffect at the top
  useEffect(() => {
    return () => {
      if (
        socketRef.current &&
        socketRef.current.connected &&
        !hasNavigatedToResultRef.current
      ) {
        console.log('🧹 Cleaning up game - emitting game-ended');
        socketRef.current.emit('game-ended');
      }
      stopEffect('ticktock');
    };
  }, []);
  /* ================= EFFECTS: SOUND & APP STATE ================= */
  useEffect(() => {
    isSoundOnRef.current = isSoundOn;
    if (!isSoundOn) {
      stopEffect('ticktock');
      stopEffect('timer');
      last10PlayedRef.current = false;
    }
  }, [isSoundOn]);

  useFocusEffect(
    useCallback(() => {
      initSound('correct', 'rightanswer.mp3');
      initSound('incorrect', 'wronganswerr.mp3');
      initSound('skipped', 'skip.mp3');
      initSound('timer', 'every30second.wav');
      initSound('ticktock', 'ticktock.mp3');
    }, []),
  );

  useEffect(() => {
    const sub = AppState.addEventListener('change', state => {
      if (state !== 'active') {
        stopEffect('ticktock');
      } else {
        if (totalTimeRef.current <= 10 && totalTimeRef.current > 0) {
          playEffect('ticktock', isSoundOnRef.current);
        }
      }
      appState.current = state;
    });
    return () => sub.remove();
  }, []);

  /* ================= BACK BUTTON HANDLER ================= */
  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        if (!gameEnded) {
          Alert.alert(
            t('game.leaveGame'),
            t('game.leaveGameConfirm'),
            [
              { text: t('common.cancel'), style: 'cancel' },
              {
                text: t('game.leave'),
                style: 'destructive',
                onPress: handleGameExit,
              },
            ],
          );
          return true;
        }
        return false;
      },
    );

    return () => backHandler.remove();
  }, [gameEnded]);

  /* ================= EFFECTS: USER & SOCKET ================= */
  useEffect(() => {
    AsyncStorage.getItem('userData')
      .then(stored => {
        if (stored) {
          const userData = JSON.parse(stored);
          console.log('✅ User Data Loaded:', {
            id: userData.id || userData._id,
            username: userData.username,
          });
          setUser(userData);

          if (!myMongoIdRef.current) {
            myMongoIdRef.current = userData.id || userData._id;
            console.log('⚠️ Using fallback MongoDB ID:', myMongoIdRef.current);
          }
        }
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (!socket) return;
    socketRef.current = socket;

    console.log('🔌 Setting up socket listeners...');

    if (opponent?.id) {
      opponentMongoIdRef.current = opponent.id;
      console.log('✅ Opponent MongoDB ID stored:', opponent.id);
    }

    // ✅ CONNECTION STATUS HANDLERS
    const handleConnect = () => {
      console.log('🟢 Reconnected to server');
      setIsConnected(true);
    };

    const handleDisconnect = reason => {
      console.log('🔴 Disconnected from server:', reason);
      setIsConnected(false);

        if (!gameEnded && !hasNavigatedToResultRef.current) {
        Alert.alert(
          t('game.connectionLost'),
          t('game.connectionLostMessage'),
          [
            {
              text: t('common.ok'),
              onPress: () => {
                stopEffect('ticktock');
                navigation.replace('BottomTab');
              },
            },
          ],
        );
      }
    };

    const handleConnectError = error => {
      console.error('❌ Connection error:', error);
      setIsConnected(false);
    };

    // --- Socket Listeners ---
    const handleNewQuestion = q => {
      console.log('📥 new-question:', q);
      const mathSymbol = getMathSymbol(q.symbol);
      setQuestion(`${q.input1} ${mathSymbol} ${q.input2}`);
      setCorrectAnswer(String(q.answer));
      setInput('');
      setLoading(false);
      setFeedback(null);
      setAwaitingResult(false);
    };

    const handleNextQuestion = data => {
      console.log('📥 next-question:', data);
      const q = data.question;
      const mathSymbol = getMathSymbol(q.symbol);
      setQuestion(`${q.input1} ${mathSymbol} ${q.input2}`);
      setCorrectAnswer(String(q.answer));
      setInput('');
      setLoading(false);
      setFeedback(null);
      setAwaitingResult(false);

      if (data.gameState && data.gameState.playerScores) {
        const pScores = data.gameState.playerScores;
        console.log('📊 Player Scores from server:', pScores);

        if (
          opponentMongoIdRef.current &&
          pScores[opponentMongoIdRef.current] !== undefined
        ) {
          const opData = pScores[opponentMongoIdRef.current];
          const opScore = typeof opData === 'object' ? opData.score : opData;
          console.log('📊 Opponent score update:', opScore);
          setOpponentScore(opScore);
          opponentScoreRef.current = opScore;
        }

        if (
          myMongoIdRef.current &&
          pScores[myMongoIdRef.current] !== undefined
        ) {
          const myData = pScores[myMongoIdRef.current];
          const myScore = typeof myData === 'object' ? myData.score : myData;
          if (myScore !== scoreRef.current) {
            console.log('📊 My score update:', myScore);
            scoreRef.current = myScore;
            setScore(myScore);
          }
        }
      }
    };

    const handleOpponentScoreUpdate = data => {
      console.log('📊 opponent-score-update:', data);

      if (data.opponentId === opponentMongoIdRef.current) {
        console.log('✅ Updating opponent score to:', data.score);
        setOpponentScore(data.score);
        opponentScoreRef.current = data.score;
      }
    };

    const handleGameEnded = data => {
      console.log('🏁 game-ended:', data);

      if (hasNavigatedToResultRef.current) {
        console.log('🛑 Already navigated to results, ignoring duplicate');
        return;
      }

      hasNavigatedToResultRef.current = true;
      setGameEnded(true);
      stopEffect('ticktock');

      // ✅ NO need to emit game-ended here - server already knows

      const attempts = correctAnswersRef.current + incorrectCountRef.current;
      const acc =
        attempts > 0
          ? Math.round((correctAnswersRef.current / attempts) * 100)
          : 0;

      setTimeout(() => {
        navigation.replace('MultiplayerResultScreen', {
          totalScore: scoreRef.current,
          correctCount: correctAnswersRef.current,
          inCorrectCount: incorrectCountRef.current,
          skippedQuestions: skippedCountRef.current,
          correctPercentage: acc,
          difficulty,
          player2Id: opponentMongoIdRef.current || 'unknown',
          opponentScore: opponentScoreRef.current,
          durationSeconds: timer,
          winner: data.winner,
          players: data.players,
          gameResults: data.gameResults,
        });
      }, 500);
    };


    const handleOpponentDisconnected = data => {
      console.log('👋 opponent-disconnected:', data);

      if (hasNavigatedToResultRef.current) {
        console.log('🛑 Already navigated to results, ignoring');
        return;
      }

      hasNavigatedToResultRef.current = true;
      setGameEnded(true);
      stopEffect('ticktock');

      // ✅ NO need to emit - server already handled cleanup

      Alert.alert(
        t('game.opponentDisconnected'),
        t('game.opponentLeftWin'),
        [
          {
            text: t('common.ok'),
            onPress: () => {
              const attempts =
                correctAnswersRef.current + incorrectCountRef.current;
              const acc =
                attempts > 0
                  ? Math.round((correctAnswersRef.current / attempts) * 100)
                  : 0;

              navigation.replace('MultiplayerResultScreen', {
                totalScore: scoreRef.current,
                correctCount: correctAnswersRef.current,
                inCorrectCount: incorrectCountRef.current,
                skippedQuestions: skippedCountRef.current,
                correctPercentage: acc,
                difficulty,
                player2Id: opponentMongoIdRef.current || 'unknown',
                opponentScore: opponentScoreRef.current,
                durationSeconds: timer,
                opponentDisconnected: true,
                winner: myMongoIdRef.current,
              });
            },
          },
        ],
      );
    };
    const handleError = data => {
      console.error('❌ Socket error:', data);
      Alert.alert(t('common.error'), data.message || t('errors.unknown'));
    };

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('connect_error', handleConnectError);
    socket.on('new-question', handleNewQuestion);
    socket.on('next-question', handleNextQuestion);
    socket.on('opponent-score-update', handleOpponentScoreUpdate);
    socket.on('game-ended', handleGameEnded);
    socket.on('opponent-disconnected', handleOpponentDisconnected);
    socket.on('error', handleError);

    if (currentQuestion) {
      console.log('📝 Setting initial question:', currentQuestion);
      const mathSymbol = getMathSymbol(currentQuestion.symbol);
      setQuestion(
        `${currentQuestion.input1} ${mathSymbol} ${currentQuestion.input2}`,
      );
      setCorrectAnswer(String(currentQuestion.answer));
      setLoading(false);
    }

    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('connect_error', handleConnectError);
      socket.off('new-question', handleNewQuestion);
      socket.off('next-question', handleNextQuestion);
      socket.off('opponent-score-update', handleOpponentScoreUpdate);
      socket.off('game-ended', handleGameEnded);
      socket.off('opponent-disconnected', handleOpponentDisconnected);
      socket.off('error', handleError);
    };
  }, [
    socket,
    currentQuestion,
    opponent,
    difficulty,
    timer,
    navigation,
    gameEnded,
  ]);

  /* ================= TIMER LOGIC ================= */
  useEffect(() => {
    if (gameEnded) return;

    const interval = setInterval(() => {
      if (!isPaused) {
        totalTimeRef.current -= 1;
        const remaining = totalTimeRef.current;
        setMinutes(Math.floor(remaining / 60));
        setSeconds(remaining % 60);

        if (remaining <= 10 && remaining > 0) {
          if (!last10PlayedRef.current) {
            playEffect('ticktock', isSoundOnRef.current);
            last10PlayedRef.current = true;
          }
          Animated.sequence([
            Animated.timing(animateWatch, {
              toValue: 1.4,
              duration: 300,
              useNativeDriver: true,
            }),
            Animated.timing(animateWatch, {
              toValue: 1,
              duration: 300,
              useNativeDriver: true,
            }),
          ]).start();
        }

        if (remaining % 30 === 0 && remaining !== timer && remaining > 0) {
          setIsThirtySecPhase(true);
          playEffect('timer', isSoundOnRef.current);
          Animated.sequence([
            Animated.timing(animateWatch, {
              toValue: 1.4,
              duration: 300,
              useNativeDriver: true,
            }),
            Animated.timing(animateWatch, {
              toValue: 1,
              duration: 300,
              useNativeDriver: true,
            }),
          ]).start(() => setIsThirtySecPhase(false));
        }

        if (remaining <= 0) {
          clearInterval(interval);
          handleTimeUp();
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isPaused, timer, difficulty, navigation, socket, opponent, gameEnded]);

  /* ================= HANDLERS ================= */
  const handleTimeUp = () => {
    if (hasNavigatedToResultRef.current || gameEnded) return;

    hasNavigatedToResultRef.current = true;
    setGameEnded(true);
    stopEffect('ticktock');

    console.log('⏰ Time up! Final score:', scoreRef.current);

    // ✅ EMIT game-ended to trigger server cleanup
    if (socketRef.current && socketRef.current.connected) {
      socketRef.current.emit('game-ended');
    }

    const attempts = correctAnswersRef.current + incorrectCountRef.current;
    const acc =
      attempts > 0
        ? Math.round((correctAnswersRef.current / attempts) * 100)
        : 0;

    setTimeout(() => {
      navigation.replace('MultiplayerResultScreen', {
        totalScore: scoreRef.current,
        correctCount: correctAnswersRef.current,
        inCorrectCount: incorrectCountRef.current,
        skippedQuestions: skippedCountRef.current,
        correctPercentage: acc,
        difficulty,
        player2Id: opponentMongoIdRef.current || 'unknown',
        opponentScore: opponentScoreRef.current,
        durationSeconds: timer,
      });
    }, 500);
  };

  /* ================= REPLACE handleGameExit FUNCTION ================= */

  const handleGameExit = () => {
    stopEffect('ticktock');

    // ✅ EMIT game-ended to trigger server cleanup
    if (socketRef.current && socketRef.current.connected) {
      console.log('🚪 Player exiting - emitting game-ended');
      socketRef.current.emit('game-ended');
    }

    hasNavigatedToResultRef.current = true;
    setGameEnded(true);
    navigation.replace('BottomTab');
  };



  const handleToggleSound = () => {
    toggleSound();
    const newVal = !isSoundOn;
    isSoundOnRef.current = newVal;
    if (!newVal) {
      stopEffect('ticktock');
    } else {
      if (totalTimeRef.current <= 10 && totalTimeRef.current > 0) {
        last10PlayedRef.current = false;
        playEffect('ticktock', true);
      }
    }
  };

  const handlePress = async value => {
    if (
      loading ||
      awaitingResult ||
      totalTimeRef.current <= 0 ||
      feedback ||
      gameEnded
    )
      return;

    const key = value.toString().toLowerCase();

    if (key === 'clear' || key === 'clr') return setInput('');

    if (key === '⌫' || key === 'del') {
      return setInput(prev => prev.slice(0, -1));
    }

    if (key === 'reverse' || key === 'rev') {
      return setIsReverse(prev => !prev);
    }

    if (key === 'pm') {
      return setInput(prev => {
        if (prev.startsWith('-')) return prev.slice(1);
        return '-' + prev;
      });
    }

    if (key === 'skip') {
      skippedCountRef.current += 1;
      setSkippedCount(skippedCountRef.current);
      setFeedback('skipped');
      playEffect('skipped', isSoundOnRef.current);

      console.log('⏭️ Skipping question');

      socketRef.current?.emit('submit-answer', {
        answer: null,
        playerId: myMongoIdRef.current,
        timeSpent: 0,
        skipped: true,
      });

      setTimeout(() => setFeedback(null), 900);
      return;
    }

    const newInput = isReverse ? value + input : input + value;
    setInput(newInput);

    if (newInput.length >= correctAnswer.length) {
      const isCorrect = newInput === correctAnswer;
      setFeedback(isCorrect ? 'correct' : 'incorrect');
      playEffect(isCorrect ? 'correct' : 'incorrect', isSoundOnRef.current);

      if (isCorrect) {
        scoreRef.current += 1;
        setScore(scoreRef.current);
        correctAnswersRef.current += 1;
        setCorrectAnswers(correctAnswersRef.current);
      } else {
        incorrectCountRef.current += 1;
      }

      console.log('📤 Submitting answer:', {
        playerId: myMongoIdRef.current,
        answer: newInput,
        isCorrect,
      });

      socketRef.current?.emit('submit-answer', {
        answer: newInput,
        playerId: myMongoIdRef.current,
        timeSpent: 0,
      });

      setAwaitingResult(true);
      setTimeout(() => {
        setAwaitingResult(false);
        if (feedback) setFeedback(null);
      }, 5000);
    }
  };

  /* ================= LAYOUT HELPERS ================= */
  const getKeyButtonWidth = () => width * 0.2;
  const getKeyButtonHeight = () => height * 0.1;

  /* ================= RENDER ================= */
  const Content = () => (
    <SafeAreaView style={[styles.container, { paddingTop: insets.top + 30 }]}>
      {!isConnected && (
        <View style={styles.disconnectedBanner}>
          <Text style={styles.disconnectedText}>
            ⚠️ {t('game.disconnected')}
          </Text>
        </View>
      )}

      <View
        style={[
          styles.topBar,
          { backgroundColor: theme.cardBackground || '#1E293B' },
        ]}>
        <TouchableOpacity
          onPress={() => {
            if (!gameEnded) {
              Alert.alert(
                t('game.leaveGame'),
                t('game.leaveGameConfirm'),
                [
                  { text: t('common.cancel'), style: 'cancel' },
                  {
                    text: t('game.leave'),
                    style: 'destructive',
                    onPress: handleGameExit,
                  },
                ],
              );
            } else {
              navigation.goBack();
            }
          }}
          style={styles.iconButton}>
          <Icon name="caret-back-outline" size={scaleFont(24)} color="#fff" />
        </TouchableOpacity>

        <View style={styles.timerContainer}>
          <Animated.Image
            source={require('../assets/Stopwatch.png')}
            style={[
              styles.timerIcon,
              {
                transform: [{ scale: animateWatch }],
                tintColor:
                  minutes * 60 + seconds <= 10 || isThirtySecPhase
                    ? 'red'
                    : '#fff',
              },
            ]}
          />
          <Text style={styles.timerText}>
            {`${minutes}:${String(seconds).padStart(2, '0')}`}
          </Text>
        </View>

        <TouchableOpacity
          onPress={handleToggleSound}
          style={styles.iconButton1}>
          <Icon
            name={isSoundOn ? 'volume-high' : 'volume-mute'}
            size={24}
            color="#fff"
          />
        </TouchableOpacity>
      </View>

      <Text style={styles.question}>{loading ? t('common.loading') : question}</Text>

      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'center',
          marginBottom: height * 0.04,
        }}>
        <View
          style={[
            styles.answerBox,
            { backgroundColor: theme.cardBackground || '#1E293B' },
            feedback === 'correct'
              ? { borderColor: 'green', borderWidth: 2 }
              : feedback === 'incorrect'
                ? { borderColor: 'red', borderWidth: 2 }
                : feedback === 'skipped'
                  ? { borderColor: 'orange', borderWidth: 2 }
                  : {},
          ]}>
          <Text
            style={[
              styles.answerText,
              feedback === 'correct'
                ? { color: 'green' }
                : feedback === 'incorrect'
                  ? { color: 'red' }
                  : feedback === 'skipped'
                    ? { color: 'orange' }
                    : { color: theme.text || '#fff' },
            ]}>
            {input ||
              (feedback
                ? feedback.charAt(0).toUpperCase() + feedback.slice(1)
                : '')}
          </Text>
        </View>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text
            style={[
              styles.statLabel,
              { color: theme.secondaryText || '#B0BEC5' },
            ]}>
            {t('game.you')}
          </Text>
          <Text style={[styles.statValue, { color: theme.text || '#fff' }]}>
            {score}
          </Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text
            style={[
              styles.statLabel,
              { color: theme.secondaryText || '#B0BEC5' },
            ]}>
            {opponent?.username || t('multiplayer.opponent')}
          </Text>
          <Text style={[styles.statValue, { color: theme.text || '#fff' }]}>
            {opponentScore}
          </Text>
        </View>
      </View>

      <View style={styles.keypadContainer}>
        {currentLayout.map((row, rowIndex) => (
          <View key={rowIndex} style={styles.keypadRow}>
            {row.map((item, index) => {
              const strItem = item.toString().toLowerCase();
              const isSpecial = [
                'clear',
                'clr',
                '⌫',
                'del',
                'ref',
                'pm',
                'skip',
                '.',
                'reverse',
              ].includes(strItem);
              const isSkip = strItem === 'skip';
              const isNa = strItem === 'na';

              if (isNa)
                return (
                  <View
                    key={index}
                    style={{
                      width: getKeyButtonWidth(),
                      height: getKeyButtonHeight(),
                    }}
                  />
                );

              let content;
              if (strItem === 'del' || strItem === '⌫') {
                content = (
                  <MaterialIcons name="backspace" size={24} color="#fff" />
                );
              } else if (strItem === 'ref' || strItem === 'reverse') {
                content = (
                  <Text style={[styles.keyText, { fontSize: scaleFont(16), fontWeight: '800', fontStyle: 'italic' }]}>REV</Text>
                );
              } else if (strItem === 'pm') {
                content = (
                  <Text style={[styles.keyText, { color: '#fff' }]}>+/-</Text>
                );
              } else if (strItem === 'clr' || strItem === 'clear') {
                content = (
                  <Text style={[styles.keyText, { color: '#fff' }]}>Clear</Text>
                );
              } else if (isSkip) {
                content = (
                  <View style={{ alignItems: 'center', flexDirection: 'row' }}>
                    <Text style={[styles.keyText, { fontSize: scaleFont(14) }]}>
                      Skip
                    </Text>
                    <MaterialIcons name="skip-next" size={24} color="#fff" />
                  </View>
                );
              } else {
                content = (
                  <Text style={styles.keyText}>{item.toUpperCase()}</Text>
                );
              }

              return (
                <TouchableOpacity
                  key={index}
                  onPress={() =>
                    handlePress(strItem === 'ref' ? 'reverse' : item)
                  }
                  disabled={gameEnded}
                  style={[
                    styles.keyButton,
                    {
                      width: getKeyButtonWidth(),
                      height: getKeyButtonHeight(),
                      borderBottomWidth: 4,
                      borderBottomColor: 'rgba(0,0,0,0.3)',
                    },
                    isSpecial || strItem === '-' ? styles.specialKey : null,
                    gameEnded && { opacity: 0.5 },
                    ((strItem === 'ref' || strItem === 'reverse') && isReverse) && {
                      backgroundColor: theme.primary || '#FB923C',
                      borderColor: theme.primary || '#FB923C',
                      borderBottomColor: 'rgba(0,0,0,0.5)',
                      borderWidth: 0,
                      borderBottomWidth: 4,
                      elevation: 10,
                      shadowColor: theme.primary || '#FB923C',
                      shadowOffset: { width: 0, height: 4 },
                      shadowOpacity: 0.5,
                      shadowRadius: 8,
                    }
                  ]}>
                  {!isSpecial && strItem !== '-' ? (
                    <LinearGradient
                      colors={
                        theme.buttonGradient || [
                          theme.primaryColor || '#595CFF',
                          theme.secondaryColor || '#87AEE9',
                        ]
                      }
                      style={styles.gradientButton}>
                      {content}
                    </LinearGradient>
                  ) : (
                    <View
                      style={{ alignItems: 'center', justifyContent: 'center' }}>
                      {content}
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        ))}
      </View>
    </SafeAreaView>
  );

  return theme.backgroundGradient ? (
    <LinearGradient colors={theme.backgroundGradient} style={{ flex: 1 }}>
      <Content />
    </LinearGradient>
  ) : (
    <View
      style={{ flex: 1, backgroundColor: theme.backgroundColor || '#0B1220' }}>
      <Content />
    </View>
  );
};

export default MultiPlayerGame;

const styles = StyleSheet.create({
  container: { flex: 1 },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: width * 0.04,
    paddingVertical: height * 0.02,
    marginBottom: height * 0.03,
    borderBottomEndRadius: 15,
    borderBottomStartRadius: 15,
  },
  iconButton: {
    width: width * 0.06,
    height: width * 0.06,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconButton1: {
    width: width * 0.06,
    height: width * 0.06,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timerContainer: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  timerText: {
    color: '#fff',
    fontSize: scaleFont(13),
    fontWeight: '600',
    opacity: 0.7,
  },
  timerIcon: { width: 18, height: 18 },
  question: {
    fontSize: scaleFont(22),
    color: '#fff',
    textAlign: 'center',
    marginTop: height * 0.05,
    marginBottom: height * 0.02,
    fontWeight: 'bold',
  },
  answerBox: {
    width: width * 0.6,
    height: height * 0.06,
    backgroundColor: '#1E293B',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: '5%',
  },
  answerText: { fontSize: scaleFont(18), color: '#fff', fontWeight: '600' },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: height * 0.02,
    paddingHorizontal: width * 0.1,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statLabel: {
    fontSize: scaleFont(12),
    fontWeight: '600',
    opacity: 0.8,
    marginBottom: 4,
  },
  statValue: {
    fontSize: scaleFont(20),
    fontWeight: 'bold',
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    marginHorizontal: 20,
  },
  keypadContainer: { width: '100%', marginTop: 'auto', marginBottom: 20 },
  keypadRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: height * 0.02,
    paddingHorizontal: width * 0.05,
  },
  keyButton: {
    width: width * 0.2,
    height: height * 0.1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    backgroundColor: '#1C2433',
  },
  specialKey: { backgroundColor: '#1C2433' },
  gradientButton: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
  },
  keyText: { fontSize: scaleFont(18), color: '#fff', fontWeight: '600' },
});
