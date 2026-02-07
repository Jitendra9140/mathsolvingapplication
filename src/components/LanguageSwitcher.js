import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Dimensions,
  PixelRatio,
  ScrollView,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useTranslation } from 'react-i18next';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {
  changeLanguage,
  getAvailableLanguages,
  getCurrentLanguage,
} from '../utils/localization/i18nHelpers';

const { width, height } = Dimensions.get('window');
const scaleFont = size => size * PixelRatio.getFontScale();

/**
 * LanguageSwitcher Component
 * A reusable modal-based language selector that can be embedded anywhere in the app
 * 
 * @param {boolean} visible - Controls modal visibility
 * @param {function} onClose - Callback when modal is closed
 * @param {string} primaryColor - Primary color for UI elements (optional)
 */
const LanguageSwitcher = ({ visible, onClose, primaryColor = '#FB923C' }) => {
  const { t } = useTranslation();
  const [selectedLang, setSelectedLang] = useState(getCurrentLanguage());
  const [isChanging, setIsChanging] = useState(false);

  const languages = getAvailableLanguages();

  const handleLanguageSelect = async (languageCode) => {
    if (languageCode === selectedLang) {
      onClose();
      return;
    }

    setIsChanging(true);
    const success = await changeLanguage(languageCode);
    
    if (success) {
      setSelectedLang(languageCode);
      // Close modal after a short delay to show selection
      setTimeout(() => {
        setIsChanging(false);
        onClose();
      }, 300);
    } else {
      setIsChanging(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <LinearGradient
            colors={['#1E293B', '#0F172A']}
            style={styles.modalGradient}>
            
            {/* Header */}
            <View style={styles.header}>
              <MaterialCommunityIcons
                name="translate"
                size={28}
                color={primaryColor}
              />
              <Text style={styles.title}>{t('language.selectLanguage')}</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={onClose}
                disabled={isChanging}>
                <MaterialCommunityIcons
                  name="close"
                  size={24}
                  color="#94A3B8"
                />
              </TouchableOpacity>
            </View>

            {/* Current Language */}
            <View style={styles.currentLanguageContainer}>
              <Text style={styles.currentLanguageLabel}>
                {t('language.currentLanguage')}:
              </Text>
              <Text style={[styles.currentLanguageText, { color: primaryColor }]}>
                {languages.find(l => l.code === selectedLang)?.nativeName}
              </Text>
            </View>

            {/* Language List */}
            <ScrollView style={styles.languageList}>
              {languages.map((language) => {
                const isSelected = language.code === selectedLang;
                
                return (
                  <TouchableOpacity
                    key={language.code}
                    style={[
                      styles.languageItem,
                      {
                        borderColor: isSelected ? primaryColor : '#ffffff20',
                        backgroundColor: isSelected ? '#ffffff10' : 'transparent',
                      },
                    ]}
                    onPress={() => handleLanguageSelect(language.code)}
                    disabled={isChanging}
                    activeOpacity={0.7}>
                    
                    {/* Language Icon */}
                    <View
                      style={[
                        styles.languageIcon,
                        { backgroundColor: isSelected ? primaryColor : '#334155' },
                      ]}>
                      <Text style={styles.languageIconText}>
                        {language.nativeName.charAt(0)}
                      </Text>
                    </View>

                    {/* Language Info */}
                    <View style={styles.languageInfo}>
                      <Text style={styles.languageName}>
                        {language.nativeName}
                      </Text>
                      <Text style={styles.languageEnglishName}>
                        {language.name}
                      </Text>
                    </View>

                    {/* Selection Indicator */}
                    {isSelected && (
                      <MaterialCommunityIcons
                        name="check-circle"
                        size={24}
                        color={primaryColor}
                      />
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* Info Text */}
            <Text style={styles.infoText}>
              {t('language.languageChangeMessage')}
            </Text>
          </LinearGradient>
        </View>
      </View>
    </Modal>
  );
};

export default LanguageSwitcher;

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: width * 0.9,
    maxWidth: 400,
    maxHeight: height * 0.7,
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
  },
  modalGradient: {
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    flex: 1,
    fontSize: scaleFont(20),
    fontWeight: 'bold',
    color: '#fff',
    marginLeft: 12,
  },
  closeButton: {
    padding: 4,
  },
  currentLanguageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: 12,
    borderRadius: 10,
    marginBottom: 16,
  },
  currentLanguageLabel: {
    fontSize: scaleFont(14),
    color: '#94A3B8',
    marginRight: 8,
  },
  currentLanguageText: {
    fontSize: scaleFont(16),
    fontWeight: '600',
  },
  languageList: {
    maxHeight: height * 0.4,
  },
  languageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  languageIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  languageIconText: {
    fontSize: scaleFont(18),
    fontWeight: 'bold',
    color: '#fff',
  },
  languageInfo: {
    flex: 1,
  },
  languageName: {
    fontSize: scaleFont(16),
    fontWeight: '600',
    color: '#fff',
    marginBottom: 2,
  },
  languageEnglishName: {
    fontSize: scaleFont(13),
    color: '#94A3B8',
  },
  infoText: {
    fontSize: scaleFont(12),
    color: '#64748B',
    textAlign: 'center',
    marginTop: 16,
    lineHeight: 18,
  },
});
