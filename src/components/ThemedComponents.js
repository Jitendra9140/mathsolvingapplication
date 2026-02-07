// Globalfile/ThemedComponents.js
import React from 'react';
import { View as RNView, Text as RNText, TouchableOpacity as RNTouchableOpacity } from 'react-native';
import { useTheme } from '../Globalfile/ThemeContext';

export const View = ({ style, ...props }) => {
  const { theme } = useTheme();
  return <RNView style={[{ backgroundColor: theme.background }, style]} {...props} />;
};

export const Text = ({ style, ...props }) => {
  const { theme } = useTheme();
  return <RNText style={[{ color: theme.text }, style]} {...props} />;
};

export const TouchableOpacity = ({ style, ...props }) => {
  const { theme } = useTheme();
  return <RNTouchableOpacity style={[{ backgroundColor: theme.primary }, style]} {...props} />;
};
