import React, { useEffect, useRef } from 'react';
import { Text, StyleSheet, Animated } from 'react-native';

const InAppBanner = ({ title, body, onHide }) => {
  const slide = useRef(new Animated.Value(-100)).current;

  useEffect(() => {
    Animated.timing(slide, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();

    const timer = setTimeout(() => {
      Animated.timing(slide, {
        toValue: -100,
        duration: 300,
        useNativeDriver: true,
      }).start(onHide);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <Animated.View style={[styles.box, { transform: [{ translateY: slide }] }]}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.body}>{body}</Text>
    </Animated.View>
  );
};

export default InAppBanner;

const styles = StyleSheet.create({
  box: {
    position: 'absolute',
    top: 0,
    width: '100%',
    backgroundColor: '#222',
    padding: 15,
    zIndex: 9999,
  },
  title: { color: '#fff', fontWeight: 'bold' },
  body: { color: '#ccc', marginTop: 4 },
});
