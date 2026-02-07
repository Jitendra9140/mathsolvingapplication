import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import Swiper from 'react-native-swiper';
import LinearGradient from 'react-native-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext'; // ✅ Import theme
import { useTranslation } from 'react-i18next';

const { width, height} = Dimensions.get('window');
const RF = (size) => (size * width) / 375;

const dotColors = ['#FB923C', '#12CFF3', '#F87171'];


const OnBoarding = ({ navigation }) => {
  const swiperRef = useRef(null);
  const [index, setIndex] = useState(0);
  const insets = useSafeAreaInsets();
  const { theme } = useTheme(); // ✅ Get theme
  const { t } = useTranslation();

  const slides = [
    {
      id: 1,
      image: require('../assets/1.png'),
      description: t('onboarding.slide1Description'),
      buttonText: t('onboarding.next'),
    },
    {
      id: 2,
      image: require('../assets/2.png'),
      description: t('onboarding.slide2Description'),
      buttonText: t('onboarding.next'),
    },
    {
      id: 3,
      image: require('../assets/3.png'),
      description: t('onboarding.slide3Description'),
      buttonText: t('onboarding.letsPlay'),
    },
  ];

  const handleButtonPress = () => {
    if (index < slides.length - 1) {
      swiperRef.current.scrollBy(1);
    } else {
      navigation.navigate('AuthLandingScreen');
    }
  };

  const getImageStyle = (id) => {
    switch (id) {
      case 1:
        return styles.imageStyleOne;
      case 2:
        return styles.imageStyleTwo;
      case 3:
        return styles.imageStyleThree;
      default:
        return {};
    }
  };

  return (
    <LinearGradient
      colors={theme.backgroundGradient || ['#0f162b', '#0f162b']}
      style={[styles.container, { paddingTop: insets.top }]}
    >
      {/* Swiper Section */}
      <Swiper
        ref={swiperRef}
        loop={false}
        showsPagination={false}
        onIndexChanged={(i) => setIndex(i)}
      >
        {slides.map((slide) => (
          <View key={slide.id} style={styles.slide}>
            <Image
              source={slide.image}
              style={[styles.image, getImageStyle(slide.id)]}
              resizeMode="contain"
            />
            <Text style={[styles.title, { color: theme.textPrimary || '#fff' }]}>
              {slide.title}
            </Text>
            <Text style={[styles.description, { color: theme.textSecondary || '#94A3B8' }]}>
              {slide.description}
            </Text>
          </View>
        ))}
      </Swiper>

      {/* Pagination Dots */}
      <View style={styles.paginationContainer}>
        {slides.map((_, i) => (
          <View
            key={i}
            style={[
              styles.dotStyle,
              {
                backgroundColor: dotColors[i],
                opacity: index === i ? 1 : 0.4,
                width: index === i ? RF(20) : RF(5),
              },
            ]}
          />
        ))}
      </View>

      {/* Continue / Next Button */}
      <TouchableOpacity
        style={[
          styles.button,
          { backgroundColor: theme.primary || '#FB923C' },
        ]}
        onPress={handleButtonPress}
      >
        <Text style={styles.buttonText}>{slides[index].buttonText}</Text>
      </TouchableOpacity>
    </LinearGradient>
  );
};

export default OnBoarding;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  slide: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: RF(20),
  },
  image: {
    width: width * 0.5,
    height: height * 0.25,
    marginTop: RF(25),
  },
  imageStyleOne: {
    borderRadius: 10,
  },
  imageStyleThree: {
    width: width * 0.7,
    height: height * 0.3,
  },
  title: {
    fontSize: RF(24),
    fontWeight: '700',
    marginTop: RF(20),
    textAlign: 'center',
  },
  description: {
    fontSize: RF(15),
    textAlign: 'center',
    paddingHorizontal: RF(35),
    lineHeight: RF(22),
    marginTop: RF(10),
  },
  paginationContainer: {
    position: 'absolute',
    bottom: RF(130),
    flexDirection: 'row',
    alignSelf: 'center',
    alignItems: 'center',
  },
  dotStyle: {
    height: RF(5),
    borderRadius: RF(5),
    marginHorizontal: RF(3),
  },
  button: {
    position: 'absolute',
    width: width * 0.75,
    height: RF(45),
    left: width * 0.125,
    bottom: height * 0.08,
    borderRadius: RF(50),
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
    shadowColor: '#FB923C',
    shadowOpacity: 0.5,
    shadowRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: RF(18),
    fontWeight: 'bold',
  },
});

