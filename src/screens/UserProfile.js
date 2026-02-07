

import { useNavigation, useRoute } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Image,
    TouchableOpacity,
    Dimensions,
    PixelRatio,
    ScrollView,
    ActivityIndicator,
    Platform,
    Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../context/ThemeContext';
import CustomHeader from '../components/CustomHeader';
import { useTranslation } from 'react-i18next';

const { width, height } = Dimensions.get('window');
const scale = width / 375;
const normalize = size =>
    Math.round(PixelRatio.roundToNearestPixel(size * scale));

import Toast from 'react-native-toast-message';

const UserProfile = () => {
    const Navigation = useNavigation();
    const route = useRoute();
    const { theme } = useTheme();
    const { t } = useTranslation();

    // Get userId passed from previous screen
    const { userId } = route.params || {};

    console.log("🔍 UserProfile Response:", userId);
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [friendshipStatus, setFriendshipStatus] = useState(null); // 'accepted', 'pending', 'none'
    const [actionLoading, setActionLoading] = useState(false);

    /* ================= FETCH USER ================= */
    useEffect(() => {
        const fetchUserData = async () => {
            if (!userId) {
                Alert.alert("Error", "User ID not found");
                Navigation.goBack();
                return;
            }

            try {
                const token = await AsyncStorage.getItem('authToken');
                const response = await fetch(
                    `http://43.204.167.118:3000/api/auth/getUserById?userId=${userId}`,
                    {
                        method: 'GET',
                        headers: {
                            Authorization: `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        }
                    }
                );

                const text = await response.text();
                // console.log("🔍 UserProfile Raw Response:", text);

                let result;
                try {
                    result = JSON.parse(text);
                } catch (jsonError) {
                    Alert.alert("Error", "Server error (Invalid JSON)");
                    return;
                }

                if (result.success) {
                    setUserData(result.user);
                    checkFriendshipStatus(result.user.username);
                } else {
                    Alert.alert("Error", result.message || "Failed to fetch profile");
                }
            } catch (e) {
                console.log("❌ Fetch Error:", e);
                Alert.alert("Error", "Network error");
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, [userId]);

    const checkFriendshipStatus = async (username) => {
        if (!username) return;
        try {
            const token = await AsyncStorage.getItem('authToken');
            const response = await fetch(
                'http://43.204.167.118:3000/api/friend/search-user-list',
                {
                    method: 'POST',
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ searchText: username })
                }
            );
            const data = await response.json();
            if (data.success && data.users) {
                const found = data.users.find(u => u._id === userId);
                if (found) {
                    setFriendshipStatus(found.friendshipStatus);
                }
            }
        } catch (error) {
            console.log("Status Check Error:", error);
        }
    };

    const handleAddFriend = async () => {
        if (actionLoading) return;
        setActionLoading(true);
        try {
            const token = await AsyncStorage.getItem('authToken');
            const userDataStr = await AsyncStorage.getItem('userData');
            const parsedUser = JSON.parse(userDataStr);
            const requesterId = parsedUser?.id || parsedUser?._id;

            if (!requesterId || !userId) return;

            const response = await fetch(
                'http://43.204.167.118:3000/api/friend/add-friend',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        requester: requesterId,
                        recipient: userId,
                    }),
                },
            );
            const data = await response.json();
            if (data.success) {
                setFriendshipStatus('pending');
                Toast.show({ type: 'success', text1: 'Friend Request Sent' });
            } else {
                Toast.show({ type: 'error', text1: data.message || 'Failed' });
            }
        } catch (error) {
            Toast.show({ type: 'error', text1: 'Error sending request' });
        } finally {
            setActionLoading(false);
        }
    };

    const handleRemoveFriend = async () => {
        if (actionLoading) return;
        setActionLoading(true);
        try {
            const token = await AsyncStorage.getItem('authToken');
            const response = await fetch(
                'http://43.204.167.118:3000/api/friend/deleteFriendShipByUser',
                {
                    method: 'DELETE',
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ friendId: userId })
                }
            );
            const data = await response.json();
            if (data.success) {
                setFriendshipStatus('none');
                Toast.show({ type: 'success', text1: friendshipStatus === 'pending' ? 'Request Cancelled' : 'Unfriended' });
            } else {
                Toast.show({ type: 'error', text1: 'Failed to remove' });
            }
        } catch (error) {
            Toast.show({ type: 'error', text1: 'Error removing friend' });
        } finally {
            setActionLoading(false);
        }
    };

    /* ================= HELPERS ================= */
    const formatDate = d => {
        if (!d) return 'N/A';
        const date = new Date(d);
        return `${date.getDate().toString().padStart(2, '0')}-${date.toLocaleString(
            'en',
            { month: 'short' },
        )}-${date.getFullYear().toString().slice(-2)}`;
    };

    const mapCountryNameToCode = name => {
        if (!name) return '';
        const map = {
            india: 'IN',
            'united states': 'US',
            'united kingdom': 'UK',
            canada: 'CA',
            australia: 'AU',
            germany: 'DE',
            france: 'FR',
        };
        return map[name.toLowerCase()] || '';
    };

    const getFlagEmoji = code =>
        code
            ? code
                .toUpperCase()
                .replace(/./g, c =>
                    String.fromCodePoint(127397 + c.charCodeAt()),
                )
            : '';

    // ✅ Main screen content
    const Content = () => {
        const insets = useSafeAreaInsets();

        return (
            <View style={{ flex: 1, paddingTop: insets.top + 30 }}>
                {/* Custom Header outside of padded container for edge-to-edge effect */}
                <CustomHeader
                    title={t('profile.userProfile')}
                    onBack={() => Navigation.goBack()}
                />

                <View style={styles.container}>
                    <ScrollView
                        contentContainerStyle={styles.scrollContent}
                        showsVerticalScrollIndicator={false}>

                        {loading ? (
                            <ActivityIndicator
                                size="large"
                                color="#fff"
                                style={{ marginTop: 50 }}
                            />
                        ) : (
                            <View style={styles.profileSection}>
                                {/* Profile Section */}
                                <View style={styles.profileTop}>
                                    <View style={styles.imageContainer}>
                                        <Image
                                            source={
                                                userData?.profileImage
                                                    ? { uri: userData.profileImage }
                                                    : require('../assets/dummyProfile.jpg')
                                            }
                                            style={styles.profileImage}
                                        />
                                    </View>
                                    <View style={styles.profileText}>
                                        <Text style={styles.userName}>
                                            {userData?.username || 'Unknown'}
                                        </Text>
                                        <Text style={styles.joinDate}>
                                            {t('profile.status')}: {userData?.accountStatus?.state || t('profile.active')}
                                        </Text>

                                        {/* FOLLOW / UNFOLLOW BUTTON */}
                                        <TouchableOpacity
                                            style={[
                                                styles.actionButton,
                                                {
                                                    backgroundColor: friendshipStatus === 'accepted' ? '#EF4444' : // Red for Remove
                                                        friendshipStatus === 'pending' ? '#64748B' : // Grey for Cancel
                                                            '#3B82F6' // Blue for Add
                                                }
                                            ]}
                                            onPress={
                                                friendshipStatus === 'accepted' || friendshipStatus === 'pending'
                                                    ? handleRemoveFriend
                                                    : handleAddFriend
                                            }
                                            disabled={actionLoading}
                                        >
                                            {actionLoading ? (
                                                <ActivityIndicator size="small" color="#fff" />
                                            ) : (
                                                <Text style={styles.actionButtonText}>
                                                    {friendshipStatus === 'accepted' ? t('profile.unfriend') :
                                                        friendshipStatus === 'pending' ? t('profile.cancelRequest') :
                                                            t('friends.addFriend')}
                                                </Text>
                                            )}
                                        </TouchableOpacity>

                                    </View>
                                </View>

                                {/* Info */}
                                <View style={styles.userInfo}>
                                    <Text style={styles.email}>
                                        {t('profile.email')}:{' '}
                                        <Text style={styles.emailText}>{userData?.email || t('profile.notAvailable')}</Text>
                                    </Text>
                                    <Text style={styles.detail}>
                                        {t('profile.firstName')}: {userData?.firstName || t('profile.notAvailable')}
                                    </Text>
                                    <Text style={styles.detail}>
                                        {t('profile.lastName')}: {userData?.lastName || t('profile.notAvailable')}
                                    </Text>
                                    <Text style={styles.detail}>
                                        {t('profile.yearOfBirth')} : {userData?.dateOfBirth ? new Date(userData.dateOfBirth).getFullYear() : t('profile.notAvailable')}
                                    </Text>
                                    <Text style={styles.detail}>
                                        {t('profile.gender')}: {userData?.gender || t('profile.notAvailable')}
                                    </Text>

                                    {/* Location */}
                                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                        <Text style={styles.detail}>{t('profile.country')}:</Text>
                                        {userData?.country ? (
                                            <View style={{ marginStart: 12, marginTop: -2 }}>
                                                <Text style={{ fontSize: normalize(18) }}>
                                                    {getFlagEmoji(mapCountryNameToCode(userData.country)) || userData.country}
                                                </Text>
                                            </View>
                                        ) : (
                                            <Text style={{ color: '#777', marginStart: 10 }}>
                                                {t('profile.notSet')}
                                            </Text>
                                        )}
                                    </View>
                                </View>

                                {/* Rank Tabs - Visual only */}
                                <View style={styles.tabRow}>
                                    {['E2', 'E4', 'M2', 'M4', 'H2', 'H4'].map((item, index) => (
                                        <TouchableOpacity
                                            key={index}
                                            style={[styles.tab, item === 'M4' && styles.activeTab]}>
                                            <Text
                                                style={[
                                                    styles.tabText,
                                                    item === 'M4' && styles.activeTabText,
                                                ]}>
                                                {item}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>

                                {/* Rank Bar - Visual styling */}
                                <View style={styles.rankContainer}>
                                    <Text style={styles.rankText}>
                                        {t('profile.pvpMediumRating')}: {userData?.pr?.pvp?.medium || t('profile.notAvailable')}
                                    </Text>
                                    <View style={styles.rankBar}>
                                        <View style={[styles.rankBarFillGreen, { width: '50%' }]} />
                                        <View style={[styles.rankBarFillRed, { width: '45%' }]} />
                                    </View>
                                </View>

                                {/* Achievements */}
                                <View style={styles.achievementsContainer}>
                                    <Text style={styles.achievementTitle}>{t('profile.achievements')}</Text>
                                    <View style={styles.achievementRow}>
                                        {['Ach. 1', 'Ach. 2', 'Ach. 3', 'Ach. 4'].map((item, index) => (
                                            <View key={index} style={styles.achievementBox}>
                                                <Text style={styles.achievementText}>{item}</Text>
                                            </View>
                                        ))}
                                    </View>
                                </View>
                            </View>
                        )}
                    </ScrollView>
                </View>
            </View>
        );
    };

    return theme.backgroundGradient ? (
        <LinearGradient colors={theme.backgroundGradient} style={{ flex: 1 }}>
            <Content />
        </LinearGradient>
    ) : (
        <View
            style={{
                flex: 1,
                backgroundColor: theme.backgroundColor || '#0D0D26',
            }}>
            <Content />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, padding: normalize(10) },
    scrollContent: {
        paddingBottom: normalize(30),
        paddingHorizontal: normalize(16),
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: normalize(15),
    },
    headerTitle: { color: '#fff', fontSize: normalize(18), fontWeight: '700' },
    headerSeparator: {
        height: 1,
        backgroundColor: '#94A3B8',
        opacity: 0.5,
        top: 10,
        marginHorizontal: -width * 0.05,
        marginBottom: height * 0.02,
        bottom: '1%',
    },
    profileSection: { marginVertical: normalize(10) },
    profileTop: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: normalize(12),
    },
    imageContainer: {
        borderWidth: 2,
        borderColor: '#444',
        borderRadius: normalize(30),
        overflow: 'hidden',
    },
    profileImage: {
        width: normalize(70),
        height: normalize(70),
    },
    profileText: { marginLeft: normalize(30) },
    userName: {
        color: '#fff',
        fontSize: normalize(18),
        fontWeight: '600',
        marginBottom: normalize(4),
    },
    joinDate: { color: '#999', fontSize: normalize(12) },
    userInfo: { marginTop: normalize(10), alignItems: 'flex-start' },
    email: { color: '#bbb', fontSize: normalize(14), marginBottom: normalize(2) },
    emailText: { color: '#4da6ff' },
    detail: {
        color: '#ccc',
        fontSize: normalize(14),
        marginVertical: normalize(2),
    },
    tabRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: normalize(35),
    },
    tab: {
        flex: 1,
        paddingVertical: normalize(8),
        alignItems: 'center',
        marginHorizontal: normalize(2),
        backgroundColor: '#1b1b3a',
        borderRadius: normalize(6),
    },
    activeTab: { backgroundColor: '#4e54c8' },
    tabText: { color: '#bbb', fontSize: normalize(14) },
    activeTabText: { color: '#fff', fontWeight: '600' },
    rankContainer: { marginTop: normalize(28) },
    rankText: {
        color: '#fff',
        fontSize: normalize(13),
        textAlign: 'center',
        marginBottom: normalize(20),
    },
    rankBar: {
        flexDirection: 'row',
        height: normalize(8),
        borderRadius: 6,
        overflow: 'hidden',
    },
    rankBarFillGreen: { backgroundColor: '#4CAF50' },
    rankBarFillRed: { backgroundColor: '#F44336' },
    achievementsContainer: { marginTop: normalize(25) },
    achievementTitle: {
        color: '#fff',
        fontSize: normalize(14),
        marginBottom: normalize(10),
        textAlign: 'center',
    },
    achievementRow: { flexDirection: 'row', justifyContent: 'space-between' },
    achievementBox: {
        flex: 1,
        backgroundColor: '#1e1e40',
        paddingVertical: normalize(10),
        marginHorizontal: normalize(4),
        borderRadius: normalize(8),
        alignItems: 'center',
    },
    achievementText: { color: '#ddd', fontSize: normalize(12) },
    actionButton: {
        marginTop: normalize(10),
        paddingVertical: normalize(8),
        paddingHorizontal: normalize(20),
        borderRadius: normalize(8),
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: normalize(100),
    },
    actionButtonText: {
        color: '#fff',
        fontSize: normalize(14),
        fontWeight: '600',
    },
});

export default UserProfile;

