// Globalfile/SaveUserData.js
import AsyncStorage from '@react-native-async-storage/async-storage';

export const SaveUserData = async (token, user) => {
  try {
    if (!token || !user) throw new Error('Token or user is missing');
    await AsyncStorage.setItem('authToken', token);
    await AsyncStorage.setItem('userData', JSON.stringify(user));
  } catch (error) {
    console.log('Error saving user data:', error);
  }
};
