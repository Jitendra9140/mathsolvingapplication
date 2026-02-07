import React, {useCallback, useEffect, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  PixelRatio,
  ScrollView,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import ConfettiCannon from 'react-native-confetti-cannon';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Sound from 'react-native-sound';
import LinearGradient from 'react-native-linear-gradient';
import {
  playBackgroundMusic,
  stopBackgroundMusic,
} from '../utils/playBackgroundMusic';
import {useTheme} from '../context/ThemeContext'; // ✅ Import theme

const {width, height} = Dimensions.get('window');
const scale = size => (width / 375) * size;
const scaleFont = size => size * PixelRatio.getFontScale();

const WellDoneScreen = ({route}) => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const {theme} = useTheme(); // ✅ Get current theme

  const {
    totalScore,
    correctCount,
    inCorrectCount,
    skippedQuestions,
    correctPercentage,
  } = route.params;

  const celebrationRef = useRef(null);

  // useFocusEffect(
  //   useCallback(() => {
  //     celebrationRef.current = new Sound('endgame.mp3', Sound.MAIN_BUNDLE, error => {
  //       if (error) return console.log('Failed to load sound', error);
  //       celebrationRef.current.play(success => {
  //         if (!success) console.log('Sound playback failed');
  //       });
  //     });

  //     return () => {
  //       if (celebrationRef.current) {
  //         celebrationRef.current.stop(() => {
  //           celebrationRef.current.release();
  //           celebrationRef.current = null;
  //         });
  //       }
  //     };
  //   }, []),
  // );

  // useFocusEffect(
  //   useCallback(() => {
  //     stopBackgroundMusic();
  //     return () => {
  //       playBackgroundMusic();
  //     };
  //   }, []),
  // );

  const Content = () => (
    <ScrollView
      contentContainerStyle={[styles.container, {paddingTop: insets.top + 20}]}>
      <ConfettiCannon
        count={150}
        origin={{x: width / 2, y: 0}}
        fadeOut
        autoStart
        fallSpeed={4000}
      />
      <Text style={styles.title}>Well Done</Text>

      <View
        style={[
          styles.scoreBox,
          {backgroundColor: theme.cardBackground || '#1E293B'},
        ]}>
        <Text style={styles.label}>Total Score</Text>
        <Text style={styles.value}>{totalScore}</Text>
      </View>
      <View
        style={[
          styles.scoreBox,
          {backgroundColor: theme.cardBackground || '#1E293B'},
        ]}>
        <Text style={styles.label}>Correct Count</Text>
        <Text style={styles.value}>{correctCount}</Text>
      </View>
      <View
        style={[
          styles.scoreBox,
          {backgroundColor: theme.cardBackground || '#1E293B'},
        ]}>
        <Text style={styles.label}>Incorrect Count</Text>
        <Text style={styles.value}>{inCorrectCount}</Text>
      </View>
      <View
        style={[
          styles.scoreBox,
          {backgroundColor: theme.cardBackground || '#1E293B'},
        ]}>
        <Text style={styles.label}>Skipped Questions</Text>
        <Text style={styles.value}>{skippedQuestions}</Text>
      </View>
      <View
        style={[
          styles.scoreBox,
          {backgroundColor: theme.cardBackground || '#1E293B'},
        ]}>
        <Text style={styles.label}>Correct Percentage</Text>
        <Text style={styles.value}>{correctPercentage}%</Text>
      </View>

      {/* 🎮 Themed "New Game" Button */}
      <LinearGradient
        colors={[theme.primary || '#FB923C', theme.primary || '#FF7F50']}
        style={styles.newGameBtn}>
        <TouchableOpacity
          onPress={() =>
            navigation.navigate('BottomTab', {
              screen: 'Home',
              params: {
                screen: 'PlayGame',
                params: {gametype: 'PRACTICE'},
              },
            })
          }
          style={{width: '100%', alignItems: 'center'}}>
          <Text style={styles.newGameText}>New Game</Text>
        </TouchableOpacity>
      </LinearGradient>

      {/* 🏠 Themed "Home" Button */}
      <TouchableOpacity
        onPress={() => navigation.navigate('BottomTab')}
        style={[
          styles.homeBtn,
          {backgroundColor: theme.cardBackground || '#fff'},
        ]}>
        <Text style={[styles.homeText, {color: '#fff'}]}>Home</Text>
      </TouchableOpacity>
    </ScrollView>
  );

  return theme.backgroundGradient ? (
    <LinearGradient colors={theme.backgroundGradient} style={{flex: 1}}>
      <Content />
    </LinearGradient>
  ) : (
    <View style={{flex: 1, backgroundColor: '#0B1220'}}>
      <Content />
    </View>
  );
};

export default WellDoneScreen;

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: 'center',
    paddingVertical: height * 0.08,
  },
  title: {
    fontSize: scaleFont(30),
    color: '#fff',
    fontWeight: '700',
    marginBottom: height * 0.1,
    marginTop: height * 0.1,
  },
  scoreBox: {
    width: '80%',
    backgroundColor: '#1E293B',
    borderRadius: scale(12),
    paddingVertical: height * 0.015,
    paddingHorizontal: width * 0.05,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: height * 0.015,
  },
  label: {
    color: '#B0BEC5',
    fontSize: scaleFont(14),
    fontWeight: '600',
  },
  value: {
    color: '#fff',
    fontSize: scaleFont(16),
    fontWeight: '700',
  },
  newGameBtn: {
    width: '60%',
    borderRadius: scale(30),
    paddingVertical: height * 0.012,
    alignItems: 'center',
    marginTop: height * 0.06,
    overflow: 'hidden',
  },
  newGameText: {
    color: '#fff',
    fontSize: scaleFont(18),
    fontWeight: 'bold',
  },
  homeBtn: {
    width: '60%',
    borderRadius: scale(30),
    paddingVertical: height * 0.015,
    alignItems: 'center',
    marginTop: height * 0.02,
  },
  homeText: {
    fontSize: scaleFont(18),
    fontWeight: 'bold',
  },
});

