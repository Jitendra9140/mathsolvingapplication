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
import LinearGradient from 'react-native-linear-gradient';
// import Icon from 'react-native-vector-icons/Ionicons'; // Optional icon usage
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const { width } = Dimensions.get('window');

const LastScreen = () => {
  const navigation = useNavigation();
  return (
    <ImageBackground
      source={require('../assets/backGroundImage.png')} // Update with your actual image path
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.container}>
        <Text style={styles.title}>Math Matrix</Text>
        <Text style={styles.subtitle}>
          Train Your Mindset. Improve your brain skills
        </Text>

        {/* Buttons */}
        <TouchableOpacity 
        onPress={() => {
          navigation.navigate('Dashboard');
        }}
        style={styles.buttonWrapper}>
          <LinearGradient
            colors={['#595CFF', '#87AEE9']}   
            style={styles.button}
          >
          <Icon name="calculator-variant" size={25} color="#fff" />
            <Text style={styles.buttonText}>Math Puzzle</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity style={styles.buttonWrapper}>
          <LinearGradient
            colors={['#B84FCE', '#D4ACFB']}
            
            style={styles.button}
          ><Icon name="clock-time-eleven-outline" size={25} color="#fff" />
            <Text style={styles.buttonText}>Memory Puzzle</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity style={styles.buttonWrapper}>
          <LinearGradient
            colors={['#F40752', '#F9AB8F']}
           
            style={styles.button}
          >
          <Icon name="brain" size={25} color="#fff" />
            <Text style={styles.buttonText}>Train Your Brain</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
    backgroundColor: '#0F172A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    flex: 1,
    paddingTop: 100,
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 28,
    color: '#fff',
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#cbd5e1',
    textAlign: 'center',
    marginBottom: 40,
  },
  buttonWrapper: {
    width: '100%',
    marginBottom: 16,
    // borderRadius: 12,
    overflow: 'hidden',
    flexDirection:"row"
  },
  button: {
    // paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    // paddingHorizontal:"15%",
    height:90,
    width:350,
    flexDirection:"row"
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    padding:10
  },
});

export default LastScreen;

