import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);

  // Load auth state on mount
  useEffect(() => {
    const loadAuthData = async () => {
      try {
        const storedToken = await AsyncStorage.getItem('authToken');
        const storedUser = await AsyncStorage.getItem('userData');
        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
        }
      } catch (e) {
        console.log('Failed to load auth data', e);
      }
    };
    loadAuthData();
  }, []);

  const login = async (newToken, newUser, fullResponse) => {
    try {
      setToken(newToken);
      setUser(newUser);
      await AsyncStorage.setItem('authToken', newToken);
      await AsyncStorage.setItem('userData', JSON.stringify(newUser));
      if (fullResponse) {
        await AsyncStorage.setItem('fullLoginResponse', JSON.stringify(fullResponse));
      }
    } catch (e) {
      console.log('Login error', e);
    }
  };

  const logout = async () => {
    try {
      setToken(null);
      setUser(null);
      await AsyncStorage.clear(); // Or remove specific keys
    } catch (e) {
      console.log('Logout error', e);
    }
  };

  return (
    <AuthContext.Provider value={{ user, setUser, token, setToken, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
