import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  PixelRatio,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {useNavigation} from '@react-navigation/native';

const {width, height} = Dimensions.get('window');
const scaleFont = size => size * PixelRatio.getFontScale();

const CustomHeader = ({title, onBack, rightIcon, style, showBack = true}) => {
  const navigation = useNavigation();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigation.goBack();
    }
  };

  return (
    <View style={[styles.container, style]}>
      {/* Top Row: Back Button -- Title -- Right Icon */}
      <View style={styles.topRow}>
        {showBack ? (
          <TouchableOpacity onPress={handleBack} style={styles.iconButton}>
            <Icon name="caret-back-outline" size={scaleFont(26)} color="#fff" />
          </TouchableOpacity>
        ) : (
          <View style={styles.iconButton} />
        )}

        <Text style={styles.heading}>{title}</Text>

        <View style={styles.rightIconContainer}>
          {rightIcon ? rightIcon : <View style={styles.iconButton} />}
        </View>
      </View>

      {/* Separator */}
      <View style={styles.separator} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    // Replicating the spacing context from PlayGame
    // PlayGame had marginTop and padding considerations.
    // We will let the parent handle the top padding (Safe Area) mostly,
    // but we ensure this component occupies the correct vertical space.
    width: '100%',
    marginBottom: height * 0.02,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: width * 0.05, // Standardize padding
    marginBottom: height * 0.02,
  },
  iconButton: {
    width: width * 0.08, // Slightly larger touch area
    height: width * 0.08,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rightIconContainer: {
    width: width * 0.08,
    alignItems: 'center',
  },
  heading: {
    fontSize: scaleFont(23),
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
    fontFamily: 'jaro',
    flex: 1, // Ensure it takes available space
  },
  separator: {
    borderWidth: 0.5,
    borderColor: '#ffffff',
    opacity: 0.5,
    color: '#fff',
    marginHorizontal: width * 0.01, // Keep it almost full width but aligned
    marginBottom: height * 0.02,
  },
});

export default CustomHeader;
