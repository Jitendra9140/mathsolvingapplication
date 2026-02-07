import React from 'react';
import { View, Text, TouchableOpacity, Image, ScrollView, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
const { width, height } = Dimensions.get('window');

const scale = size => (width / 375) * size;
const verticalScale = size => (height / 812) * size;

const Store = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  return (
    <View style={{ flex: 1, backgroundColor: '#0F172A', paddingTop: insets.top }}>
      <ScrollView contentContainerStyle={{ padding: scale(16) }}>
        {/* Header */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: scale(20) }}>
          <TouchableOpacity   onPress={()=>{
            navigation.navigate("Profile")
          }}>
          <Ionicons name="arrow-back" size={scale(27)} color="#808080" />
            {/* <Text style={{ color: 'white', fontSize: scale(20) }}>{'<'} </Text> */}
          </TouchableOpacity>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View style={{ width: scale(53), height: scale(20), backgroundColor: '#ccc', borderRadius: scale(10), marginRight: scale(-57),}} />
            <Image source={require('../assets/coins.png')} style={{ width: scale(24), height: scale(30),marginRight: scale(37)}} />
          </View>
        </View>
        {/* Remove Ads with Gradient */}
        <LinearGradient
          colors={["#FF930F", "#FFF95B"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{ borderRadius: scale(10), padding: scale(16), alignItems: 'center', marginBottom: scale(20) }} >
        <View  style={{flexDirection:"row",}}>
          <Text style={{ fontWeight: 'bold', color: '#000', fontSize: scale(14),marginEnd: scale(25),marginTop: scale(-10) }}>Remove Banner and pop-up Ads</Text>
          <Text style={{ fontWeight: '800', color: '#000', fontSize: scale(23),marginStart: scale(20),marginTop: scale(8),fontFamily:"Open Sans",transform: [{ rotate: '-29.25 deg' }], }}>ADS</Text>
          </View>
          <View style={{ backgroundColor: '#fff', paddingHorizontal: scale(15), paddingVertical: scale(4), borderRadius: scale(14),marginTop: scale(-20),marginEnd: scale(230) }}>
            <Text style={{ fontWeight: 'bold', color: '#000', fontSize: scale(14) }}>₹750.00</Text>
          </View>        
        </LinearGradient>

        {/* Free Coins */}
        {[1, 2].map(i => (
          <View key={i} style={{ backgroundColor: '#D9D9D9', borderRadius: scale(10), padding: scale(16), flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: scale(10) }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Image source={require('../assets/coins.png')} style={{ width: scale(24), height: scale(24), marginRight: scale(8) }} />
              <Text style={{ fontSize: scale(16), fontWeight: '600' }}>+10</Text>
            </View>
            <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: scale(14), backgroundColor: '#FB923C', paddingHorizontal: scale(20), paddingVertical: scale(4), borderRadius: scale(20) }}>Free</Text>
          </View>
        ))}

        {/* Coins Section */}
        <Text style={{ color: 'white', fontSize: scale(18), fontWeight: 'bold', marginBottom: scale(20),alignSelf:"center" }}>Coins</Text>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: scale(20) }}>
          {[1000, 4000, 8000].map((amount, index) => (
            <TouchableOpacity
              key={index}
              style={{ backgroundColor: '#D9D9D9', borderRadius: scale(10), padding: scale(9), width: '31%', alignItems: 'center',}}>
               <Text style={{ fontSize: scale(16), fontWeight: 'bold' }}>{amount}</Text>
              <View style={{flexDirection:"row",marginTop:scale(18),marginRight:scale(18)}}>
              <Image source={require('../assets/coins.png')} style={{ width: scale(30), height: scale(30), marginBottom: scale(5),marginRight:-6,}} />
              <Image source={require('../assets/coins.png')} style={{ width: scale(30), height: scale(30), marginBottom: scale(5) }} />
              <Image source={require('../assets/coins.png')} style={{ width: scale(30), height: scale(30), marginBottom: scale(5),marginTop:-17,marginStart:-39 }} />
              </View>
              <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: scale(14), marginTop: scale(4),backgroundColor: '#FB923C', paddingHorizontal: scale(10), paddingVertical: scale(4), borderRadius: scale(20) }}>₹95.00</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Hints Section */}
        <Text style={{ color: 'white', fontSize: scale(18), fontWeight: 'bold', marginBottom: scale(20),alignSelf:"center" }}>Hints</Text>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: scale(20) }}>
          {[1000, 4000, 8000].map((amount, index) => (
            <TouchableOpacity
              key={index}
              style={{ backgroundColor: '#D9D9D9', borderRadius: scale(10), padding: scale(9), width: '31%', alignItems: 'center', }}>
               <Text style={{ fontSize: scale(16), fontWeight: 'bold' }}>{amount}</Text>
              <View style={{flexDirection:"row",marginTop:scale(18),marginRight:scale(18)}}>
              <Image source={require('../assets/coins.png')} style={{ width: scale(30), height: scale(30), marginBottom: scale(5),marginRight:-6,}} />
              <Image source={require('../assets/coins.png')} style={{ width: scale(30), height: scale(30), marginBottom: scale(5) }} />
              <Image source={require('../assets/coins.png')} style={{ width: scale(30), height: scale(30), marginBottom: scale(5),marginTop:-17,marginStart:-39 }} />
              </View>
              <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: scale(14), marginTop: scale(4),backgroundColor: '#FB923C', paddingHorizontal: scale(10), paddingVertical: scale(4), borderRadius: scale(20) }}>₹95.00</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

export default Store;
