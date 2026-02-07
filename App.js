import { StyleSheet } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import React, { useEffect, useRef } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppState } from 'react-native';
import SignUp from './src/screens/SignUp';
import SkipScreen from './src/screens/SkipScreen';
import BottomTab from './src/screens/BottomTab';
import PlayGame from './src/screens/PlayGame';
import Home from './src/screens/Home';
import MathInputScreen from './src/screens/MathInputScreen';
import GuessTheSignScreen from './src/screens/GuessTheSignScreen';
import MathInputScreenSecond from './src/screens/MathInputScreenSecond';
import MathInputScreenThrid from './src/screens/MathInputScreenThrid';
import WellDoneScreen from './src/screens/WellDoneScreen';
import QuitScreen from './src/screens/QuitScreen';
import RestartScreen from './src/screens/RestartScreen';
import FireworksAnimation from './src/screens/FireworksAnimation';
import Leaderboard from './src/screens/Leaderboard';
import EndlessLeaderboard from './src/screens/EndlessLeaderboard';
import Store from './src/screens/Store';
import Dashboard from './src/screens/Dashboard';
import EmailVerification from './src/screens/EmailVerification';
import OnBoarding from './src/screens/OnBoarding';
import Splash from './src/screens/Splash';
import GuessTheSign from './src/screens/GuessTheSign';
import ChangeDifficultyScreen from './src/screens/ChangeDifficultyScreen';
import LastScreen from './src/screens/LastScreen';
import MathPuzzleScreen from './src/screens/MathPuzzleScreen';
import DataScreen from './src/screens/DataScreen';
import StateData from './src/screens/StateData';
import Lobby from './src/screens/Lobby';
import MultiPlayerGame from './src/screens/MultiPlayerGame';
import { Socket } from './src/context/Socket';
import CommingSoon from './src/screens/CommingSoon';
import ForgetPassword from './src/screens/ForgetPassword';
import Login from './src/screens/Login';
import More from './src/screens/More';
import AddUserScreen from './src/screens/AddUserScreen';
import { AuthProvider } from './src/context/AuthProvider';
import FriendRequestScreen from './src/screens/FriendRequestScreen';
import Toast from 'react-native-toast-message';
import Notification from './src/screens/Notification';
import { navigationRef } from './src/navigation/navigationRef';
import ProfileScreen from './src/screens/ProfileScreen';
import { ThemeProvider } from './src/context/ThemeContext';
import ThemeSelectorScreen from './src/screens/ThemeSelectorScreen';
import { KeyboardProvider } from './src/context/KeyboardContext';
import LanguageSelectionScreen from './src/screens/LanguageSelectionScreen';
import { I18nextProvider } from 'react-i18next';
import i18n from './src/utils/localization/i18n';
import LanguageConfirmationScreen from './src/screens/LanguageConfirmationScreen';
import AuthLandingScreen from './src/screens/AuthLandingScreen';
import NotificationPermissionScreen from './src/screens/NotificationPermissionScreen';
import ChooseThemeIntroScreen from './src/screens/ChooseThemeIntroScreen';
import AddFriendScreen from './src/screens/AddFriendScreen';
import WelcomeScreen from './src/screens/WelcomeScreen';
import TermsAndConditions from './src/screens/TermsAndConditions';
import MultiplayerResultScreen from './src/screens/MultiplayerResultScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import SoundScreen from './src/screens/SoundScreen';
import GameNotifications from './src/screens/GameNotifications';
import { SoundProvider } from './src/context/SoundContext';
import i18next from 'i18next';
import UpdateProfile from './src/screens/UpdateProfile';
import UserProfile from './src/screens/UserProfile';
import SelectOpponent from './src/screens/SelectOpponent';
import GameChallengeScreen from './src/screens/ChallengeScreen';
import ChallengeFriends from './src/screens/ChallengeScreen';
import WaitingForOpponent from './src/screens/WaitingForOpponent';

const Stack = createNativeStackNavigator();

// 🔹 Function to refresh user data and update AsyncStorage
const updateUserData = async () => {
  try {
    const token = await AsyncStorage.getItem('authToken');
    if (!token) return;

    const response = await fetch(
      'http://43.204.167.118:3000/api/auth/getUser',
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      },
    );

    const data = await response.json();

    if (data.success && data.user) {
      await AsyncStorage.setItem('userData', JSON.stringify(data.user));
      console.log('✅ AsyncStorage updated with latest user data');
    } else {
      console.log('❌ Failed to refresh user data');
    }
  } catch (error) {
    console.log('⚠️ Error updating user data:', error);
  }
};

