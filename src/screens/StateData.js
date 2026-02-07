import { View, Text, TouchableOpacity, Dimensions, ScrollView, StyleSheet, PixelRatio } from 'react-native'
import React from 'react'
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { BarChart, LineChart } from 'react-native-gifted-charts';
import { PieChart } from 'react-native-svg-charts';
import { useNavigation } from '@react-navigation/native';
import Svg, { Circle } from 'react-native-svg';
const { DoughnutChart } = require('react-native-gifted-charts');
const { width, height } = Dimensions.get('window');
const scale = (size) => (width / 375) * size;
const scaleFont = (size) => size * PixelRatio.getFontScale();

const CircularProgress = ({ percentage }) => {
  const radius = 30;
  const strokeWidth = 6;
  const circumference = 2 * Math.PI * radius;
  const progress = (percentage / 100) * circumference;

   return (
    <Svg height="70" width="70">
      {/* Background Circle */}
      <Circle
        cx="35"
        cy="35"
        r={radius}
        stroke="#a78bfa"
        strokeWidth={strokeWidth}
        fill="none"
      />
      {/* Progress Arc */}
      <Circle
        cx="35"
        cy="35"
        r={radius}
        stroke="#1e1b4b"
        strokeWidth={strokeWidth}
        fill="none"
        strokeDasharray={`${progress}, ${circumference}`}
        strokeLinecap="round"
        rotation="-90"
        origin="35,35"
      />
    </Svg>
  );
}
const StateData = () => {
    const navigation = useNavigation();
    const insets = useSafeAreaInsets();
    const codersData = [140, 125, 150, 130, 145, 165];      // Green
    const designersData = [160, 145, 130, 150, 140, 170];   // Blue

    
    const barData1 = [
        { value: 20000 },
        { value: 30000 },
        { value: 20000 },
        { value: 40000 },
        { value: 30000 },
        { value: 60000 },
        { value: 40000 },
        { value: 80000 }
    ];
    const reactData = [
        { value: 10, label: '1m' },
        { value: 20, label: '2m' },
        { value: 15, label: '3m' },
        { value: 30, label: '4m' },
        { value: 25, label: '5m' },
        { value: 35, label: '6m' },
        { value: 40, label: '7m' },
        { value: 45, label: '8m' },
    ];

    const jsData = [
        { value: 8 },
        { value: 15 },
        { value: 12 },
        { value: 25 },
        { value: 28 },
        { value: 30 },
        { value: 38 },
        { value: 42 },
    ];
    const pieData = [
        { value: 8000, },
        { value: 12000 },
        { value: 18000 },
        { value: 25000 },
        { value: 30000 },
        { value: 35000 },
        { value: 40000 },
        { value: 60000 }
    ];
    const data = [
        { key: 1, amount: 30, svg: { fill: '#414CAA' } },
        { key: 2, amount: 25, svg: { fill: '#3DD34C' } },
        { key: 3, amount: 25, svg: { fill: '#4472CA' } },
        { key: 4, amount: 20, svg: { fill: '#000' } },
    ];
    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={{ padding: scale(14) }}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => {
                        navigation.navigate("Profile");
                    }}>
                        <Ionicons name="arrow-back" size={scale(25)} color="#808080" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>State</Text>
                </View>
                {/* Last Data Bar Chart */}
                <View style={{
                    backgroundColor: '#111',
                    borderRadius: scale(12),
                    marginBottom: scale(20),
                    overflow: 'hidden',
                    padding: scale(12),
                    borderColor: "#4B4B4B",
                    borderWidth: 2,
                }}>
                    <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                        <Text style={{
                            color: '#8e8e8e',
                            fontWeight: 'bold',
                            fontSize: scale(14),
                            marginBottom: scale(1)
                        }}>
                            Coders Type
                        </Text>
                        <Text style={{
                            color: '#000',
                            fontWeight: 'bold',
                            fontSize: scale(12),
                            marginBottom: scale(1),
                            backgroundColor: "#2280FF",
                            borderRadius: 6,
                            paddingHorizontal: 7,
                            paddingVertical: 2,
                            start: 65
                        }}>
                            react
                        </Text>
                        <Text style={{
                            color: '#000',
                            fontWeight: 'bold',
                            fontSize: scale(12),
                            marginBottom: scale(1),
                            backgroundColor: "#3DD34C",
                            borderRadius: 6,
                            paddingHorizontal: 5
                        }}>
                            jscript
                        </Text>

                    </View>

                    <View style={{ marginEnd: 0 }}>
                        <LineChart
                            data={reactData}
                            data2={jsData}
                            height={160}
                            width={width * 0.9}
                            spacing={30}
                            initialSpacing={10}
                            color1="#3B82F6"
                            color2="#22C55E"
                            textColor="#fff"
                            thickness1={3}
                            thickness2={3}
                            hideDataPoints={false}
                            dataPointsColor1="#3B82F6"
                            dataPointsColor2="#22C55E"
                            showVerticalLines={false}
                            showXAxisIndices={false}
                            xAxisLabelTextStyle={{ color: '#ccc', fontSize: 10 }}
                            yAxisTextStyle={{ color: '#ccc' }}
                            backgroundColor="#000"
                            noOfSections={4}
                            maxValue={50}
                            rulesColor="#333"
                        />
                    </View>
                </View>
                {/* Doughnut Chart */}
                <View style={styles.card}>
                    {/* Header */}
                    <View style={styles.headerRow}>
                        <Text style={styles.title}>New Employees</Text>
                        <View style={styles.legend}>
                            <View style={[styles.dot, { backgroundColor: '#22C55E' }]} />
                            <Text style={styles.legendText}>Coders</Text>
                            <View style={[styles.dot, { backgroundColor: '#3B82F6' }]} />
                            <Text style={styles.legendText}>Designers</Text>
                        </View>
                    </View>
                    <View style={{ flexDirection: "row", justifyContent: "space-evenly", gap: 26, top: 10, }}>
                        <View style={{ bottom: 0 }}>
                            {codersData.map((coderValue, index) => (
                                <View key={index} style={styles.barRow}>
                                    <View
                                        style={[
                                            styles.bar,
                                            { width: `${coderValue}%`, backgroundColor: '#22C55E' },
                                        ]}
                                    />
                                    <View
                                        style={[
                                            styles.bar,
                                            { width: `${designersData[index]}%`, backgroundColor: '#3B82F6' },
                                        ]}
                                    />
                                </View>
                            ))}

                            {/* Footer Labels */}
                            <View style={styles.footerRow}>
                                <Text style={styles.footerText}>2021</Text>
                                <Text style={styles.footerText}>2022</Text>
                            </View>
                        </View>
                    </View>
                </View>
                <View style={styles.card}>
                    {/* Header */}
                    <View style={styles.header}>
                        <Text style={styles.title}>Sold products</Text>
                        <Text style={styles.date}>Mar - Jan 2022</Text>
                    </View>

                    {/* Chart Section */}
                    <View style={styles.row}>
                        <View style={styles.chartWrapper}>
                            <CircularProgress percentage={30} />
                            <Text style={styles.percent}>+ 30%</Text>
                        </View>

                        <View style={styles.chartWrapper}>
                            <CircularProgress percentage={35} />
                            <Text style={styles.percent}>+ 35%</Text>
                        </View>

                        <View style={styles.tag}>
                            <Text style={styles.tagText}>JavaScript</Text>
                        </View>
                    </View>
                </View>

            </ScrollView>
        </View>
    )
}

