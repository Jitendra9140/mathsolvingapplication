import { Dimensions, PixelRatio, Platform } from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

const { width, height } = Dimensions.get('window');

// Export library functions directly for ease of use
export { wp, hp };

// Base screen size (Standard mobile design reference, e.g., Figma frame)
const BASE_WIDTH = 375;
const BASE_HEIGHT = 812;

// Horizontal scale
export const scaleWidth = (size) => (width / BASE_WIDTH) * size;

// Vertical scale
export const scaleHeight = (size) => (height / BASE_HEIGHT) * size;

// Font normalize (auto scale font for all screens)
export const normalizeFont = (size) => {
  const newSize = size * (width / BASE_WIDTH);
  return Platform.OS === 'ios'
    ? Math.round(PixelRatio.roundToNearestPixel(newSize))
    : Math.round(PixelRatio.roundToNearestPixel(newSize)) - 1;
};

// Helper for consistent spacing
export const spacing = {
  s: wp('2%'),
  m: wp('4%'),
  l: wp('6%'),
  xl: wp('8%'),
};

// Helper for screen container
export const containerStyle = {
  flex: 1,
  paddingHorizontal: wp('5%'), // Consistent horizontal padding
};
