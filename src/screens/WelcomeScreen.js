import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  StatusBar,
  Dimensions,
  Animated,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';
import LinearGradient from 'react-native-linear-gradient';
import { useTranslation } from 'react-i18next';

const { width, height } = Dimensions.get('window');

const WelcomeScreen = () => {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const { t } = useTranslation();

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(-30)).current;

  useEffect(() => {
    // Animate text fade + slide down
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1500,
      useNativeDriver: true,
    }).start();

    Animated.spring(translateY, {
      toValue: 0,
      friction: 4,
      tension: 40,
      useNativeDriver: true,
    }).start();

    // Auto navigate after delay
    const timer = setTimeout(() => {
      navigation.replace('BottomTab');
    }, 1000);

    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <LinearGradient
      colors={theme.backgroundGradient || ['#0f162b', '#0f162b']}
      style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={theme.primary} />

      {/* Background Logo */}
      <ImageBackground
        source={require('../assets/logo.png')}
        style={styles.backgroundImage}
        resizeMode="contain"
        imageStyle={{ opacity: 0.1 }}
      />

      {/* Animated Welcome Text */}
      <Animated.View
        style={[
          styles.textContainer,
          {
            opacity: fadeAnim,
            transform: [{ translateY }],
          },
        ]}>
        <Text style={[styles.welcomeText, { color: theme.text }]}>
          {t('screens.welcomeTo')}
        </Text>
        <Text
          style={[
            styles.appName,
            { color: theme.primary || '#FB923C' },
          ]}>
          {t('screens.appName')}
        </Text>
      </Animated.View>
    </LinearGradient>
  );
};

export default WelcomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backgroundImage: {
    position: 'absolute',
    width: width * 0.9,
    height: height * 0.6,
    top: height * 0.2,
    alignSelf: 'center',
  },
  textContainer: {
    alignItems: 'center',
    marginTop: -height * 0.1,
  },
  welcomeText: {
    fontSize: width * 0.065,
    fontWeight: '600',
    letterSpacing: 1,
  },
  appName: {
    fontSize: width * 0.1,
    fontWeight: '800',
    letterSpacing: 2,
  },
});

