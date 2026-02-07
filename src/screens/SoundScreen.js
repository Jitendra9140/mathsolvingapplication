import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  SafeAreaView,
  Dimensions,
  Vibration,
  PixelRatio,
} from 'react-native';

import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import { useTheme } from '../context/ThemeContext';
import { useSound } from '../context/SoundContext';   // 🔥 ADD THIS
import CustomHeader from '../components/CustomHeader';
import { useTranslation } from 'react-i18next';

const { width, height } = Dimensions.get('window');
const scaleFont = size => size * PixelRatio.getFontScale();

const SoundScreen = () => {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const { t } = useTranslation();

  // 🔥 GLOBAL SOUND CONTEXT
  const { isSoundOn, toggleSound } = useSound();

  // Local states for other toggles
  const [settings, setSettings] = useState({
    vibrate: true,
    music: true,
  });

  // Local toggles
  const handleToggle = key => {
    const newValue = !settings[key];

    if (key === 'vibrate' && newValue) {
      Vibration.vibrate(300);
    }

    setSettings(prev => ({ ...prev, [key]: newValue }));
  };

  // ---------- Setting Card ----------
  const SettingCard = ({ label, stateKey, iconName }) => {
    const isSoundCard = stateKey === "sound";

    return (
      <View
        style={[
          styles.settingCard,
          {
            backgroundColor: theme.cardBackground || '#fff',
            borderColor: theme.borderColor || '#334155',
          },
        ]}>

        <View style={styles.iconLabelContainer}>
          <MaterialCommunityIcons
            name={iconName}
            size={scaleFont(22)}
            color={theme.primaryColor || '#10B981'}
            style={styles.settingIcon}
          />
          <Text style={[styles.label, { color: theme.text || '#000' }]}>
            {label}
          </Text>
        </View>

        {/* 🔥 SOUND SWITCH = GLOBAL */}
        {isSoundCard ? (
          <Switch
            trackColor={{
              false: theme.secondaryColor || '#D1D5DB',
              true: theme.primaryColor || '#10B981',
            }}
            thumbColor={isSoundOn ? '#fff' : theme.thumbColor || '#71717A'}
            value={isSoundOn}
            onValueChange={toggleSound}
          />
        ) : (
          <Switch
            trackColor={{
              false: theme.secondaryColor || '#D1D5DB',
              true: theme.primaryColor || '#10B981',
            }}
            thumbColor={settings[stateKey] ? '#fff' : theme.thumbColor || '#71717A'}
            value={settings[stateKey]}
            onValueChange={() => handleToggle(stateKey)}
          />
        )}

      </View>
    );
  };

  const Content = () => (
    <View style={{ flex: 1, paddingTop: height * 0.03 }}>
      <CustomHeader
        title={t('sound.soundSettings')}
        onBack={() => navigation.goBack()}
      />
      <View style={styles.container}>
        {/* Settings List */}
        <View style={styles.settingsList}>

          {/* 🔥 Sound is Global */}
          <SettingCard label={t('sound.sound')} stateKey="sound" iconName="volume-high" />

          {/* <SettingCard label="Vibrate" stateKey="vibrate" iconName="vibrate" />
        <SettingCard label="Music" stateKey="music" iconName="music" /> */}

        </View>
      </View>
    </View>
  );

  return theme.backgroundGradient ? (
    <LinearGradient colors={theme.backgroundGradient} style={{ flex: 1 }}>
      <Content />
    </LinearGradient>
  ) : (
    <View style={{ flex: 1, backgroundColor: theme.backgroundColor || '#fff' }}>
      <Content />
    </View>
  );
};


export default SoundScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: width * 0.05,
    marginTop: height * - 0.03,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    // paddingTop: height * 0.01,
    // paddingBottom: height * 0.01,
  },

  headerSeparator: {
    height: 1,
    backgroundColor: '#94A3B8',
    opacity: 0.5,
    top: 28,
    marginHorizontal: -width * 0.09,
    // marginBottom: height * 0.04,

  },

  backButton: {
    paddingRight: 15,
    flex: 0.15,
  },

  headerTitle: {
    fontSize: scaleFont(22),
    fontWeight: '800',
    flex: 1,
    textAlign: 'center',
    marginLeft: -width * 0.08,
  },

  rightPlaceholder: {
    flex: 0.15,
  },

  settingsList: {
    marginTop: height * 0.04,
  },

  settingCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: width * 0.05,
    paddingVertical: height * 0.02,
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: height * 0.02,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 2,
  },

  iconLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },

  settingIcon: {
    marginRight: 15,
    width: scaleFont(25),
    textAlign: 'center',
  },

  label: {
    fontSize: scaleFont(16),
    fontWeight: '500',
  },
});

