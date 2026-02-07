import React from 'react';
import { View, Text, Dimensions, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { BarChart, ProgressChart } from 'react-native-chart-kit';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTranslation } from 'react-i18next';

const screenWidth = Dimensions.get('window').width;

const DataScreen = () => {
  const { t } = useTranslation();
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity>
          <Icon name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('data.data')}</Text>
      </View>

      {/* Last Data Chart */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>{t('data.lastData')}</Text>
        <BarChart
          data={{
            labels: ['10k', '20k', '30k', '40k', '50k', '60k', '70k', '80k'],
            datasets: [
              { data: [10, 20, 30, 25, 40, 50, 30, 20] },
              { data: [15, 25, 20, 30, 35, 45, 25, 55] },
            ],
          }}
          width={screenWidth - 32}
          height={200}
          fromZero
          yAxisSuffix="k"
          chartConfig={{
            backgroundColor: '#1E1E2F',
            backgroundGradientFrom: '#1E1E2F',
            backgroundGradientTo: '#1E1E2F',
            color: (opacity = 1) => `rgba(0, 255, 0, ${opacity})`,
            labelColor: () => '#888',
          }}
          style={{ borderRadius: 8 }}
        />
      </View>

      {/* Last Income Chart */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>{t('data.lastIncome')}</Text>
          <Text style={styles.percent}>+58%</Text>
        </View>

        <ProgressChart
          data={{ data: [0.6] }}
          width={screenWidth - 32}
          height={150}
          strokeWidth={10}
          radius={32}
          chartConfig={{
            backgroundColor: '#1E1E2F',
            backgroundGradientFrom: '#1E1E2F',
            backgroundGradientTo: '#1E1E2F',
            color: () => `#4C9EEB`,
            labelColor: () => '#888',
          }}
          hideLegend={true}
          style={{ alignSelf: 'center' }}
        />

        <View style={styles.tagRow}>
          <Text style={styles.tagGreen}>GNote</Text>
          <Text style={styles.tagBlue}>Office</Text>
          <Text style={styles.tagIndigo}>RCloud</Text>
        </View>

        <Text style={styles.increaseText}>{t('data.increase')}: $456.8</Text>
      </View>

      {/* Normals Chart */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>{t('data.normalsChart')}</Text>
          <Text style={styles.percent}>+85%</Text>
        </View>

        <BarChart
          data={{
            labels: ['Jan', 'Feb', 'Mar', 'Apr'],
            datasets: [{ data: [100, 250, 350, 290] }],
          }}
          width={screenWidth - 32}
          height={200}
          fromZero
          yAxisSuffix="$"
          chartConfig={{
            backgroundColor: '#1E1E2F',
            backgroundGradientFrom: '#1E1E2F',
            backgroundGradientTo: '#1E1E2F',
            color: () => `#7F6BFF`,
            labelColor: () => '#888',
          }}
          style={{ borderRadius: 8 }}
        />
      </View>
    </ScrollView>
  );
};

export default DataScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D1B2A',
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 12,
  },
  card: {
    backgroundColor: '#1E1E2F',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  cardTitle: {
    color: '#ccc',
    fontSize: 14,
    marginBottom: 8,
  },
  percent: {
    color: '#6DD47E',
    fontWeight: 'bold',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  tagRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
  },
  tagGreen: {
    backgroundColor: '#62CD72',
    padding: 5,
    borderRadius: 5,
    color: '#000',
  },
  tagBlue: {
    backgroundColor: '#4C9EEB',
    padding: 5,
    borderRadius: 5,
    color: '#fff',
  },
  tagIndigo: {
    backgroundColor: '#8B5CF6',
    padding: 5,
    borderRadius: 5,
    color: '#fff',
  },
  increaseText: {
    color: '#ccc',
    textAlign: 'center',
    marginTop: 8,
  },
});