export default StateData

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0F172A',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: height * 0.0,
        marginBottom: height * 0.010,
    },
    headerTitle: {
        color: '#fff',
        fontSize: scaleFont(16),
        fontWeight: '700',
        marginLeft: width * 0.30,
    },
    legendWrapper: {
        flexDirection: 'row',
        gap: scale(8),
    },
    reactLegend: {
        backgroundColor: '#3B82F6',
        color: '#fff',
        paddingHorizontal: scale(8),
        paddingVertical: scale(2),
        borderRadius: scale(4),
        fontWeight: 'bold',
        fontSize: scale(10),
    },
    jsLegend: {
        backgroundColor: '#22C55E',
        color: '#000',
        paddingHorizontal: scale(8),
        paddingVertical: scale(2),
        borderRadius: scale(4),
        fontWeight: 'bold',
        fontSize: scale(10),
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 6,
    },
    title: {
        color: '#4B5563',
        fontWeight: 'bold',
        fontSize: 16,
    },
    legend: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    dot: {
        height: 10,
        width: 10,
        borderRadius: 5,
        marginHorizontal: 4,
    },
    legendText: {
        color: '#fff',
        marginRight: 8,
        fontSize: 12,
    },
    barRow: {
        marginBottom: 1,
        gap: 5
    },
    bar: {
        height: 10,
        borderRadius: 2,
        marginBottom: 4,
        end: 90,

    },
    footerRow: {
        flexDirection: 'row',
        // justifyContent: 'space-between',
        marginTop: 10,
        gap: 80,
    },
    footerText: {
        color: '#fff',
        fontSize: 12,
    },
    card: {
        backgroundColor: '#000',
        borderRadius: 12,
        padding: 16,
        borderColor: "#4B4B4B",
        borderWidth: 2,
    },
      chartWrapper: {
    alignItems: 'center',
    marginRight: 20,
  },
  percent: {
    color: '#fff',
    fontSize: 12,
    marginTop: 4,
  },
  tag: {
    backgroundColor: '#fff',
    paddingHorizontal: 8,
    paddingVertical: 9,
    borderRadius: 4,
    top:20,
    start:30
  },
  tagText: {
    color: '#000',
    fontSize: 12,
    fontWeight: 'bold',
  },
   date: {
    color: '#cbd5e1',
    fontSize: 12,
    start:150
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
})

