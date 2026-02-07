import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Dimensions,
    PixelRatio,
    TouchableOpacity,
    ScrollView,
    Image,
    SafeAreaView,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';

const { width, height } = Dimensions.get('window');
const scale = (size) => (width / 375) * size;
const scaleFont = (size) => size * PixelRatio.getFontScale();

const leaderboardData = [
    { rank: 4, name: 'Guest-ABQYL', score: 17 },
    { rank: 5, name: 'Guest-ABQYL', score: 12 },
    { rank: 6, name: 'Guest-ABQYL', score: 10 },
    { rank: 7, name: 'Guest-ABQYL', score: 9 },
    { rank: 7, name: 'Guest-ABQYL', score: 9 },
    { rank: 7, name: 'Guest-ABQYL', score: 9 },
    { rank: 7, name: 'Guest-ABQYL', score: 9 },
];

const EndlessLeaderboard = () => {
    const navigation = useNavigation();
    const [selectedTab, setSelectedTab] = useState('Brains');
    const [selectedFilter, setSelectedFilter] = useState('Weekly');

    return (
        <SafeAreaView style={styles.container}>
            {/* Top bar */}
            <View style={styles.header}>
            <TouchableOpacity onPress={() => {
                navigation.navigate("Leaderboard");
            }}>
                <Ionicons name="arrow-back" size={scale(25)} color="#808080" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{t('leaderboard.leaderboard')}</Text>
            </View>

            {/* Toggle Tabs */}
            <View style={styles.tabContainer}>
                <TouchableOpacity
                    onPress={() => setSelectedTab('Brains')}
                    style={[
                        styles.tab,
                        selectedTab === 'Brains' && styles.tabSelected,
                    ]}>
                    <Text
                        style={[
                            styles.tabText,
                            selectedTab === 'Brains' && styles.tabTextSelected,
                        ]}>
                        {t('tabs.brains')}
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={() => {
                        setSelectedTab('Endless');
                        navigation.navigate('EndlessLeaderboard'); 
                    }}
                    style={[
                        styles.tab,
                        selectedTab === 'Endless' && styles.tabSelected,
                    ]}>
                    <Text
                        style={[
                            styles.tabText,
                            selectedTab === 'Endless' && styles.tabTextSelected,
                        ]}>
                        {t('tabs.endless')}
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Filters */}
            {/* <View style={styles.filterContainer}>
                {['Weekly', 'World', 'Region'].map((filter) => (
                    <TouchableOpacity
                        key={filter}
                        style={[
                            styles.filterBtn,
                            selectedFilter === filter && styles.activeFilter,
                        ]}
                        onPress={() => setSelectedFilter(filter)}>
                        <Text
                            style={[
                                styles.filterText,
                                selectedFilter === filter && styles.activeFilterText,
                            ]}>
                            {filter}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View> */}

            {/* Top 3 Cards */}
            {/* <View style={styles.topUsersContainer}>
                {[1, 2, 3].map((i) => (
                    <View key={i} style={styles.topCard}>
                        <View style={styles.topCardAvatar} />
                        <View style={styles.topBadge}>
                            <Text style={styles.badgeText}>{i}</Text>
                        </View>
                    </View>
                ))}
            </View> */}

            {/* Leaderboard List */}
            <ScrollView style={{ marginTop: height * 0.01 }}>
                {leaderboardData.map((user, index) => (
                    <View key={index} style={styles.listItem}>
                        <Text style={styles.rankText}>{user.rank}</Text>
                        <Text style={styles.nameText}>🇮🇳 {user.name}</Text>
                        <View style={styles.scoreContainer}>
                            <Image style={{ height: "20", width: "20" }}
                                source={require('../assets/Dasboard.png')} />
                            {/* <FontAwesome5 name="" size={scale(10)} color="#fff" /> */}
                            <Text style={styles.scoreText}>{user.score}</Text>
                        </View>
                    </View>
                ))}
            </ScrollView>
        </SafeAreaView>
    );
};

export default EndlessLeaderboard;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0F172A',
        paddingHorizontal: width * 0.05,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: height * 0.05,
        marginBottom: height * 0.060,
    },
    headerTitle: {
        color: '#fff',
        fontSize: scaleFont(16),
        fontWeight: '700',
        marginLeft: width * 0.25,
    },
    tabContainer: {
        flexDirection: 'row',
        backgroundColor: '#1E293B',
        borderRadius: 25,
        justifyContent: 'space-between',
        padding: 4,
        marginBottom: height * 0.025,
        marginTop: height * 0.015,
    },
    tab: {
        flex: 1,
        paddingVertical: height * 0.01,
        alignItems: 'center',
        borderRadius: 20,
    },
    tabSelected: {
        backgroundColor: '#FB923C',
    },
    tabText: {
        color: '#fff',
        fontSize: scaleFont(12),
    },
    tabTextSelected: {
        fontWeight: 'bold',
    },
    filterContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: height * 0.025,
        borderRadius: 10,
        backgroundColor: "#1E293B",
        paddingVertical: height * 0.02,
    },
    filterBtn: {
        backgroundColor: '#94A3B8',
        paddingHorizontal: width * 0.06,
        paddingVertical: height * 0.008,
        borderRadius: 15,

    },
    activeFilter: {
        backgroundColor: '#E2E8F0',
    },
    filterText: {
        color: '#000',
        fontSize: scaleFont(11),
    },
    activeFilterText: {
        fontWeight: 'bold',
    },
    topUsersContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: height * 0.01,
        backgroundColor: "#1E293B",
        paddingVertical: height * 0.02,
    },
    topCard: {
        width: width * 0.22,
        height: height * 0.11,
        backgroundColor: '#CBD5E1',
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
    topCardAvatar: {
        width: width * 0.14,
        height: width * 0.14,
        backgroundColor: '#E2E8F0',
        borderRadius: 100,
    },
    topBadge: {
        position: 'absolute',
        bottom: -5,
        backgroundColor: '#FB923C',
        borderRadius: 20,
        paddingHorizontal: 5,
        paddingVertical: 1,
        borderWidth: 4
    },
    badgeText: {
        color: '#fff',
        fontSize: scaleFont(10),
        fontWeight: 'bold',
    },
    listItem: {
        backgroundColor: '#1E293B',
        flexDirection: 'row',
        alignItems: 'center',
        padding: width * 0.03,
        borderRadius: 10,
        marginBottom: height * 0.012,
    },
    rankText: {
        color: '#fff',
        fontSize: scaleFont(12),
        fontWeight: 'bold',
        width: width * 0.05,
        flexDirection: "row",
    },
    nameText: {
        color: '#fff',
        fontSize: scaleFont(12),
        flex: 1,
        marginLeft: width * 0.02,
    },
    scoreContainer: {
        backgroundColor: '#FB923C',
        borderRadius: 15,
        paddingHorizontal: width * 0.035,
        paddingVertical: height * 0.005,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
    },
    scoreText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: scaleFont(12),
    },
});

