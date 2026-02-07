import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, ImageBackground } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

const { width, height } = Dimensions.get('window');

const GuessTheSign = () => {
    const navigation = useNavigation();
  return (
    <ImageBackground
      source={require('../assets/backGroundImage.png')} // use your background image here
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.container}>
        <Text style={styles.title}>Guess The Sign</Text>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Guess the sign that{"\n"}finishes given equation</Text>
          <Text style={styles.equation}>7 ☐ 7 = 0</Text>
        </View>

        <Text style={styles.instruction}>
          You need to find correct sign that finishes the given equation
        </Text>

        <Text style={styles.scoring}>
          1.0 for correct answer{"\n"}-1.0 for incorrect answer
        </Text>

        <TouchableOpacity style={styles.button}
        onPress={() =>{
            navigation.navigate("ChangeDifficultyScreen")
        }}>
          <LinearGradient
            colors={['#F89B29', '#FF0F7B']}
            // start={{ x: 0, y: 0 }}
            // end={{ x: 1, y: 0 }}
            style={styles.gradient}
          >
            <Text style={styles.buttonText}>GOT IT!!</Text>
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
    width: '90%',
    alignItems: 'center',
    paddingVertical: 20,
  },
  title: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '500',
    marginBottom: 10,
  },
  card: {
    backgroundColor: '#0F172A',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingVertical: 25,
    width: '100%',
    alignItems: 'center',
    marginBottom: 20,
    elevation: 4,
    shadowColor: '#000',
  },
  cardTitle: {
    color: '#fff',
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 10,
  },
  equation: {
    fontSize: 22,
    color: '#fff',
    fontWeight: '700',
  },
  instruction: {
    fontSize: 10,
    color: '#fff',
    textAlign: 'center',
    marginBottom: 10,
    width: '100%',
  },
  scoring: {
    fontSize: 10,
    color: '#fff',
    textAlign: 'center',
    marginBottom: 20,
  },
  button: {
    width: '70%',
    height: 42,
    borderRadius: 15,
    overflow: 'hidden',
  },
  gradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '900',
    fontSize: 14,
  },
});

export default GuessTheSign;