const App = () => {
  const appState = useRef('active');

  //  Auto-update user data when app loads or comes back to foreground
  useEffect(() => {
    updateUserData(); // Initial call on app load

    const subscription = AppState.addEventListener('change', nextState => {
      if (
        appState.current.match(/inactive|background/) &&
        nextState === 'active'
      ) {
        updateUserData(); // Update again when app returns to foreground
      }
      appState.current = nextState;
    });

    return () => subscription.remove();
  }, []);

  return (
    <SafeAreaProvider>
      <SafeAreaView style={{ flex: 1 }}>
        <I18nextProvider i18n={i18next}>
          <ThemeProvider>
            <KeyboardProvider>
              <AuthProvider>
                <Socket>
                  <Notification />
                  <SoundProvider>
                    <NavigationContainer ref={navigationRef}>
                      <Stack.Navigator screenOptions={{ headerShown: false }}>
                        <Stack.Screen name="Splash" component={Splash} />
                        <Stack.Screen
                          name="OnBoarding"
                          component={OnBoarding}
                        />
                        <Stack.Screen
                          name="AuthLandingScreen"
                          component={AuthLandingScreen}
                        />
                        <Stack.Screen name="Login" component={Login} />
                        <Stack.Screen name="SignUp" component={SignUp} />
                        <Stack.Screen
                          name="TermsAndConditions"
                          component={TermsAndConditions}
                        />
                        <Stack.Screen
                          name="SkipScreen"
                          component={SkipScreen}
                        />
                        <Stack.Screen
                          name="ChooseThemeIntroScreen"
                          component={ChooseThemeIntroScreen}
                        />
                        <Stack.Screen name="BottomTab" component={BottomTab} />
                        <Stack.Screen
                          name="WelcomeScreen"
                          component={WelcomeScreen}
                        />
                        <Stack.Screen name="PlayGame" component={PlayGame} />
                        <Stack.Screen name="Home" component={Home} />
                        <Stack.Screen
                          name="NotificationPermissionScreen"
                          component={NotificationPermissionScreen}
                        />
                        <Stack.Screen
                          name="AddFriendScreen"
                          component={AddFriendScreen}
                        />
                        <Stack.Screen
                          name="ProfileScreen"
                          component={ProfileScreen}
                        />
                        <Stack.Screen
                          name="ThemeSelectorScreen"
                          component={ThemeSelectorScreen}
                        />
                        <Stack.Screen
                          name="MathInputScreen"
                          component={MathInputScreen}
                        />
                        <Stack.Screen
                          name="GuessTheSignScreen"
                          component={GuessTheSignScreen}
                        />
                        <Stack.Screen
                          name="MathInputScreenSecond"
                          component={MathInputScreenSecond}
                        />
                        <Stack.Screen
                          name="MathInputScreenThrid"
                          component={MathInputScreenThrid}
                        />
                        <Stack.Screen
                          name="WellDoneScreen"
                          component={WellDoneScreen}
                        />
                        <Stack.Screen
                          name="QuitScreen"
                          component={QuitScreen}
                        />
                        <Stack.Screen
                          name="RestartScreen"
                          component={RestartScreen}
                        />
                        <Stack.Screen
                          name="FireworksAnimation"
                          component={FireworksAnimation}
                        />
                        <Stack.Screen
                          name="Leaderboard"
                          component={Leaderboard}
                        />
                        <Stack.Screen
                          name="EndlessLeaderboard"
                          component={EndlessLeaderboard}
                        />
                        <Stack.Screen name="Store" component={Store} />
                        <Stack.Screen name="Dashboard" component={Dashboard} />
                        <Stack.Screen
                          name="EmailVerification"
                          component={EmailVerification}
                        />
                        <Stack.Screen
                          name="GuessTheSign"
                          component={GuessTheSign}
                        />
                        <Stack.Screen
                          name="AddUserScreen"
                          component={AddUserScreen}
                        />
                        <Stack.Screen
                          name="ChangeDifficultyScreen"
                          component={ChangeDifficultyScreen}
                        />
                        <Stack.Screen
                          name="LastScreen"
                          component={LastScreen}
                        />
                        <Stack.Screen
                          name="MathPuzzleScreen"
                          component={MathPuzzleScreen}
                        />
                        <Stack.Screen
                          name="DataScreen"
                          component={DataScreen}
                        />
                        <Stack.Screen name="StateData" component={StateData} />
                        <Stack.Screen
                          name="SelectOpponent"
                          component={SelectOpponent}
                        />
                        <Stack.Screen
                          name="ChallengeFriends"
                          component={ChallengeFriends}
                        />
                        <Stack.Screen
                          name="WaitingForOpponent"
                          component={WaitingForOpponent}
                        />
                        <Stack.Screen name="Lobby" component={Lobby} />
                        <Stack.Screen
                          name="MultiPlayerGame"
                          component={MultiPlayerGame}
                        />
                        <Stack.Screen
                          name="CommingSoon"
                          component={CommingSoon}
                        />
                        <Stack.Screen
                          name="ForgetPassword"
                          component={ForgetPassword}
                        />
                        <Stack.Screen name="More" component={More} />
                        <Stack.Screen
                          name="FriendRequestScreen"
                          component={FriendRequestScreen}
                        />
                        <Stack.Screen
                          name="LanguageSelectionScreen"
                          component={LanguageSelectionScreen}
                        />
                        <Stack.Screen
                          name="LanguageConfirmationScreen"
                          component={LanguageConfirmationScreen}
                        />
                        <Stack.Screen
                          name="MultiplayerResultScreen"
                          component={MultiplayerResultScreen}
                        />
                        <Stack.Screen
                          name="SettingsScreen"
                          component={SettingsScreen}
                        />
                        <Stack.Screen
                          name="SoundScreen"
                          component={SoundScreen}
                        />
                        <Stack.Screen
                          name="GameNotifications"
                          component={GameNotifications}
                        />
                        <Stack.Screen
                          name="UpdateProfile"
                          component={UpdateProfile}
                        />
                        <Stack.Screen
                          name="UserProfile"
                          component={UserProfile}
                        />
                      </Stack.Navigator>
                    </NavigationContainer>
                  </SoundProvider>
                  <Toast />
                </Socket>
              </AuthProvider>
            </KeyboardProvider>
          </ThemeProvider>
        </I18nextProvider>
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({});

export default App;