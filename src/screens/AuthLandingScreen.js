import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ImageBackground,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useTheme } from '../context/ThemeContext';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';

const { width, height } = Dimensions.get('window');

const AuthLandingScreen = () => {
  const { theme } = useTheme();
  const navigation = useNavigation();
  const { t } = useTranslation();
  const primaryColor = theme?.primary || '#FB923C';

  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient
        colors={theme.backgroundGradient || ['#00F5FF', '#00C3FF', '#006BFF']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}>

        {/* Background Logo Image */}
        <ImageBackground
          source={require('../assets/logo.png')}
          resizeMode="contain"
          style={styles.logoBg}
          imageStyle={{ opacity: 0.5 }} // low transparency
        />

        {/* Bottom Buttons */}
        <View style={styles.bottomContainer}>
          <View style={styles.buttonRow}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => navigation.navigate('SignUp')}
              style={[styles.btn, { borderColor: primaryColor }]}>
              <Text style={[styles.btnText, { color: primaryColor }]}>
                {t('auth.signUpTitle')}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => navigation.navigate('Login')}
              style={[styles.btn, { backgroundColor: primaryColor }]}>
              <Text style={[styles.btnText, { color: '#fff' }]}>
                {t('auth.signInTitle')}
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => navigation.navigate('GuestHome')}>
            <Text style={styles.guestText}>
              {t('auth.continueAsGuest')}
            </Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
};

export default AuthLandingScreen;

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  gradient: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  logoBg: {
    position: 'absolute',
    top: height * 0.15,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: height * 0.6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomContainer: {
    width: '90%',
    alignItems: 'center',
    marginBottom: height * 0.04,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 40,
  },
  btn: {
    flex: 1,
    borderRadius: 50,
    borderWidth: 1.2,
    paddingVertical: height * 0.02,
    marginHorizontal: 15,
    alignItems: 'center',
  },
  btnText: {
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  guestText: {
    fontSize: 15,
    color: '#fff',
    opacity: 0.9,
    fontStyle: 'italic',
  },
});

