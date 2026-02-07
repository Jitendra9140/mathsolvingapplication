import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Image,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Modal,
  FlatList,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Toast from 'react-native-toast-message';
import { useNavigation } from '@react-navigation/native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';

import Geolocation from 'react-native-geolocation-service';
import { check, request, PERMISSIONS, RESULTS } from 'react-native-permissions';
import Icon from 'react-native-vector-icons/Ionicons';
import Icon6 from 'react-native-vector-icons/FontAwesome6';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import CustomHeader from '../components/CustomHeader';
import AuthHeader from '../components/AuthHeader';
import { wp, hp, normalizeFont } from '../utils/Responsive';

const { width, height } = Dimensions.get('window');

// ✅ Enhanced normalize for full responsiveness
// const scale = width / 375;
// const verticalScale = height / 812;
// const moderateScale = (size, factor = 0.5) =>
//   size + (scale * size - size) * factor;
// const normalize = size => Math.round(moderateScale(size));

export default function SignUp() {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const [username, setUserName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [country, setCountry] = useState('');
  const [countryFlag, setCountryFlag] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [otp, setotp] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [gender, setGender] = useState('');
  const [showGenderOptions, setShowGenderOptions] = useState(false);
  const [showYearPicker, setShowYearPicker] = useState(false); // ✅ Year Picker State
  const [errors, setErrors] = useState({});
  const [isTicked, setIsTicked] = useState(false);
  const [tncError, setTncError] = useState(false);


  useEffect(() => {
    getUserLocation();
  }, []);

  const getUserLocation = async () => {
    try {
      const hasRequested = await AsyncStorage.getItem('locationPermissionRequested');
      if (hasRequested) {
        return;
      }

      const permission = await request(
        Platform.OS === 'android'
          ? PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION
          : PERMISSIONS.IOS.LOCATION_WHEN_IN_USE,
      );

      // ✅ Mark as requested immediately so we don't ask again
      await AsyncStorage.setItem('locationPermissionRequested', 'true');

      if (permission === RESULTS.GRANTED) {
        Geolocation.getCurrentPosition(
          async position => {
            const { latitude, longitude } = position.coords;

            const response = await fetch(
              `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`,
            );
            const data = await response.json();

            if (data) {
              const countryName = data.countryName || '';
              const countryCode = data.countryCode || '';
              // const flag = getFlagEmoji(countryCode);

              // ❌ NO CITY  
              // ONLY COUNTRY
              setCountry(countryName);
              // setCountryFlag(flag);
            }
          },
          error => {
            console.log(error);
            Toast.show({
              type: 'error',
              text1: t('errors.locationError'),
              text2: t('notifications.tryAgainLater'),
            });
          },
          { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 },
        );
      } else {
        Toast.show({
          type: 'info',
          text1: t('errors.permissionDenied'),
          text2: t('errors.enableLocation'),
        });
      }
    } catch (err) {
      console.log(err);
    }
  };

  // const getFlagEmoji = countryCode => {
  //   if (!countryCode) return '';
  //   return countryCode
  //     .toUpperCase()
  //     .replace(/./g, char => String.fromCodePoint(127397 + char.charCodeAt(0)));
  // };

  // Generate years (Current year down to 100 years ago)
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 100 }, (_, i) => (currentYear - i).toString());

  const validateEmail = email => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const handleSignUp = async () => {
    let tempErrors = {};

    // ✅ T&C validation
    if (!isTicked) {
      setTncError(true);
      return;
    } else {
      setTncError(false);
    }

    // ✅ Frontend validations
    if (!username.trim()) tempErrors.username = t('errors.usernameRequired');
    if (!email.trim()) tempErrors.email = t('errors.emailRequired');
    else if (!validateEmail(email))
      tempErrors.email = t('errors.emailInvalid');

    if (!password.trim())
      tempErrors.password = t('errors.passwordRequired');

    if (Object.keys(tempErrors).length > 0) {
      setErrors(tempErrors);
      return;
    }

    setErrors({});

    try {
      const response = await fetch(
        'http://43.204.167.118:3000/api/auth/signup',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email,
            username,
            password,
            country,
            countryFlag,
            dateOfBirth,
            gender: gender || undefined, // Send undefined if empty to omit key
          }),
        },
      );


      const data = await response.json();
      // 🛑 Check if OTP was already sent (Handle re-entry case)
      if (response.status === 400 && data.message && data.message.includes('OTP already sent')) {
        Toast.show({
          type: 'info',
          text1: t('auth.otpAlreadySent'),
          text2: t('auth.redirectingToVerification'),
        });

        navigation.navigate('EmailVerification', {
          userData: {
            username,
            email,
            password,
            country,
            countryFlag,
            dateOfBirth,
            gender,
          },
        });
      }
      console.log('Signup Response Data:', data);

      // 🛑 Check if OTP was already sent (Handle re-entry case)
      if (response.status === 400 && data.message && data.message.includes('OTP already sent')) {
        Toast.show({
          type: 'info',
          text1: t('auth.otpAlreadySent'),
          text2: t('auth.redirectingToVerification'),
        });

        navigation.navigate('EmailVerification', {
          userData: {
            username,
            email,
            password,
            country,
            countryFlag,
            dateOfBirth,
            gender,
          },
        });
        return;
      }

      // ❌ Backend validation errors
      if (!response.ok || data.success === false) {
        handleApiErrors(data);
        return;
      }

      // ✅ SUCCESS → OTP SENT
      Toast.show({
        type: 'success',
        text1: t('auth.otpSent'),
        text2: `${t('auth.otpSent')} ${email}`,
      });

      // console.log("GenderHHHHHHHHHHHHHHHHHHHHHHh", gender)
      navigation.navigate('EmailVerification', {
        userData: {
          username,
          email,
          password,
          country,
          countryFlag,
          dateOfBirth,
          gender,
        },
      });

    } catch (error) {
      Toast.show({
        type: 'error',
        text1: t('errors.networkError'),
        text2: t('notifications.tryAgainLater'),
      });
    }
  };

  const handleApiErrors = (data) => {
    let fieldErrors = {};

    // 🔹 Example backend responses handling
    if (data.message) {
      const msg = data.message.toLowerCase();

      if (msg.includes('username')) {
        fieldErrors.username = data.message;
      }

      if (msg.includes('email')) {
        fieldErrors.email = data.message;
      }

      if (msg.includes('password')) {
        fieldErrors.password = data.message;
      }
    }

    // 🔹 If backend sends error object
    if (data.errors) {
      Object.keys(data.errors).forEach(key => {
        fieldErrors[key] = data.errors[key];
      });
    }

    setErrors(fieldErrors);

    // 🔹 Fallback: If no specific field matched, show global error
    if (Object.keys(fieldErrors).length === 0 && data.message) {
      Toast.show({
        type: 'error',
        text1: t('auth.signupError'),
        text2: data.message,
      });
    }
  };


  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={normalizeFont(20)}>
      <LinearGradient colors={['#0f162b', '#0f162b']} style={styles.container}>
        <ScrollView
          contentContainerStyle={[styles.scrollContainer, { paddingTop: insets.top + 0 }]}
          keyboardShouldPersistTaps="handled">

          <View style={styles.formContainer}>
            <AuthHeader title={t('auth.signUpTitle')} />

            <InputField
              icon={require('../assets/gender.png')}
              placeholder={`${t('auth.username')} *`}
              value={username}
              onChangeText={setUserName}
              error={errors.username}
            />

            <InputField
              icon={require('../assets/face.png')}
              placeholder={`${t('auth.email')} *`}
              value={email}
              onChangeText={text => {
                setEmail(text);
                if (validateEmail(text) && errors.email) {
                  setErrors(prev => ({ ...prev, email: undefined }));
                }
              }}

              keyboardType="email-address"
              error={errors.email}
            />

            <View
              style={[
                styles.inputContainer,
                errors.password && styles.errorBorder,
              ]}>
              <MaterialIcons
                name="lock"
                size={normalizeFont(20)}
                color="#94A3B8"
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder={`${t('auth.enterPassword')} *`}
                placeholderTextColor="#94A3B8"
                value={password}
                onChangeText={text => {
                  setPassword(text);

                  if (text.length >= 6 && errors.password) {
                    setErrors(prev => ({ ...prev, password: undefined }));
                  }
                }}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <MaterialIcons
                  name={showPassword ? 'visibility' : 'visibility-off'}
                  size={normalizeFont(20)}
                  color="#94A3B8"
                />
              </TouchableOpacity>
            </View>
            {errors.password && (
              <Text style={styles.errorText}>{errors.password}</Text>
            )}

            <View
              style={[
                styles.dropdownContainer,
                errors.gender && styles.errorBorder,
              ]}>
              <TouchableOpacity
                style={styles.dropdownButton}
                onPress={() => setShowGenderOptions(!showGenderOptions)}>
                <View style={styles.dropdownTextContainer}>
                  <MaterialIcons
                    name="person"
                    size={normalizeFont(24)}
                    color="#94A3B8"
                    style={styles.genderIcon}
                  />
                  <Text
                    style={[
                      styles.input1,
                      { color: gender ? 'white' : '#94A3B8' },
                    ]}>
                    {gender ? (gender === 'other' ? t('gender.others') : t(`gender.${gender}`)) : t('gender.selectGender')}
                  </Text>
                </View>
                <MaterialIcons
                  name={
                    showGenderOptions
                      ? 'keyboard-arrow-up'
                      : 'keyboard-arrow-down'
                  }
                  size={normalizeFont(24)}
                  color="#94A3B8"
                  style={styles.dropdownIcon}
                />
              </TouchableOpacity>
              {showGenderOptions && (
                <View style={styles.dropdownOptions}>
                  {[
                    { label: t('gender.male'), value: 'male' },
                    { label: t('gender.female'), value: 'female' },
                    { label: t('gender.others'), value: 'other' }
                  ].map(option => (
                    <TouchableOpacity
                      key={option.value}
                      onPress={() => {
                        setGender(option.value);
                        setShowGenderOptions(false);
                      }}>
                      <Text style={styles.dropdownOptionText}>{option.label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            <View style={[styles.inputContainer, errors.dateOfBirth && styles.errorBorder]}>
              <MaterialIcons
                name="calendar-month"
                size={normalizeFont(20)}
                color="#94A3B8"
                style={styles.inputIcon}
              />
              <TouchableOpacity
                style={{ flex: 1, justifyContent: 'center', height: normalizeFont(40) }}
                onPress={() => setShowYearPicker(true)}
              >
                <Text style={{ color: dateOfBirth ? 'white' : '#94A3B8', fontSize: normalizeFont(16) }}>
                  {dateOfBirth || t('date.yearOfBirth')}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.tickContainer}>
              <TouchableOpacity
                onPress={() => setIsTicked(!isTicked)}
                activeOpacity={0.8}>
                <Text
                  style={[
                    styles.tickBox,
                    isTicked && styles.tickChecked,
                    tncError && !isTicked && styles.errorBorder,
                  ]}>
                  {isTicked ? '✔' : ''}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  navigation.navigate('TermsAndConditions');
                }}>
                <Text style={styles.tncText}>{t('auth.agreeToTerms')}</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.loginButton} onPress={handleSignUp}>
              <Text style={styles.loginButtonText}>{t('auth.signUpTitle')}</Text>
            </TouchableOpacity>

            <Toast />
            <View style={styles.dividerContainer}>
              <View style={styles.divider} />
              <Text style={styles.dividerText}>{t('auth.orContinueWith')}</Text>
              <View style={styles.divider} />
            </View>

            <View style={styles.socialContainer}>
              <TouchableOpacity
                style={styles.socialButton}
                onPress={() =>
                  Toast.show({ type: 'info', text1: 'Google login coming soon' })
                }>
                <Icon6 name="google" size={normalizeFont(20)} color="#fff" />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.socialButton}
                onPress={() =>
                  Toast.show({
                    type: 'info',
                    text1: 'Twitter login coming soon',
                  })
                }>
                <Icon6 name="x-twitter" size={normalizeFont(20)} color="#fff" />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.socialButton}
                onPress={() =>
                  Toast.show({
                    type: 'info',
                    text1: 'Facebook login coming soon',
                  })
                }>
                <Icon6 name="facebook" size={normalizeFont(20)} color="#fff" />
              </TouchableOpacity>
            </View>

            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.registerText}>
                {t('auth.alreadyHaveAccount')} <Text style={styles.registerLink}>{t('auth.signInTitle')}</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
        {/* YEAR PICKER MODAL */}
        <Modal
          visible={showYearPicker}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowYearPicker(false)}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <LinearGradient
                colors={['#1e293b', '#0f172a']}
                style={styles.modalContentGradient}
              >
                <View style={styles.titleContainer}>
                  <Text style={styles.modalTitle}>{t('date.selectYear')}</Text>
                  <TouchableOpacity
                    style={styles.headerCloseIcon}
                    onPress={() => setShowYearPicker(false)}
                  >
                    <Icon name="close" size={24} color="#94A3B8" />
                  </TouchableOpacity>
                </View>

                <FlatList
                  data={years}
                  keyExtractor={(item) => item}
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={{ paddingVertical: 10 }}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={[
                        styles.modalOption,
                        dateOfBirth === item && styles.modalOptionSelected
                      ]}
                      onPress={() => {
                        setDateOfBirth(item);
                        setShowYearPicker(false);
                      }}>
                      <Text
                        style={[
                          styles.modalOptionText,
                          dateOfBirth === item && styles.modalOptionTextSelected,
                        ]}>
                        {item}
                      </Text>
                      {dateOfBirth === item && (
                        <LinearGradient
                          colors={['#FB923C', '#F97316']}
                          style={styles.checkIconContainer}
                        >
                          <Icon name="checkmark" size={12} color="#fff" />
                        </LinearGradient>
                      )}
                    </TouchableOpacity>
                  )}
                />
              </LinearGradient>
            </View>
          </View>
        </Modal>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
}

