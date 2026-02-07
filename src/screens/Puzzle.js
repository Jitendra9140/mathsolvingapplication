import { Image, StyleSheet, Text, View } from 'react-native'
import React from 'react'

const Puzzle = () => {
  return (
    <View style={{ flex: 1 }}>
      <Image
        style={{ height: "100%", width: "auto", resizeMode: "cover" }}
        source={require('../assets/comingsoonpng.jpg')}
      />
    </View>
  )
}

export default Puzzle

const styles = StyleSheet.create({})
