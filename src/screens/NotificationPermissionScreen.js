import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
  Platform,
  PermissionsAndroid,
  Modal,
  PixelRatio,
  StatusBar,
  SafeAreaView,
} from 'react-native';
import messaging from '@react-native-firebase/messaging';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext'; // ✅ use theme

const { width, height } = Dimensions.get('window');
const scaleFont = (size) => size * PixelRatio.getFontScale();

const NotificationPermissionScreen = () => {
  const navigation = useNavigation();
  const { theme } = useTheme(); // ✅ get theme
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');

  const showStyledAlert = (message) => {
    setAlertMessage(message);
    setAlertVisible(true);

    setTimeout(() => {
      setAlertVisible(false);
      navigation.replace('ChooseThemeIntroScreen');
    }, 2000);
  };

  const requestNotificationPermission = async () => {
    try {
      if (Platform.OS === 'ios') {
        const authStatus = await messaging().requestPermission();
        const enabled =
          authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
          authStatus === messaging.AuthorizationStatus.PROVISIONAL;

        console.log("iOS PERMISSION STATUS →", enabled ? "GRANTED" : "DENIED");

        if (enabled) {
          showStyledAlert('✅ Permission Granted! You will receive notifications.');
        } else {
          showStyledAlert('❌ Permission Denied! Notifications are disabled.');
        }
      } else {
        // ANDROID
        if (Platform.Version >= 33) {
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
            {
              title: 'Notification Permission',
              message: 'This app would like to send you notifications.',
              buttonPositive: 'Allow',
              buttonNegative: "Don’t Allow",
            },
          );

          console.log("ANDROID PERMISSION STATUS →", granted);

          if (granted === PermissionsAndroid.RESULTS.GRANTED) {
            console.log("ANDROID → PERMISSION ALLOWED");
            showStyledAlert('✅ Permission Granted! You will receive notifications.');
          } else {
            console.log("ANDROID → PERMISSION DENIED");
            showStyledAlert('❌ Permission Denied! Notifications are disabled.');
          }
        } else {
          console.log("ANDROID VERSION < 33 → Permission not required");
          navigation.replace('ChooseThemeIntroScreen');
        }
      }
    } catch (error) {
      console.log('Permission request error:', error);
      showStyledAlert('⚠️ Error requesting permission.');
    }
  };

  const Content = () => (
    <View style={styles.innerContainer}>
      <View style={styles.textContainer}>
        <Text style={styles.title}>Welcome</Text>
        <Text style={styles.subtitle}>
          Stay updated! Allow notifications to get the latest alerts.
        </Text>
      </View>

      <Image
        source={require('../assets/logo3.png')}
        style={styles.logo}
        resizeMode="contain"
      />

      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={[styles.button, styles.dontAllowBtn]}
          onPress={() => navigation.replace('ChooseThemeIntroScreen')}>
          <Text style={styles.dontAllowText}>Don’t Allow</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.allowBtn]}
          onPress={requestNotificationPermission}>
          <LinearGradient
            colors={[theme.primary || '#FB923C', theme.primary || '#FB923C']}
            style={styles.allowGradient}>
            <Text style={styles.allowText}>Allow</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* ✅ Apply theme background gradient */}
      {theme.backgroundGradient ? (
        <LinearGradient colors={theme.backgroundGradient} style={styles.container}>
          <Content />
        </LinearGradient>
      ) : (
        <View
          style={[
            styles.container,
            { backgroundColor: theme.backgroundColor || '#0f162b' },
          ]}>
          <StatusBar
            backgroundColor={theme.backgroundColor || '#0f162b'}
            barStyle="light-content"
          />
          <Content />
        </View>
      )}

      {/* ✅ Styled Alert */}
      <Modal transparent visible={alertVisible} animationType="fade">
        <View style={styles.alertOverlay}>
          <View style={styles.alertBox}>
            <Text style={styles.alertText}>{alertMessage}</Text>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default NotificationPermissionScreen;

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  innerContainer: {
    alignItems: 'center',
    paddingHorizontal: width * 0.05,
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: height * 0.05,
    top: -10,
  },
  title: {
    color: '#fff',
    fontSize: scaleFont(30),
    fontWeight: 'bold',
    marginBottom: height * 0.015,
  },
  subtitle: {
    color: '#94A3B8',
    fontSize: scaleFont(18),
    textAlign: 'center',
    marginHorizontal: width * 0.08,
  },
  logo: {
    width: width * 0.55,
    height: width * 0.55,
    marginBottom: height * 0.07,
    borderRadius: 40,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '90%',
    top: 10,
  },
  button: {
    flex: 1,
    marginHorizontal: 10,
    borderRadius: width * 0.07,
    overflow: 'hidden',
  },
  dontAllowBtn: {
    borderWidth: 1,
    borderColor: '#fff',
    backgroundColor: 'transparent',
  },
  dontAllowText: {
    color: '#fff',
    fontSize: scaleFont(16),
    fontWeight: '500',
    textAlign: 'center',
    paddingVertical: height * 0.017,
  },
  allowBtn: {
    borderColor: '#FB923C',
  },
  allowGradient: {
    paddingVertical: height * 0.017,
    alignItems: 'center',
    borderRadius: width * 0.07,
  },
  allowText: {
    color: '#fff',
    fontSize: scaleFont(16),
    fontWeight: '600',
  },
  alertOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  alertBox: {
    backgroundColor: '#1f2a44',
    padding: 20,
    borderRadius: 10,
    width: width * 0.8,
  },
  alertText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: scaleFont(16),
  },
});

