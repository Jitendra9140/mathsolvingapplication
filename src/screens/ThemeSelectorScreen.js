
// Screens/ThemeSelectorScreen.js
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Dimensions,
  PixelRatio,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useTheme, themes } from '../context/ThemeContext';
import KeyboardSelector from './KeyboardSelector';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import CustomHeader from '../components/CustomHeader';
import { useTranslation } from 'react-i18next';
const { width, height } = Dimensions.get('window');
const scale = width / 375;
const normalize = size =>
  Math.round(PixelRatio.roundToNearestPixel(size * scale));

const ThemeSelectorScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const from = route.params?.from || 'settings';
  const { theme, changeTheme } = useTheme();
  const [selectedTab, setSelectedTab] = useState('colors');
  const insets = useSafeAreaInsets(); // ✅ Hook
  const { t } = useTranslation();

  const handleNext = () => {
    navigation.replace('AddFriendScreen');
  };

  return (
    <LinearGradient colors={theme.backgroundGradient} style={{ flex: 1 }}>
      <View style={{ width: '100%', alignItems: 'center', flex: 1, paddingTop: insets.top + 30 }}>
        {/* Custom Header with full width separator */}
        <View style={{ width: '100%', marginBottom: 10 }}>
          <CustomHeader
            title={t('settings.theme').toUpperCase()}
            onBack={() => {
              if (from === 'onboarding') {
                // unexpected, usually no back here or handle differently
              } else {
                navigation.goBack();
              }
            }}
            showBack={from !== 'onboarding'}
          />
        </View>

        <View style={styles.container}>
          {/* Toggle Buttons */}
          <View style={styles.toggleContainer}>
            <TouchableOpacity
              style={[
                styles.toggleButton,
                selectedTab === 'colors' && styles.activeToggle,
              ]}
              onPress={() => setSelectedTab('colors')}>
              <Text
                style={[
                  styles.toggleText,
                  selectedTab === 'colors' && styles.activeToggleText,
                ]}>
                {t('settings.colors')}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.toggleButton,
                selectedTab === 'keyboard' && styles.activeToggle,
              ]}
              onPress={() => setSelectedTab('keyboard')}>
              <Text
                style={[
                  styles.toggleText,
                  selectedTab === 'keyboard' && styles.activeToggleText,
                ]}>
                {t('settings.numpad')}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Theme or Keyboard Section */}
          {selectedTab === 'colors' ? (
            <ScrollView
              contentContainerStyle={styles.scroll}
              showsVerticalScrollIndicator={true}>
              {Object.keys(themes).map(key => {
                const t = themes[key];
                const isSelected = theme.name === t.name;
                return (
                  <TouchableOpacity
                    key={key}
                    onPress={() => changeTheme(key)}
                    activeOpacity={0.8}
                    style={styles.pillContainer}>
                    <LinearGradient
                      colors={t.backgroundGradient}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.pillBox}>
                      <View style={styles.circleOuter}>
                        {isSelected && <View style={styles.circleInner} />}
                      </View>
                      <Text style={[styles.pillText, { color: t.text }]}>
                        {t.name}
                      </Text>
                    </LinearGradient>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          ) : (
            <KeyboardSelector />
          )}

          {from === 'onboarding' && (
            <TouchableOpacity
              style={[styles.nextButton, { backgroundColor: theme.primary }]}
              onPress={handleNext}>
              <Text style={[styles.nextText, { color: theme.buttonText || '#fff' }]}>
                {t('common.next')}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </LinearGradient>
  );
};

export default ThemeSelectorScreen;

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', paddingHorizontal: "auto" },
  title: { fontSize: normalize(18), fontWeight: '700', marginBottom: 15 },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: '#1C2433',
    borderRadius: 5,
    overflow: 'hidden',
    marginBottom: 20,
    width: '90%',
    justifyContent: 'center',
    top: "2%"
  },
  toggleButton: { paddingVertical: 10, paddingHorizontal: 60 },
  toggleText: { fontSize: normalize(16), color: '#fff' },
  activeToggle: {
    backgroundColor: '#595CFF',
    width: '60%',
    alignItems: 'center',
  },
  activeToggleText: { fontWeight: '700' },
  scroll: {
    alignItems: 'center',
    paddingBottom: 30,
    top: "3%"
  },
  pillContainer: {
    width: '90%',
    marginVertical: 10,
    alignItems: 'center',
    marginHorizontal: "25%",
  },

  pillBox: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    height: height * 0.08,
    borderRadius: 20,
    paddingHorizontal: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },

  circleOuter: {
    width: normalize(22),
    height: normalize(22),
    borderRadius: normalize(11),
    borderWidth: 2,
    borderColor: '#fff',
    marginRight: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },

  circleInner: {
    width: '80%',
    height: '80%',
    borderRadius: 999,
    backgroundColor: '#fff',
  },

  pillText: {
    fontSize: normalize(14),
    fontWeight: '600',
  },
  nextButton: {
    marginTop: 20,
    paddingVertical: 12,
    paddingHorizontal: 60,
    borderRadius: 25,
  },
  nextText: {
    fontSize: normalize(16),
    fontWeight: '700',
  },
});

