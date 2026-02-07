import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  PixelRatio,
  SafeAreaView,
  Image,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import i18n from '../utils/localization/i18n';
import { changeLanguage, getAvailableLanguages } from '../utils/localization/i18nHelpers';

const { width, height } = Dimensions.get('window');
const scaleFont = size => size * PixelRatio.getFontScale();

const LanguageSelectionScreen = () => {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const [selectedLang, setSelectedLang] = useState(null);

  // Default Color Setup (Theme remove hone ke baad)
  const primaryColor = '#FB923C';
  const bgGradient = ['#0f172a', '#1e293b']; // Default dark gradient

  // Get available languages from helper
  const languages = getAvailableLanguages().map((lang, index) => ({
    id: index + 1,
    label: lang.nativeName,
    code: lang.code,
  }));

  // Set current language as selected on mount
  useEffect(() => {
    const currentLang = i18n.language;
    const currentLangObj = languages.find(l => l.code === currentLang);
    if (currentLangObj) {
      setSelectedLang(currentLangObj.id);
    }
  }, []);

  const handleLanguageSelect = async lang => {
    setSelectedLang(lang.id);
    await changeLanguage(lang.code, true); // Skip restart for now
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient colors={bgGradient} style={styles.container}>

        {/* 🌍 Header */}
        <View style={styles.headerContainer}>
          <Image
            source={require('../assets/language1.png')}
            style={styles.languageIcon}
          />
          <Text style={styles.title}>{t('language.selectLanguage')}</Text>
        </View>


        {/* 🌐 Language List */}
        <View style={styles.languageContainer}>
          {languages.map(lang => (
            <TouchableOpacity
              key={lang.id}
              onPress={() => handleLanguageSelect(lang)}
              activeOpacity={0.7}
              style={[
                styles.langButton,
                {
                  borderColor: selectedLang === lang.id ? primaryColor : '#ffffff40',
                  backgroundColor: selectedLang === lang.id ? '#ffffff20' : 'transparent',
                },
              ]}>
              <Text
                style={[
                  styles.langText,
                  {
                    color: selectedLang === lang.id ? '#fff' : '#e0e0e0',
                  },
                ]}>
                {lang.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* 🚀 Continue */}
        <TouchableOpacity
          disabled={!selectedLang}
          activeOpacity={0.8}
          onPress={() =>
            navigation.navigate('LanguageConfirmationScreen', {
              selectedLanguage: languages.find(l => l.id === selectedLang)?.label
            })
          }
          style={[
            styles.continueButton,
            { backgroundColor: primaryColor, opacity: selectedLang ? 1 : 0.6 },
          ]}>
          <Text style={styles.continueText}>{t('common.continue')}</Text>
        </TouchableOpacity>

      </LinearGradient>
    </SafeAreaView>
  );
};

export default LanguageSelectionScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: width * 0.07,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: height * 0.05,
  },
  languageIcon: {
    width: width * 0.18,
    height: width * 0.18,
    resizeMode: 'contain',
    marginBottom: height * 0.015,
  },
  title: {
    fontSize: scaleFont(20),
    color: '#ffffff',
    textAlign: 'center',
    fontWeight: '700',
    lineHeight: 28,
  },
  languageContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: height * 0.08,
  },
  langButton: {
    width: '90%',
    borderWidth: 1,
    borderRadius: width * 0.03,
    paddingVertical: height * 0.018,
    marginVertical: height * 0.012,
    alignItems: 'center',
  },
  langText: {
    fontSize: scaleFont(18),
    fontWeight: '600',
  },
  continueButton: {
    width: width * 0.6,
    height: height * 0.065,
    borderRadius: width * 0.08,
    alignItems: 'center',
    justifyContent: 'center',
  },
  continueText: {
    color: '#fff',
    fontSize: scaleFont(18),
    fontWeight: '700',
  },
});
