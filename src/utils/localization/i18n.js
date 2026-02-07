import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as RNLocalize from 'react-native-localize';
import { I18nManager } from 'react-native';

// Import translation files
import en from './translations/en.json';
import hi from './translations/hi.json';
import es from './translations/es.json';
import zh from './translations/zh.json';

// 🔹 Language Resources
const resources = {
  en: { translation: en },
  hi: { translation: hi },
  es: { translation: es },
  zh: { translation: zh },
};

// 🔹 Supported languages
const supportedLanguages = ['en', 'hi', 'es', 'zh'];

// 🔹 RTL languages (can add 'ar' for Arabic later)
const rtlLanguages = [];

// 🔹 Get device language
const getDeviceLanguage = () => {
  const locales = RNLocalize.getLocales();
  
  if (Array.isArray(locales) && locales.length > 0) {
    // Get the first locale's language code
    const deviceLanguage = locales[0].languageCode;
    
    // Check if device language is supported
    if (supportedLanguages.includes(deviceLanguage)) {
      return deviceLanguage;
    }
    
    // Check for language variants (e.g., 'zh-CN' -> 'zh')
    const baseLanguage = deviceLanguage.split('-')[0];
    if (supportedLanguages.includes(baseLanguage)) {
      return baseLanguage;
    }
  }
  
  // Default to English if device language not supported
  return 'en';
};

// 🔹 Check if language is RTL
export const isRTL = (languageCode) => {
  return rtlLanguages.includes(languageCode);
};

// 🔹 Initialize i18n
const initI18n = async () => {
  try {
    // Get saved language from AsyncStorage
    const storedLang = await AsyncStorage.getItem('appLanguage');
    
    // Determine language to use
    let selectedLang;
    if (storedLang && supportedLanguages.includes(storedLang)) {
      // Use stored language if valid
      selectedLang = storedLang;
    } else {
      // Detect device language
      selectedLang = getDeviceLanguage();
      // Save detected language
      await AsyncStorage.setItem('appLanguage', selectedLang);
    }

    // Configure RTL if needed
    const shouldBeRTL = isRTL(selectedLang);
    if (I18nManager.isRTL !== shouldBeRTL) {
      I18nManager.forceRTL(shouldBeRTL);
      // Note: App needs to restart for RTL changes to take effect
    }

    // Initialize i18next
    await i18n.use(initReactI18next).init({
      compatibilityJSON: 'v3',
      resources,
      lng: selectedLang,
      fallbackLng: 'en',
      interpolation: {
        escapeValue: false, // React already escapes values
      },
      react: {
        useSuspense: false,
      },
      // Enable debug mode in development
      debug: __DEV__,
    });

    console.log('✅ i18n initialized with language:', selectedLang);
    console.log('📱 Device locales:', RNLocalize.getLocales());
    console.log('🌐 RTL mode:', shouldBeRTL);
  } catch (error) {
    console.error('⚠️ Error initializing i18n:', error);
    
    // Fallback initialization with English
    await i18n.use(initReactI18next).init({
      compatibilityJSON: 'v3',
      resources,
      lng: 'en',
      fallbackLng: 'en',
      interpolation: { escapeValue: false },
      react: { useSuspense: false },
    });
  }
};

// 🔹 Run initialization
initI18n();

// 🔹 Export i18n instance
export default i18n;

// 🔹 Export supported languages for UI
export { supportedLanguages, rtlLanguages };
