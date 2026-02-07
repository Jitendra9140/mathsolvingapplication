import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import CustomHeader from '../components/CustomHeader';
import { useTranslation } from 'react-i18next';

const { width, height } = Dimensions.get('window');

const TermsAndConditions = ({ navigation }) => {
  const { t } = useTranslation();
  const termsText = `
  Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum
  Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum
  Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum
  Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum
  Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum
  Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum
  Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum
  Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum
  Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum
  Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum
  Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum
  Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum
  Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum
  Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum
  Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum
  Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum
  Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum
  Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum
  Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum
  Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum
  `;

  return (
    <View style={styles.container}>
      <CustomHeader
        title={t('terms.termsAndConditions')}
        onBack={() => navigation.goBack()}
      />

      {/* Scrollable T&C Content */}
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.text}>{termsText}</Text>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B1220', // gray background like image
    paddingTop: height * 0.05,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: width * 0.08,
    marginBottom: height * 0.02,
    gap: 95
  },
  backButton: {
    marginRight: width * 0.03,
  },
  title: {
    fontSize: width * 0.055,
    fontWeight: 'bold',
    color: '#fff',

  },
  scrollContent: {
    paddingHorizontal: width * 0.07,
    paddingBottom: height * 0.03,
  },
  text: {
    fontSize: width * 0.04,
    color: '#d8d6d6ff',
    lineHeight: 22,
    textAlign: 'center',
  },
});

export default TermsAndConditions;

