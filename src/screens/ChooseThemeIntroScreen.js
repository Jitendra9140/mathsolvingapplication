import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  Image,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext'; // ✅ Theme hook
import { useTranslation } from 'react-i18next';

const { width, height } = Dimensions.get('window');

const ChooseThemeIntroScreen = () => {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const { t } = useTranslation();

  return (
    <LinearGradient
      colors={theme.backgroundGradient || ['#0E1220', '#0E1220']}
      style={styles.container}>
      <View style={styles.innerContainer}>
        {/* Title */}
        <Text style={styles.title}>{t('onboarding.chooseTheme').toUpperCase()}</Text>

        {/* Center Image */}
        <Image
          source={require('../assets/cooseTheme.png')} // 🖼️ replace with your actual image path
          style={styles.centerImage}
          resizeMode="contain"
        />

        {/* Buttons */}
        <View style={styles.buttonRow}>
          <TouchableOpacity
            onPress={() => navigation.replace('AddFriendScreen')}
            style={styles.skipButton}>
            <Text style={styles.skipText}>{t('common.skip')}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() =>
              navigation.replace('ThemeSelectorScreen', { from: 'onboarding' })
            }
            style={[
              styles.continueButton,
              { backgroundColor: theme.primary || '#FB923C' },
            ]}>
            <Text style={styles.continueText}>{t('common.continue')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </LinearGradient>
  );
};

export default ChooseThemeIntroScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  innerContainer: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: height * 0.08,
  },
  title: {
    color: '#fff',
    fontSize: width * 0.075,
    fontWeight: '900',
    textAlign: 'center',
    letterSpacing: 1,
    marginTop: height * 0.05,
  },
  centerImage: {
    width: width * 0.7,
    height: height * 0.4,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: width * 0.05,
    marginBottom: height * 0.06,
  },
  skipButton: {
    borderWidth: 2,
    borderColor: '#fff',
    paddingVertical: height * 0.015,
    paddingHorizontal: width * 0.1,
    borderRadius: width * 0.08,
  },
  skipText: {
    color: '#fff',
    fontSize: width * 0.045,
    fontWeight: '600',
  },
  continueButton: {
    paddingVertical: height * 0.015,
    paddingHorizontal: width * 0.1,
    borderRadius: width * 0.08,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FB923C',
    shadowOpacity: 0.6,
    shadowRadius: 8,
    elevation: 8,
  },
  continueText: {
    color: '#fff',
    fontSize: width * 0.045,
    fontWeight: '700',
  },
});

