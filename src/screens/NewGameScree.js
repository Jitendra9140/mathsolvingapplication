import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  StatusBar,
  SafeAreaView,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';
import { useTranslation } from 'react-i18next';

const { width, height } = Dimensions.get('window');
const scaleFont = size => (width / 375) * size;

const NewGameScreen = () => {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const { t } = useTranslation();

  const options = [
    {
      title: t('game.playFriend'),
      icon: 'account-multiple-outline',
      onPress: () => navigation.navigate('FriendList'),
    },
    {
      title: t('game.findOpponent'),
      icon: 'sword-cross',
      onPress: () => navigation.navigate('FindOpponent'),
    },
  ];

  const Content = () => (
    <SafeAreaView style={styles.container}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
      />

      {/* ✅ Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}>
          <Icon name="chevron-back" size={26} color="#fff" />
        </TouchableOpacity>
        <Text style={[styles.headerText, { color: theme.text || '#fff' }]}>
          🧠 {t('game.newGame')}
        </Text>
        <View style={{ width: 30 }} />
      </View>

      {/* ✅ Timer and Button */}
      <View style={styles.timerContainer}>
        <View style={[styles.timerBox, { backgroundColor: '#174F78' }]}>
          <MaterialCommunityIcons name="timer-outline" size={20} color="#AEE6FF" />
          <Text style={[styles.timerText, { color: theme.text }]}>10 min</Text>
          <Icon name="chevron-down" size={20} color="#AEE6FF" />
        </View>

        <TouchableOpacity
          style={[styles.startButton, { backgroundColor: '#59C36A' }]}
          activeOpacity={0.8}>
          <Text style={[styles.startText, { color: '#fff' }]}>{t('game.startGame')}</Text>
        </TouchableOpacity>
      </View>

      {/* ✅ Game Options */}
      <View style={styles.optionContainer}>
        {options.map((opt, index) => (
          <TouchableOpacity
            key={index}
            onPress={opt.onPress}
            style={[styles.optionBox, { backgroundColor: '#174F78' }]}
            activeOpacity={0.8}>
            <MaterialCommunityIcons
              name={opt.icon}
              size={24}
              color="#FFD700"
              style={{ marginRight: 10 }}
            />
            <Text style={[styles.optionText, { color: theme.text }]}>
              {opt.title}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );

  return (
    <LinearGradient
      colors={theme.backgroundGradient || ['#0A192F', '#112D4E', '#1B4F72']}
      style={{ flex: 1 }}>
      <Content />
    </LinearGradient>
  );
};

export default NewGameScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: width * 0.06,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: height * 0.04,
    marginBottom: height * 0.04,
  },
  backButton: {
    padding: 5,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  headerText: {
    fontSize: scaleFont(22),
    fontWeight: '700',
  },
  timerContainer: {
    alignItems: 'center',
  },
  timerBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: width * 0.6,
    paddingVertical: height * 0.015,
    paddingHorizontal: 15,
    borderRadius: 15,
    marginBottom: height * 0.03,
  },
  timerText: {
    fontSize: scaleFont(16),
    fontWeight: '600',
  },
  startButton: {
    width: width * 0.6,
    paddingVertical: height * 0.02,
    borderRadius: 15,
    alignItems: 'center',
    elevation: 3,
  },
  startText: {
    fontSize: scaleFont(18),
    fontWeight: '700',
  },
  optionContainer: {
    marginTop: height * 0.05,
  },
  optionBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingVertical: height * 0.02,
    paddingHorizontal: 20,
    borderRadius: 15,
    marginBottom: 15,
  },
  optionText: {
    fontSize: scaleFont(16),
    fontWeight: '600',
  },
});

