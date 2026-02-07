import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  PixelRatio,
  Image,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient'; 
import FastImage from 'react-native-fast-image';

const { width, height } = Dimensions.get('window');
const scale = (size) => (width / 375) * size;
const scaleFont = (size) => size * PixelRatio.getFontScale();

const operators = ['+', '-', '×', '÷'];

const GuessTheSignScreen = () => {
  const [selectedOperator, setSelectedOperator] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const equation = { left: 7, right: 7, result: 0 };
  const [isPaused, setIsPaused] = useState(false);
  const timer = '1:28';
  const navigation = useNavigation();

  const correctOperator = '-';

  return (
    <View style={styles.container}>
      {/* ✅ Success GIF Popup */}
      {showSuccess && (
        <View style={styles.successOverlay}>
          <FastImage
            source={require('../assets/tickbuttonunscreen.gif')}
            style={styles.successImage}
            resizeMode={FastImage.resizeMode.contain}
          />
        </View>
      )}

      {/* Top Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity 
          onPress={() => {
            navigation.navigate("MathInputScreen");
          }}
        style={styles.iconButton}>
          <Icon name="chevron-back" size={scaleFont(18)} color="#000" />
        </TouchableOpacity>

        <View style={[styles.timerContainer, isPaused && styles.timerPausedBox]}>
          <Image
            source={require('../assets/Stopwatch.png')}
            style={styles.timerIcon}
          />
          <Text style={[styles.timerText, isPaused && styles.timerPausedText]}>
            {timer}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.iconButton1}
          onPress={() => setIsPaused(!isPaused)}
        >
          <Icon
            name={isPaused ? 'play-skip-forward' : 'pause'}
            size={scaleFont(16)}
            color="#fff"
          />
        </TouchableOpacity>
      </View>

      {/* Question */}
      <Text style={styles.title}>GUESS THE SIGN</Text>

      <View style={styles.equationContainer}>
        <Text style={styles.equationText}>{equation.left}</Text>
        <View style={styles.signBox}>
          <Text style={styles.signText}>
            {selectedOperator ? selectedOperator : ''}
          </Text>
        </View>
        <Text style={styles.equationText}>{equation.right}=</Text>
        <Text style={styles.equationText}>{equation.result}</Text>
      </View>

      {/* Options */}
      <View style={styles.optionsContainer}>
        {operators.map((op, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => {
              setSelectedOperator(op);
              if (op === correctOperator) {
                setShowSuccess(true);
                setTimeout(() => {
                  setShowSuccess(false);
                  navigation.navigate('MathInputScreenSecond');
                }, 2000);
              }
            }}
            style={styles.optionTouchable}
          >
            <LinearGradient
              colors={['#595CFF', '#87AEE9']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.optionGradient}
            >
              <Text style={styles.optionText}>{op}</Text>
            </LinearGradient>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

export default GuessTheSignScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B1220',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    paddingHorizontal: width * 0.04,
    paddingVertical: height * 0.02,
    borderBottomEndRadius: 15,
    borderBottomStartRadius: 15,
  },
  iconButton: {
    width: width * 0.06,
    height: width * 0.06,
    backgroundColor: '#fff',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconButton1: {
    width: width * 0.07,
    height: width * 0.07,
    backgroundColor: '#000',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  timerText: {
    color: '#fff',
    fontSize: scaleFont(13),
    fontWeight: '600',
    opacity: 0.7,
  },
  timerIcon: {
    width: 14,
    height: 14,
    tintColor: '#fff',
  },
  timerPausedBox: {
    backgroundColor: '#F7931E',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  timerPausedText: {
    color: '#fff',
  },
  title: {
    textAlign: 'center',
    marginVertical: height * 0.04,
    fontSize: scaleFont(20),
    color: '#fff',
    fontWeight: 'bold',
  },
  equationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    marginBottom: height * 0.09,
  },
  equationText: {
    fontSize: scaleFont(20),
    color: '#fff',
  },
  signBox: {
    width: scale(40),
    height: scale(40),
    borderRadius: 10,
    backgroundColor: '#1C2433',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signText: {
    color: '#fff',
    fontSize: scaleFont(18),
    fontWeight: 'bold',
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    paddingHorizontal: width * 0.05,
    marginTop: width * 0.6,
  },
  optionTouchable: {
    width: '40%',
    aspectRatio: 1.3,
    height: height * 0.1,
    borderRadius: 15,
    marginBottom: height * 0.02,
  },
  optionGradient: {
    flex: 1,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionText: {
    fontSize: scaleFont(20),
    color: '#fff',
    fontWeight: 'bold',
  },

  // ✅ Success GIF styles
  successOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: width,
    height: height,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    backgroundColor: 'rgba(22, 21, 21, 0.94)',
  },
  successImage: {
    width: width * 0.4,
    height: width * 0.4,
  },
});

