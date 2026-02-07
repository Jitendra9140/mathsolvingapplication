import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useTheme } from '../context/ThemeContext';
import { useTranslation } from 'react-i18next';
import { useNavigation, useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');

const LanguageConfirmationScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { theme } = useTheme();
  const { t } = useTranslation();
  const { selectedLanguage } = route.params || { selectedLanguage: 'English' };

  const primaryColor = theme?.primary || '#FB923C';

  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient
        colors={theme.backgroundGradient || ['#00F5FF', '#00C3FF', '#006BFF']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.container}>

        {/* Floating Card */}
        <View style={styles.card}>
          <LinearGradient
            colors={['rgba(255,255,255,0.15)', 'rgba(255,255,255,0.05)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.glassBox}>
            <Text style={styles.titleText}>{t('You have Selected:')}</Text>
            <Text style={styles.languageText}>{selectedLanguage}</Text>
          </LinearGradient>

          {/* Buttons */}
          <View style={styles.buttonRow}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => navigation.goBack()}
              style={styles.goBackBtn}>
              <LinearGradient
                colors={['rgba(255,255,255,0.2)', 'rgba(255,255,255,0.1)']}
                style={styles.btnInner}>
                <Text style={[styles.btnText, { color: primaryColor }]}>
                  {t('Go Back')}
                </Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.9}
              onPress={async () => {
                await AsyncStorage.setItem('firstLaunch', 'false');
                navigation.navigate('OnBoarding');
              }}
              style={styles.okayBtn}>
              <LinearGradient
                colors={[primaryColor, '#ffb15b']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.btnInner}>
                <Text style={[styles.btnText, { color: '#fff' }]}>
                  {t('Okay')}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
};

export default LanguageConfirmationScreen;

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: width * 0.07,
  },
  card: {
    width: '90%',
    borderRadius: width * 0.05,
    paddingVertical: height * 0.05,
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 8,
    backdropFilter: 'blur(10px)',
  },
  glassBox: {
    width: '85%',
    borderRadius: 15,
    paddingVertical: height * 0.03,
    paddingHorizontal: width * 0.05,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    alignItems: 'center',
    marginBottom: height * 0.06,
  },
  titleText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
    // textTransform: 'uppercase',
    letterSpacing: 1,
  },
  languageText: {
    color: '#fff',
    fontSize: 26,
    fontWeight: '800',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '75%',
  },
  goBackBtn: {
    flex: 1,
    borderRadius: 12,
    marginHorizontal: 6,
    overflow: 'hidden',
    borderWidth: 1.2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  okayBtn: {
    flex: 1,
    borderRadius: 12,
    marginHorizontal: 6,
    overflow: 'hidden',
  },
  btnInner: {
    paddingVertical: height * 0.02,
    alignItems: 'center',
    borderRadius: 12,
  },
  btnText: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});

