import { View, Text, TouchableOpacity, Dimensions, ScrollView, StyleSheet, PixelRatio, SafeAreaView } from 'react-native'
import React from 'react'
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { BarChart } from 'react-native-gifted-charts';
import { PieChart } from 'react-native-svg-charts';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';

const { DoughnutChart } = require('react-native-gifted-charts');
const { width, height } = Dimensions.get('window');
const scale = (size) => (width / 375) * size;
const scaleFont = (size) => size * PixelRatio.getFontScale();

const Dashboard = () => {
    const navigation = useNavigation();
    const insets = useSafeAreaInsets();
    const { t } = useTranslation();
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

    // ✅ Calculate total and chartData with percentage labels
    // const total = barData1.reduce((sum, item) => sum + item.value, 0);
    // const chartData = barData1.map((d, i) => {
    //     const percentage = ((d.value / total) * 100).toFixed(1) + '%';
    //     // return {
    //     //     value: d.value,
    //     //     frontColor: i % 2 === 0 ? '#706FFF' : '#00FF87',
    //     //     label: percentage,
    //     // };
    // });

    const pieData = [
        { value: 8000 ,},
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
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={{ padding: scale(14) }}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => {
                        navigation.navigate("Profile");
                    }}>
                        <Ionicons name="arrow-back" size={scale(25)} color="#808080" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => {
                        navigation.navigate("StateData");
                    }}>
                    <Text style={styles.headerTitle}>{t('data.title')}</Text>
                    </TouchableOpacity>
                </View>
                {/* Last Data Bar Chart */}
                <View style={{
                    backgroundColor: '#111',
                    borderRadius: scale(12),
                    marginBottom: scale(20),
                    overflow: 'hidden',
                    padding: scale(12),
                    borderColor: "#4B4B4B",
                    borderWidth: 2
                }}>
                    <Text style={{
                        color: '#fff',
                        fontWeight: 'bold',
                        fontSize: scale(14),
                        marginBottom: scale(1)
                    }}>
                        {t('data.lastData')}
                    </Text>
                    <View style={{ marginEnd: 0 }}>
                        <BarChart
                            barWidth={14}
                            height={130}
                            frontColor="#00FF87"
                            data={barData1.map((d, i) => {
                                const total = barData1.reduce((sum, item) => sum + item.value, 0);
                                const percent = ((d.value / total) * 100).toFixed(0) + '%';
                                return {
                                    value: d.value,
                                    label: percent,
                                    frontColor: i % 2 === 0 ? '#6D62F7' : '#3DD34C',
                                };
                            })}
                            yAxisThickness={0}
                            xAxisThickness={0}
                            isAnimated
                            rulesColor="#fff"
                            hideRules={true}
                            labelWidth={35}
                            barLabelComponent={({ item }) => (
                                <Text>
                                    {/* {item.label} */}
                                </Text>
                            )}
                        />
                    </View>
                </View>
                {/* Doughnut Chart */}
                <View style={{
                    backgroundColor: '#111',
                    borderRadius: scale(12),
                    marginBottom: scale(20),
                    overflow: 'hidden',
                    padding: scale(12),
                    borderColor: "#4B4B4B",
                    borderWidth: 2,
                    alignItems: "center",
                }}>
                    <View style={{ flexDirection: "row", justifyContent: "space-between", gap: "60%" }}>
                        <Text style={{ color: "#8e8e8e" }}>{t('data.lastIncome')}</Text>
                        <Text style={{ color: "#8e8e8e" }}>+ 55%</Text>
                    </View>
                    <View style={{ flexDirection: "row", justifyContent: "space-evenly", gap: 26, top: 10 }}>
                        <Text style={{ color: "#8e8e8e", fontWeight: "bold", }}>{t('data.aprJan')}</Text>
                        <View style={{ bottom: 30 }}>
                            <PieChart
                                style={{ height: 130, width: width * 0.3, }}
                                valueAccessor={({ item }) => item.amount}
                                data={data}
                                spacing={0}
                                outerRadius={'100%'}
                                innerRadius={'70%'}
                            >
                            </PieChart>
                        </View>
                        <Text style={{ color: "#8e8e8e", fontWeight: "bold" }}>{t('data.monthToMonth')}</Text>
                    </View>
                    <Text style={{ color: "#fff", fontWeight: "bold", start: "35%", bottom: "13%" }}>{t('data.increase')}:$456.8</Text>
                    <View style={{ flexDirection: "row", gap: 10, end: 80 }}>
                        <Text style={{ color: "#000", backgroundColor: "#3DD34C", padding: 7, borderRadius: 8, fontWeight: "bold" }}>GNote</Text>
                        <Text style={{ color: "#000", backgroundColor: "#414CAA", padding: 7, borderRadius: 8, fontWeight: "bold" }}>GNote</Text>
                        <Text style={{ color: "#000", backgroundColor: "#2280FF", padding: 7, borderRadius: 8, fontWeight: "bold" }}>GNote</Text>
                    </View>
                </View>
                {/* Exact Match Dual Bar Chart (Image Style) */}
                <View style={{
                    backgroundColor: '#000',
                    borderRadius: scale(12),
                    marginBottom: scale(20),
                    overflow: 'hidden',
                    padding: scale(12),
                    borderColor: "#4B4B4B",
                    borderWidth:2
                }}>
                    {/* Header */}
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: scale(4) }}>
                        <Text style={{ color: '#5f5f5f', fontWeight: 'bold', fontSize: scale(13) }}>{t('data.normalsChart')}</Text>
                        <Text style={{ color: '#ccc', fontWeight: 'bold', fontSize: scale(13) }}>+ 55%</Text>
                    </View>

                    {/* Chart Body */}
                    <View style={{ flexDirection: 'row', }}>
                        {/* Y-Axis Labels */}
                        <View style={{ justifyContent: 'space-between', paddingVertical: 4, marginRight: scale(8) }}>
                            {['$1400', '$950', '$500', '$50'].map((label, index) => (
                                <Text key={index} style={{ color: '#ccc', fontSize: scale(10), marginBottom: scale(18) }}>{label}</Text>
                            ))}
                        </View>

                        {/* Bars */}
                        <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'space-around', alignItems: 'flex-end', paddingTop: scale(10), paddingBottom: scale(4) }}>
                            {[
                                [40, 90],
                                [60, 120],
                                [100, 150],
                                [90, 130],
                            ].map((pair, index) => (
                                <View key={index} style={{ flexDirection: 'row', alignItems: 'flex-end',}}>
                                    <View style={{
                                        width: scale(12),
                                        height: pair[0],
                                        backgroundColor: '#A89FFF',
                                        borderRadius: 2,
                                        
                                    }} />
                                    <View style={{
                                        width: scale(12),
                                        height: pair[1],
                                        backgroundColor: '#6D62F7',
                                        borderRadius: 2,
                                        opacity:0.8
                                    }} />
                                </View>
                            ))}
                        </View>
                    </View>
                </View>

            </ScrollView>
        </SafeAreaView>
    )
}

export default Dashboard

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0F172A',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: height * 0.0,
        marginBottom: height * 0.030,
    },
    headerTitle: {
        color: '#fff',
        fontSize: scaleFont(16),
        fontWeight: '700',
        marginLeft: width * 0.30,
    },
})

