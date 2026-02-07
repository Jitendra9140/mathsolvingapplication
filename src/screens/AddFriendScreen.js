import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
  StatusBar,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';

const { width, height } = Dimensions.get('window');

const AddFriendScreen = () => {
  const navigation = useNavigation();
  const { theme } = useTheme();

  return (
    <LinearGradient
      colors={theme.backgroundGradient || ['#0f162b', '#0f162b']}
      style={styles.container}>

      {/* Title */}
      <Text style={[styles.title, { color: theme.text }]}>Add Friends</Text>

      {/* Illustration */}
      <View style={styles.imageContainer}>
        <Image
          source={require('../assets/addFriend.png')}
          style={styles.image}
          resizeMode="contain"
        />
      </View>

      {/* Description */}
      <Text style={[styles.description, { color: theme.textSecondary || '#cbd5e1' }]}>
        Connect with your friends and challenge them in fun math battles!
      </Text>

      {/* Buttons */}
      <View style={styles.buttonRow}>
        <TouchableOpacity
          onPress={() => navigation.replace('WelcomeScreen')}
          style={styles.skipButton}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => navigation.replace('WelcomeScreen')}
          style={[styles.continueButton, { backgroundColor: theme.primary || '#FB923C' }]}>
          <Text style={styles.continueText}>Continue</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
};

export default AddFriendScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: height * 0.08,
  },
  title: {
    fontSize: width * 0.08,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: height * 0.02,
  },
  imageContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: width * 0.85,
    height: height * 0.45,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  description: {
    fontSize: width * 0.045,
    textAlign: 'center',
    marginHorizontal: width * 0.08,
    lineHeight: 22,
  },
  buttonRow: {
    flexDirection: 'row',
    width: '80%',
    justifyContent: 'space-between',
    marginBottom: height * 0.04,
  },
  skipButton: {
    flex: 1,
    marginRight: width * 0.05,
    backgroundColor: '#E2E8F0',
    paddingVertical: height * 0.018,
    borderRadius: width * 0.05,
    alignItems: 'center',
  },
  skipText: {
    color: '#1E293B',
    fontSize: width * 0.045,
    fontWeight: '600',
  },
  continueButton: {
    flex: 1,
    marginLeft: width * 0.05,
    paddingVertical: height * 0.018,
    borderRadius: width * 0.05,
    alignItems: 'center',
  },
  continueText: {
    color: '#fff',
    fontSize: width * 0.045,
    fontWeight: '700',
  },
});

