import { BackHandler, Image, StyleSheet, Text, View, ToastAndroid, Dimensions } from 'react-native';
import React, { useEffect } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Home from './Home';
import More from './More';
import Learn from './Learn';
import Puzzle from './Puzzle';
import PlayGame from './PlayGame';
import { useTranslation } from 'react-i18next';



const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const { width, height } = Dimensions.get('window');

const HomeStack = createNativeStackNavigator();

// 1️⃣ Create stack with Home + PlayGame
function HomeStackScreen() {
  return (
    <HomeStack.Navigator screenOptions={{ headerShown: false }}>
      <HomeStack.Screen name="HomeMain" component={Home} />
      <HomeStack.Screen name="PlayGame" component={PlayGame} />
    </HomeStack.Navigator>
  );
}

const BottomTab = () => {
  const { t } = useTranslation();
  let lastBackPressTime = 0;

  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      // Let React Navigation handle the back button (default behavior)
      return false;
    });

    return () => backHandler.remove();
  }, []);

  const renderIcon = (source, label, focused) => (
    <View style={styles.iconContainer}>
      <Image
        source={source}
        style={[
          styles.icon,
          { tintColor: focused ? '#fff' : '#999' }
        ]}
        resizeMode="contain"
      />
      <Text style={[styles.label, { color: focused ? '#fff' : '#999' }]}>{label}</Text>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: '#0B1220', }}>
      <Tab.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerShown: false,
          tabBarShowLabel: false,
          tabBarStyle: {
            backgroundColor: '#1E293B', borderTopLeftRadius: 20, height: 60, paddingTop: 9,
            borderTopRightRadius: 20,
            borderTopWidth: 0,
          },
        }}
      >
        {/* <Tab.Screen
          name="Home"
          component={Home}
          options={{
            tabBarIcon: ({ focused }) =>
              renderIcon(require('../assets/Home.png'), 'Home', focused),
          }}
        /> */}
        <Tab.Screen
          name="Home"
          component={HomeStackScreen}  // 👈 use stack here
          options={{
            tabBarIcon: ({ focused }) =>
              renderIcon(require('../assets/Home.png'), t('tabs.home'), focused),
          }}
        />
        <Tab.Screen
          name="Play"
          component={PlayGame}
          initialParams={{ gametype: 'PLAY' }}
          options={{
            tabBarIcon: ({ focused }) =>
              renderIcon(require('../assets/PuzzleIcon.png'), t('tabs.play'), focused),
          }}
        />
        <Tab.Screen
          name="Practise"
          component={PlayGame}
          initialParams={{ gametype: 'PRACTICE' }}
          options={{
            tabBarIcon: ({ focused }) =>
              renderIcon(require('../assets/Learn.png'), t('tabs.practise'), focused),
          }}
        />
        <Tab.Screen
          name="More"
          component={More}
          options={{
            tabBarIcon: ({ focused }) =>
              renderIcon(require('../assets/More.png'), t('tabs.more'), focused),
          }}
        />
      </Tab.Navigator>
    </View>
  );
};

export default BottomTab;

const styles = StyleSheet.create({
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: width * 0.18,
  },
  icon: {
    width: width * 0.06,   // smaller icon
    height: height * 0.035,
    marginBottom: 2,

  },
  label: {
    fontSize: 10,
    textAlign: 'center',
  },
});

