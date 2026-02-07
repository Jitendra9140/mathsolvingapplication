// ChangeDifficultyScreen.js
import { useNavigation } from '@react-navigation/native';
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import { useTranslation } from 'react-i18next';

const { width } = Dimensions.get('window');

export default function ChangeDifficultyScreen({ route }) {
  const navigation = useNavigation();
  const { gametype } = route.params || {};
  const { t } = useTranslation();

  const handleSelect = (difficulty) => {
    navigation.navigate('PlayGame', { selectedDifficulty: difficulty, gametype });
  };

  return (
    <ImageBackground
      source={require('../assets/backGroundImage.png')}
      style={styles.background}
    >
     
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <MaterialIcons name="arrow-back-ios" size={24} color="#fff" />
      </TouchableOpacity>

      <View style={styles.modalWrapper}>
        <View style={styles.modalContent}>
          <Text style={styles.title}>{t('difficulty.changeDifficulty')}</Text>

          {['easy', 'medium', 'hard'].map((level) => (
            <TouchableOpacity
              key={level}
              onPress={() => handleSelect(level)}
              style={styles.buttonWrapper}
            >
              <LinearGradient
                colors={['#EFA347', '#FF0F7B']}
                style={styles.difficultyBtn}
              >
                <Text style={styles.difficultyText}>
                  {level.toUpperCase()}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
    backgroundColor: '#0F172A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButton: {
    position: 'absolute',
    top: 16,
    left: 16,
    zIndex: 100,
    padding: 8,          // give it a nice touch target
  },
  modalWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',      // so absolute back button still sits on top
  },
  modalContent: {
    width: width * 0.8,
    backgroundColor: 'rgba(17, 16, 16, 0.5)',
    borderRadius: 12,
    padding: 20,
  },
  title: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 20,
    textAlign: 'center',
  },
  buttonWrapper: {
    marginBottom: 12,
  },
  difficultyBtn: {
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  difficultyText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
});
