import { useNavigation } from '@react-navigation/native';
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';

const { width } = Dimensions.get('window');

const mathGames = [
  { title: 'Calculator' },
  { title: 'Guess the sign' },
  { title: 'Correct answer' },
  { title: 'Quick calculation' },
];

const MathPuzzleScreen = () => {
  const navigation = useNavigation();
  return (
    <View style={styles.container}>
      {/* Back Button */}
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
        <Icon name="arrow-back" size={20} color="#000" />
      </TouchableOpacity>

      {/* Header */}
      <Text style={styles.headerTitle}>Math Puzzle</Text>
      <Text style={styles.headerSubtitle}>
        Each Game with unique calculation with different approach.
      </Text>

      {/* List */}
      <ScrollView contentContainerStyle={styles.list}>
        {mathGames.map((game, index) => (
          <TouchableOpacity
            onPress={() => {
              navigation.navigate('Leaderboard');
            }}
            key={index} style={styles.cardWrapper}>
            <LinearGradient
              colors={['#87AEE9', '#595CFF']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.card}
            >
              <View>
                <View style={{ flexDirection: "row" }}>
                  <Icon name="hourglass-outline" size={20} color="#fff" />
                  <Text style={styles.cardTitle}>{game.title}</Text>
                </View>
                <View style={{ borderBottomWidth: 1, borderColor: "#fff", width: 300, marginBottom: 10 }}></View>
                <Text style={styles.cardScore}>Score: 🏆 0</Text>
              </View>
              <View style={styles.arrowContainer}>
                <View style={styles.circle}>
                  <Icon name="play-skip-forward" size={15} color="#000" />
                </View>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
    paddingTop: 20,
    paddingHorizontal: 20,
  },
  backBtn: {
    marginBottom: 20,
    width: 30,
    height: 30,
    borderRadius: 20,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 22,
    color: '#fff',
    fontWeight: 'bold',
    marginBottom: 6,
    padding: 10,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#94a3b8',
    marginBottom: 30,
  },
  list: {
    paddingBottom: 30,
  },
  cardWrapper: {
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  card: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderRadius: 12,
    height: 100
  },
  cardTitle: {
    fontSize: 16,
    color: '#fff',
    fontWeight: 'bold',
    marginBottom: 14,
  },
  cardScore: {
    fontSize: 13,
    color: '#e0f2fe',
  },
  arrowContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    top: "35%",
    // padding:10
  },
  circle: {
    width: 25,
    height: 25,
    backgroundColor: '#fff',
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default MathPuzzleScreen;

