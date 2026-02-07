import React, { useRef, useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  PixelRatio,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';

const { width } = Dimensions.get('window');
const scale = width / 375;
const normalize = size => {
  const newSize = size * scale;
  return Math.round(PixelRatio.roundToNearestPixel(newSize));
};

const ForgetPassword = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { t } = useTranslation();

  const email = route.params?.email || '';

  const [step, setStep] = useState(1); // 1 = OTP, 2 = New Password
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [errorText, setErrorText] = useState('');

  const inputRefs = useRef([]);

  // Auto-verify OTP when full
  useEffect(() => {
    const code = otp.join('');
    if (code.length === 6) {
      handleVerifyOtp();
    }
  }, [otp]);


  /* ================= OTP VERIFY ================= */
  const handleVerifyOtp = async () => {
    const code = otp.join('');

    if (code.length < 6) {
      setErrorText(t('errors.completeOtp'));
      return;
    }

    setErrorText('');

    try {
      const response = await fetch(
        'http://43.204.167.118:3000/api/auth/verfy-forget-otp',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, otp: code }),
        },
      );

      const result = await response.json();

      if (!response.ok || result.success === false) {
        setErrorText(result.message || t('errors.invalidOtp'));
        return;
      }

      // ✅ OTP verified → show new password field
      setStep(2);
    } catch (err) {
      setErrorText(t('errors.networkError'));
    }
  };

  /* ================= RESEND OTP ================= */
  const handleResend = async () => {
    setErrorText('');

    try {
      const response = await fetch(
        'http://43.204.167.118:3000/api/auth/resend-forget-otp',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        },
      );

      const result = await response.json();

      if (!response.ok || result.success === false) {
        setErrorText(result.message || t('errors.resendFailed'));
        return;
      }

      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
      setErrorText(result.message || t('auth.otpSentAgain'));
    } catch (err) {
      setErrorText(t('errors.resendNetworkError'));
    }
  };

  /* ================= RESET PASSWORD ================= */
  const handleResetPassword = async () => {
    if (newPassword.length < 6) {
      setErrorText(t('errors.passwordTooShort'));
      return;
    }

    setErrorText('');

    try {
      const response = await fetch(
        'http://43.204.167.118:3000/api/auth/changePass',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email,
            newPassword,
          }),
        },
      );

      const result = await response.json();

      if (!response.ok || result.success === false) {
        setErrorText(result.message || t('errors.resetPasswordFailed'));
        return;
      }

      // ✅ Password changed
      navigation.replace('Login');
    } catch (err) {
      setErrorText('Network error. Please try again.');
    }
  };

  /* ================= OTP INPUT ================= */
  const handleOtpChange = (text, index) => {
    if (text.length > 1) return;

    const temp = [...otp];
    temp[index] = text;
    setOtp(temp);

    if (text && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleBackspace = (key, index) => {
    if (key === 'Backspace' && otp[index] === '' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}>
          <Icon name="caret-back-outline" size={normalize(29)} color="white" />
        </TouchableOpacity>
        <Text style={styles.title}>{t('auth.forgotPasswordTitle')}</Text>
      </View>

      <View style={styles.boxWrapper}>
        {/* ERROR TEXT */}
        {errorText ? <Text style={styles.errorText}>{errorText}</Text> : null}

        {/* STEP 1 : OTP */}
        {step === 1 && (
          <>
            <View style={styles.otpRow}>
              {otp.map((digit, index) => (
                <TextInput
                  key={index}
                  ref={ref => (inputRefs.current[index] = ref)}
                  style={styles.otpBox}
                  value={digit}
                  keyboardType="numeric"
                  maxLength={1}
                  onChangeText={text => handleOtpChange(text, index)}
                  onKeyPress={({ nativeEvent }) =>
                    handleBackspace(nativeEvent.key, index)
                  }
                />
              ))}
            </View>

            <TouchableOpacity onPress={handleResend}>
              <Text style={styles.resend}>{t('common.retry')}</Text>
            </TouchableOpacity>
          </>
        )}

        {/* STEP 2 : NEW PASSWORD */}
        {step === 2 && (
          <View style={styles.inputContainer}>
            <MaterialIcons
              name="lock"
              size={20}
              color="#94A3B8"
              style={styles.inputIcon}
            />
            <TextInput
              placeholder={t('auth.createNewPassword')}
              placeholderTextColor="#94A3B8"
              style={styles.input}
              secureTextEntry
              value={newPassword}
              onChangeText={setNewPassword}
            />
          </View>
        )}

        {step === 2 && (
          <TouchableOpacity
            style={styles.button}
            onPress={handleResetPassword}>
            <Text style={styles.buttonText}>
              {t('auth.resetPassword')}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </KeyboardAvoidingView>
  );
};

export default ForgetPassword;

/* ================= STYLES (UNCHANGED) ================= */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f162b',
    padding: 20,
    paddingTop: 30
  },
  header: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    gap: 10
  },
  backBtn: {
    padding: 8,
    marginRight: 50,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#fff',
  },
  boxWrapper: {
    marginTop: 80,
    padding: 10,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 10,
    paddingHorizontal: 15,
    height: 53,

  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    color: 'white',
    fontSize: 16,
  },
  button: {
    backgroundColor: '#FB923C',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 30,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  otpRow: {
    flexDirection: 'row',
    marginTop: 20,
  },
  otpBox: {
    width: normalize(40),
    height: normalize(50),
    borderRadius: normalize(5),
    backgroundColor: '#1e293b',
    textAlign: 'center',
    color: 'white',
    fontSize: normalize(18),
    marginHorizontal: normalize(5),
  },
  errorText: {
    color: 'red',
    marginTop: 20,
    marginBottom: 10,
    fontSize: 14,
    textAlign: 'center',
  },
  resend: {
    marginTop: 10,
    marginBottom: 20,
    alignSelf: 'flex-end',
    marginRight: 10,
    color: '#f9f4f4ff',
  },
});