// Input Field Component
const InputField = ({ icon, error, ...props }) => (
  <>
    <View style={[styles.inputContainer, error && styles.errorBorder]}>
      <Image style={styles.inputIcon} source={icon} />
      <TextInput
        style={styles.input}
        placeholderTextColor="#94A3B8"
        {...props}
      />
    </View>
    {error && <Text style={styles.errorText}>{error}</Text>}
  </>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  backButton: {
    position: 'absolute',
    top: normalizeFont(-20),
    left: normalizeFont(0),
  },
  tickContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: normalizeFont(20),
    marginBottom: normalizeFont(10),
    marginEnd: 'auto',
    start: 10,
  },
  tickBox: {
    borderWidth: 1,
    borderColor: '#8e8e8e',
    width: normalizeFont(35),
    height: normalizeFont(25),
    marginRight: 20,
    textAlign: 'center',
    color: '#fff',
    borderRadius: 4,
  },
  tickChecked: { backgroundColor: '#fff', color: 'black' },
  tncText: { color: 'red', fontSize: normalizeFont(12) },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingBottom: normalizeFont(50),
    paddingTop: normalizeFont(50),
  },
  formContainer: {
    width: width > 500 ? 500 : width * 0.9,
    alignSelf: 'center',
    padding: normalizeFont(20),
  },
  title: {
    fontSize: normalizeFont(32),
    fontWeight: '600',
    color: 'white',
    marginBottom: normalizeFont(70),
    textAlign: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 10,
    marginBottom: normalizeFont(10),
    paddingHorizontal: normalizeFont(15),
  },
  inputIcon: {
    marginRight: normalizeFont(10),
    height: normalizeFont(20),
    width: normalizeFont(20),
  },
  input: {
    flex: 1,
    height: normalizeFont(40),
    color: 'white',
    fontSize: normalizeFont(16),
  },
  loginButton: {
    backgroundColor: '#FB923C',
    borderRadius: 50,
    height: normalizeFont(45),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: normalizeFont(20),
    marginTop: normalizeFont(20),
  },
  loginButtonText: {
    color: 'white',
    fontSize: normalizeFont(16),
    fontWeight: 'bold',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: normalizeFont(10),
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: '#FFF',
  },
  dividerText: {
    color: '#94A3B8',
    paddingHorizontal: normalizeFont(10),
    fontSize: normalizeFont(14),
  },
  socialContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  socialButton: {
    width: normalizeFont(40),
    height: normalizeFont(40),
    borderRadius: normalizeFont(20),
    backgroundColor: '#17677F',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: width * 0.02,
  },
  registerText: {
    marginTop: normalizeFont(15),
    color: '#94A3B8',
    textAlign: 'center',
    fontSize: normalizeFont(14),
  },
  registerLink: {
    color: '#ff8c00',
    fontSize: normalizeFont(16),
  },
  dropdownContainer: {
    marginBottom: normalizeFont(10),
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 10,
  },
  dropdownButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: normalizeFont(12),
    paddingHorizontal: normalizeFont(15),
    alignItems: 'center',
  },
  dropdownTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  genderIcon: {
    marginRight: normalizeFont(10),
  },
  input1: {
    color: '#94A3B8',
    fontSize: normalizeFont(16),
  },
  dropdownIcon: {
    marginTop: normalizeFont(3),
  },
  dropdownOptions: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 10,
  },
  dropdownOptionText: {
    paddingVertical: normalizeFont(12),
    paddingHorizontal: normalizeFont(15),
    color: 'white',
    fontSize: normalizeFont(16),
  },
  errorBorder: {
    borderWidth: 1,
    borderColor: 'red',
  },
  errorText: {
    color: 'red',
    fontSize: normalizeFont(12),
    marginBottom: normalizeFont(10),
    marginLeft: normalizeFont(5),
    alignSelf: "flex-end"
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '85%',
    height: '60%',
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  modalContentGradient: {
    flex: 1,
    padding: 0,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center', // Center the title
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 0.5,
  },
  headerCloseIcon: {
    position: 'absolute',
    right: 20,
    padding: 5,
  },
  modalOption: {
    paddingVertical: 15,
    paddingHorizontal: 25,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 10,
    marginVertical: 4,
    borderRadius: 12,
  },
  modalOptionSelected: {
    backgroundColor: 'rgba(251, 146, 60, 0.15)', // Orange tint
    borderWidth: 1,
    borderColor: 'rgba(251, 146, 60, 0.3)',
  },
  modalOptionText: {
    fontSize: 16,
    color: '#94A3B8',
    fontWeight: '500',
  },
  modalOptionTextSelected: {
    color: '#FB923C', // Orange
    fontWeight: '700',
    fontSize: 18,
  },
  checkIconContainer: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

