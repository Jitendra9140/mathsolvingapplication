import React, { useState, useEffect } from 'react';
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
  AppState,
  Linking,
  Alert,
  Platform,
} from 'react-native';


import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../context/ThemeContext';
import { useSound } from '../context/SoundContext';
import messaging from '@react-native-firebase/messaging';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import CustomHeader from '../components/CustomHeader';

const { width, height } = Dimensions.get('window');
const scaleFont = size => size * PixelRatio.getFontScale();

const SettingsScreen = () => {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const { theme } = useTheme(); // Theme Hook
  const { isSoundOn, toggleSound, setIsSoundOn } = useSound();


  const [settings, setSettings] = useState({
    notification: true,
    sound: true,
    vibrate: true,
    music: true,
  });

  // ---------- Handle Toggle Change ----------
  // ✅ Check & Sync Notification Status
  const checkNotificationStatus = async () => {
    console.log("🔍 Checking notification status...");

    try {
      const storedValue = await AsyncStorage.getItem('notification');
      console.log("📦 Stored notification value:", storedValue);

      const parsed = storedValue === "true";
      console.log("🔄 Parsed value:", parsed);


      const permissionStatus = await messaging().hasPermission();
      console.log("📱 System permission raw:", permissionStatus);

      const isSystemAllowed =
        permissionStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        permissionStatus === messaging.AuthorizationStatus.PROVISIONAL;

      console.log("🔐 System allowed:", isSystemAllowed);

      const finalStatus = parsed && isSystemAllowed;

      console.log("✅ FINAL NOTIFICATION STATUS:", finalStatus);

      setSettings(prev => ({ ...prev, notification: finalStatus }));
    } catch (error) {
      console.log("❌ Error checking notification status:", error);
    }
  };

  // const checkNotificationStatus = async () => {
  //   try {
  //     if (Platform.OS === 'ios') {
  //       const authStatus = await messaging().requestPermission();
  //       const enabled =
  //         authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
  //         authStatus === messaging.AuthorizationStatus.PROVISIONAL;

  //       console.log("iOS PERMISSION STATUS →", enabled ? "GRANTED" : "DENIED");

  //       if (enabled) {
  //         showStyledAlert('✅ Permission Granted! You will receive notifications.');
  //       } else {
  //         showStyledAlert('❌ Permission Denied! Notifications are disabled.');
  //       }
  //     } else {
  //       // ANDROID
  //       if (Platform.Version >= 33) {
  //         const granted = await PermissionsAndroid.request(
  //           PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
  //           {
  //             title: 'Notification Permission',
  //             message: 'This app would like to send you notifications.',
  //             buttonPositive: 'Allow',
  //             buttonNegative: "Don’t Allow",
  //           },
  //         );

  //         console.log("ANDROID PERMISSION STATUS →", granted);

  //         if (granted === PermissionsAndroid.RESULTS.GRANTED) {
  //           console.log("ANDROID → PERMISSION ALLOWED");
  //           showStyledAlert('✅ Permission Granted! You will receive notifications.');
  //         } else {
  //           console.log("ANDROID → PERMISSION DENIED");
  //           showStyledAlert('❌ Permission Denied! Notifications are disabled.');
  //         }
  //       } else {
  //         console.log("ANDROID VERSION < 33 → Permission not required");
  //         // navigation.replace('ChooseThemeIntroScreen');
  //       }
  //     }
  //   } catch (error) {
  //     console.log('Permission request error:', error);
  //     showStyledAlert('⚠️ Error requesting permission.');
  //   }
  // };


  // ✅ Initial Load & AppState Listener
  useEffect(() => {
    checkNotificationStatus();

    const subscription = AppState.addEventListener('change', nextAppState => {
      if (nextAppState === 'active') {
        checkNotificationStatus(); // Re-check when app comes to foreground
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);

  // ---------- Handle Toggle Change ----------
  const handleToggle = async (value) => {
    console.log("🔄 User toggled:", value);


    console.log("⚙ Always opening system notification settings...");
    if (Platform.OS === "android") {
      Linking.openSettings();
    }


    if (value === true) {
      console.log("📨 UI: Notification turned ON (system will decide actual state)");
      await AsyncStorage.setItem("notification", "true");
      setSettings(prev => ({ ...prev, notification: true }));
    } else {
      console.log("🚫 UI: Notification turned OFF (system will decide actual state)");
      await AsyncStorage.setItem("notification", "false");
      setSettings(prev => ({ ...prev, notification: false }));
    }
  };

  // ✅ Setting Card with Icon
  const SettingCard = ({ label, stateKey, iconName }) => {
    const isSoundCard = stateKey === "sound";

    return (
      <View style={[
        styles.settingCard,
        {
          backgroundColor: theme.cardBackground || '#fff',
          borderColor: theme.borderColor || '#334155',
        }
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

        {/* 🔥 SOUND TOGGLE REAL CONTEXT VALUE */}
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
            onValueChange={(value) => handleToggle(value)}
          />
        )}

      </View>
    );
  };

  const Content = () => {
    const insets = useSafeAreaInsets();
    return (
      <View style={{ flex: 1, paddingTop: insets.top + 30 }}>
        <CustomHeader
          title={t('settings.settings').toUpperCase()}
          onBack={() => navigation.goBack()}
        />
        <View style={styles.container}>
          {/* Settings List (Separate Cards) */}
          <View style={styles.settingsList}>
            <SettingCard
              label={t('settings.enableNotifications')}
              stateKey="notification"
              iconName="bell-outline"
            />
            <SettingCard
              label={t('settings.sound')}
              stateKey="sound"
              iconName="volume-high"
            />
            {/* <SettingCard
          label="Vibrate"
          stateKey="vibrate"
          iconName="vibrate"
        />
        <SettingCard
          label="Music"
          stateKey="music"
          iconName="music"
        /> */}
          </View>
        </View>
      </View>
    );
  };

  // Background Theme
  return theme.backgroundGradient ? (
    <LinearGradient colors={theme.backgroundGradient} style={{ flex: 1 }}>
      <Content />
    </LinearGradient>
  ) : (
    <View
      style={{ flex: 1, backgroundColor: theme.backgroundColor || '#fff' }}>
      <Content />
    </View>
  );
};

export default SettingsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: width * 0.05,
    marginTop: height * -0.03,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: height * 0.01,
    paddingBottom: height * 0.01,
  },


  headerSeparator: {
    height: 1,
    backgroundColor: '#94A3B8',
    opacity: 0.5,
    top: 30,
    marginHorizontal: -width * 0.05,
    marginBottom: height * 0.04,
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
