import i18n, { isRTL } from './i18n';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { I18nManager, Alert } from 'react-native';

/**
 * Change the app language
 * @param {string} languageCode - Language code (e.g., 'en', 'hi', 'es', 'zh')
 * @param {boolean} skipRestart - Skip app restart (for RTL changes)
 * @returns {Promise<boolean>} - Success status
 */
export const changeLanguage = async (languageCode, skipRestart = false) => {
  try {
    const currentLang = i18n.language;
    
    // Check if language is already active
    if (currentLang === languageCode) {
      console.log('Language already set to:', languageCode);
      return true;
    }

    // Check if RTL change is needed
    const currentRTL = isRTL(currentLang);
    const newRTL = isRTL(languageCode);
    const needsRTLChange = currentRTL !== newRTL;

    // Change language in i18next
    await i18n.changeLanguage(languageCode);
    
    // Save to AsyncStorage
    await AsyncStorage.setItem('appLanguage', languageCode);
    
    console.log('✅ Language changed to:', languageCode);

    // Handle RTL change if needed
    if (needsRTLChange && !skipRestart) {
      I18nManager.forceRTL(newRTL);
      
      // Show alert to inform user about restart requirement
      Alert.alert(
        i18n.t('language.confirmLanguageChange'),
        'Please close and restart the app to apply RTL layout changes.',
        [
          {
            text: i18n.t('common.ok'),
            style: 'default',
          },
        ]
      );
    }

    return true;
  } catch (error) {
    console.error('❌ Error changing language:', error);
    return false;
  }
};

/**
 * Get current language code
 * @returns {string} - Current language code
 */
export const getCurrentLanguage = () => {
  return i18n.language || 'en';
};

/**
 * Get current language name
 * @returns {string} - Current language name
 */
export const getCurrentLanguageName = () => {
  const lang = getCurrentLanguage();
  const languageNames = {
    en: 'English',
    hi: 'हिंदी',
    es: 'Español',
    zh: '中文',
  };
  return languageNames[lang] || 'English';
};

/**
 * Check if current language is RTL
 * @returns {boolean} - True if RTL
 */
export const isCurrentLanguageRTL = () => {
  return isRTL(getCurrentLanguage());
};

/**
 * Get all available languages
 * @returns {Array} - Array of language objects
 */
export const getAvailableLanguages = () => {
  return [
    { code: 'en', name: 'English', nativeName: 'English' },
    { code: 'hi', name: 'Hindi', nativeName: 'हिंदी' },
    { code: 'es', name: 'Spanish', nativeName: 'Español' },
    { code: 'zh', name: 'Chinese', nativeName: '中文' },
  ];
};

/**
 * Format date based on current locale
 * @param {Date} date - Date to format
 * @param {object} options - Intl.DateTimeFormat options
 * @returns {string} - Formatted date string
 */
export const formatDate = (date, options = {}) => {
  const lang = getCurrentLanguage();
  const defaultOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    ...options,
  };
  
  try {
    return new Intl.DateTimeFormat(lang, defaultOptions).format(date);
  } catch (error) {
    console.error('Error formatting date:', error);
    return date.toLocaleDateString();
  }
};

/**
 * Format number based on current locale
 * @param {number} number - Number to format
 * @param {object} options - Intl.NumberFormat options
 * @returns {string} - Formatted number string
 */
export const formatNumber = (number, options = {}) => {
  const lang = getCurrentLanguage();
  
  try {
    return new Intl.NumberFormat(lang, options).format(number);
  } catch (error) {
    console.error('Error formatting number:', error);
    return number.toString();
  }
};

/**
 * Format currency based on current locale
 * @param {number} amount - Amount to format
 * @param {string} currency - Currency code (e.g., 'USD', 'INR')
 * @returns {string} - Formatted currency string
 */
export const formatCurrency = (amount, currency = 'USD') => {
  const lang = getCurrentLanguage();
  
  try {
    return new Intl.NumberFormat(lang, {
      style: 'currency',
      currency: currency,
    }).format(amount);
  } catch (error) {
    console.error('Error formatting currency:', error);
    return `${currency} ${amount}`;
  }
};

/**
 * Get RTL-aware flex direction
 * @returns {string} - 'row' or 'row-reverse'
 */
export const getFlexDirection = () => {
  return isCurrentLanguageRTL() ? 'row-reverse' : 'row';
};

/**
 * Get RTL-aware text alignment
 * @returns {string} - 'left' or 'right'
 */
export const getTextAlign = () => {
  return isCurrentLanguageRTL() ? 'right' : 'left';
};

/**
 * Translate with fallback
 * @param {string} key - Translation key
 * @param {object} options - Translation options
 * @returns {string} - Translated string or key if not found
 */
export const translate = (key, options = {}) => {
  try {
    const translation = i18n.t(key, options);
    // If translation returns the key itself, it means translation is missing
    if (translation === key) {
      console.warn(`Missing translation for key: ${key}`);
    }
    return translation;
  } catch (error) {
    console.error(`Error translating key ${key}:`, error);
    return key;
  }
};

export default {
  changeLanguage,
  getCurrentLanguage,
  getCurrentLanguageName,
  isCurrentLanguageRTL,
  getAvailableLanguages,
  formatDate,
  formatNumber,
  formatCurrency,
  getFlexDirection,
  getTextAlign,
  translate,
};
