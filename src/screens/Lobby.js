// import React, { useState, useEffect, useRef } from 'react';
// import {
//     View,
//     Text,
//     StyleSheet,
//     TouchableOpacity,
//     Animated,
//     Image,
//     Alert,
// } from 'react-native';
// import LinearGradient from 'react-native-linear-gradient';
// import { useNavigation, useRoute } from '@react-navigation/native';
// import { Search, X, Users, Clock, Star } from 'lucide-react-native';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import { useSocket } from '../context/Socket';
// import { useTheme } from '../context/ThemeContext';

// export default function Lobby() {
//     const socket = useSocket();
//     const { theme } = useTheme();
//     const route = useRoute();
//     const { difficulty, digit, symbol, timer, qm } = route.params;
//     const navigation = useNavigation();

//     /* ================= STATE ================= */
//     const [isSearching, setIsSearching] = useState(false);
//     const [player, setPlayer] = useState(null);
//     const [matchFound, setMatchFound] = useState(false);
//     const [opponentData, setOpponentData] = useState(null);
//     const [dummyIdx, setDummyIdx] = useState(0);

//     const DUMMY_AVATARS = [
//         'https://img.freepik.com/free-psd/3d-illustration-human-avatar-profile_23-2150671142.jpg',
//         'https://img.freepik.com/free-psd/3d-illustration-human-avatar-profile_23-2150671122.jpg',
//         'https://img.freepik.com/free-psd/3d-illustration-person-with-sunglasses_23-2149436188.jpg',
//     ];

//     /* ================= REFS ================= */
//     const pulseAnim = useRef(new Animated.Value(1)).current;
//     const rotateAnim = useRef(new Animated.Value(0)).current;
//     const scaleAnim = useRef(new Animated.Value(1)).current;

//     const readyToNavigateRef = useRef(false);
//     const pendingGameStartData = useRef(null);
//     const hasNavigatedRef = useRef(false);
//     const socketRef = useRef(null);
//     const opponentRef = useRef(null);
//     const myMongoIdRef = useRef(null);

//     /* ================= EFFECT 1: Load User Data ================= */
//     useEffect(() => {
//         const getUserData = async () => {
//             try {
//                 const userData = await AsyncStorage.getItem('userData');
//                 if (userData) {
//                     const user = JSON.parse(userData);
//                     console.log('✅ User Info:', user);
//                     setPlayer(user);

//                     // ✅ CRITICAL: Set MongoDB ID immediately
//                     const mongoId = user._id || user.id;
//                     if (!mongoId) {
//                         console.error('❌ No MongoDB ID found in user data!');
//                         Alert.alert('Error', 'User ID not found. Please login again.');
//                         navigation.goBack();
//                         return;
//                     }

//                     myMongoIdRef.current = mongoId;
//                     console.log('✅ MongoDB ID set:', mongoId);
//                 } else {
//                     console.error('❌ No user data in AsyncStorage');
//                     Alert.alert('Error', 'Please login first');
//                     navigation.goBack();
//                 }
//             } catch (error) {
//                 console.error('❌ Error loading user data:', error);
//                 Alert.alert('Error', 'Failed to load user data');
//             }
//         };
//         getUserData();
//     }, []);

//     /* ================= EFFECT 2: Dummy Avatar Animation ================= */
//     useEffect(() => {
//         let dummyInterval;
//         let pulseAnimation;
//         let rotateAnimation;

//         if (isSearching && !matchFound) {
//             // Cycle dummy avatars
//             dummyInterval = setInterval(() => {
//                 setDummyIdx(prev => (prev + 1) % DUMMY_AVATARS.length);
//             }, 600);

//             // Pulse animation
//             pulseAnimation = Animated.loop(
//                 Animated.sequence([
//                     Animated.timing(pulseAnim, {
//                         toValue: 1.1,
//                         duration: 800,
//                         useNativeDriver: true,
//                     }),
//                     Animated.timing(pulseAnim, {
//                         toValue: 1,
//                         duration: 800,
//                         useNativeDriver: true,
//                     }),
//                 ]),
//             );

//             // Rotate animation
//             rotateAnimation = Animated.loop(
//                 Animated.timing(rotateAnim, {
//                     toValue: 1,
//                     duration: 2000,
//                     useNativeDriver: true,
//                 }),
//             );

//             pulseAnimation.start();
//             rotateAnimation.start();
//         }

//         // Cleanup function
//         return () => {
//             if (dummyInterval) clearInterval(dummyInterval);
//             if (pulseAnimation) pulseAnimation.stop();
//             if (rotateAnimation) rotateAnimation.stop();
//             pulseAnim.setValue(1);
//             rotateAnim.setValue(0);
//         };
//     }, [isSearching, matchFound, pulseAnim, rotateAnim]);

//     /* ================= EFFECT 3: Cleanup on Unmount ================= */
//     useEffect(() => {
//         return () => {
//             // ✅ CRITICAL: Cancel search when leaving lobby
//             if (isSearching && socketRef.current?.connected) {
//                 console.log('🧹 Lobby unmount - cancelling search');
//                 socketRef.current.emit('cancel_search');
//             }

//             // ✅ Reset all refs
//             readyToNavigateRef.current = false;
//             hasNavigatedRef.current = false;
//             pendingGameStartData.current = null;
//             opponentRef.current = null;
//         };
//     }, [isSearching]);

//     /* ================= EFFECT 4: Socket Listeners ================= */
//     useEffect(() => {
//         if (!socket) {
//             console.warn('⚠️ Socket not available');
//             return;
//         }

//         socketRef.current = socket;
//         console.log('🔌 Setting up socket listeners...');

//         // Connection handlers
//         const handleConnect = () => {
//             console.log('🟢 Connected to socket server');
//             console.log('🆔 Socket ID:', socket.id);
//         };

//         const handleDisconnect = reason => {
//             console.log('🔴 Disconnected from socket:', reason);
//             if (isSearching) {
//                 setIsSearching(false);
//                 setMatchFound(false);
//                 Alert.alert('Disconnected', 'Connection lost. Please try again.');
//             }
//         };

//         // Lobby joined handler
//         const handleLobbyJoined = data => {
//             console.log('📥 lobby-joined:', data);

//             if (data.success && data.player?.id) {
//                 console.log('✅ My MongoDB ID confirmed:', data.player.id);
//                 myMongoIdRef.current = data.player.id;
//             } else {
//                 console.error('❌ Invalid lobby-joined response:', data);
//             }
//         };

//         // Match found handler
//         const handleMatchFound = ({
//             gameRoom,
//             opponent,
//             myPlayerId,
//             initialQuestionMeter,
//         }) => {
//             console.log('✅ MATCH FOUND!');
//             console.log('📊 Match Data:', {
//                 opponent: opponent?.username,
//                 myPlayerId,
//                 initialQuestionMeter,
//             });

//             // ✅ Validate opponent data
//             if (!opponent?.id || !opponent?.username) {
//                 console.error('❌ Invalid opponent data:', opponent);
//                 Alert.alert('Error', 'Invalid match data received');
//                 setIsSearching(false);
//                 return;
//             }

//             // ✅ Store complete opponent data with MongoDB ID
//             const opponentInfo = {
//                 id: opponent.id,
//                 username: opponent.username,
//                 rating: opponent.rating || 1000,
//             };

//             myMongoIdRef.current = myPlayerId;
//             opponentRef.current = opponentInfo;

//             setOpponentData(opponentInfo);
//             setMatchFound(true);
//             hasNavigatedRef.current = false;

//             // ✅ Wait 2 seconds for animation before allowing navigation
//             setTimeout(() => {
//                 readyToNavigateRef.current = true;

//                 // If game-started already received, navigate now
//                 if (pendingGameStartData.current) {
//                     console.log('🚀 Navigating to Game (Delayed trigger)');
//                     navigateToGame(pendingGameStartData.current);
//                 }
//             }, 2000);
//         };

//         // Game started handler
//         const handleGameStarted = data => {
//             console.log('🚀 GAME STARTED received:', data);

//             // ✅ Validate data
//             if (!data.currentQuestion) {
//                 console.error('❌ No current question in game-started:', data);
//                 Alert.alert('Error', 'Invalid game data received');
//                 setIsSearching(false);
//                 setMatchFound(false);
//                 return;
//             }

//             if (readyToNavigateRef.current) {
//                 // Ready to navigate immediately
//                 navigateToGame(data);
//             } else {
//                 // Wait for match-found animation to finish
//                 console.log('⏳ Waiting for Match Found animation...');
//                 pendingGameStartData.current = data;
//             }
//         };

//         // Error handler
//         const handleError = error => {
//             console.error('❌ Socket error:', error);
//             Alert.alert('Error', error.message || 'An error occurred');
//             setIsSearching(false);
//             setMatchFound(false);
//         };

//         // Register listeners
//         socket.on('connect', handleConnect);
//         socket.on('disconnect', handleDisconnect);
//         socket.on('lobby-joined', handleLobbyJoined);
//         socket.on('match-found', handleMatchFound);
//         socket.on('game-started', handleGameStarted);
//         socket.on('error', handleError);

//         // Cleanup function
//         return () => {
//             console.log('🧹 Removing socket listeners');
//             socket.off('connect', handleConnect);
//             socket.off('disconnect', handleDisconnect);
//             socket.off('lobby-joined', handleLobbyJoined);
//             socket.off('match-found', handleMatchFound);
//             socket.off('game-started', handleGameStarted);
//             socket.off('error', handleError);
//         };
//     }, [socket, isSearching]);

//     /* ================= NAVIGATION HELPER ================= */
//     const navigateToGame = ({ gameState, currentQuestion, myPlayerId }) => {
//         // ✅ Prevent duplicate navigation
//         if (hasNavigatedRef.current) {
//             console.log('🛑 Already navigated to game, skipping duplicate.');
//             return;
//         }

//         // ✅ Validate required data
//         if (!currentQuestion) {
//             console.error('❌ Cannot navigate: No current question');
//             Alert.alert('Error', 'Game data is missing');
//             setIsSearching(false);
//             setMatchFound(false);
//             return;
//         }

//         const finalMongoId = myPlayerId || myMongoIdRef.current;
//         const finalOpponent = opponentRef.current;

//         if (!finalMongoId) {
//             console.error('❌ Cannot navigate: No MongoDB ID');
//             Alert.alert('Error', 'Player ID is missing');
//             setIsSearching(false);
//             setMatchFound(false);
//             return;
//         }

//         if (!finalOpponent?.id) {
//             console.error('❌ Cannot navigate: No opponent data');
//             Alert.alert('Error', 'Opponent data is missing');
//             setIsSearching(false);
//             setMatchFound(false);
//             return;
//         }

//         hasNavigatedRef.current = true;

//         console.log('🎮 Navigating to game with:');
//         console.log('  - My MongoDB ID:', finalMongoId);
//         console.log('  - Opponent:', finalOpponent);
//         console.log('  - Question:', currentQuestion);

//         // ✅ Navigate to game
//         navigation.navigate('MultiPlayerGame', {
//             currentQuestion,
//             timer,
//             opponent: finalOpponent,
//             myMongoId: finalMongoId,
//             difficulty,
//         });

//         // ✅ Reset state after navigation
//         setTimeout(() => {
//             setIsSearching(false);
//             setMatchFound(false);
//             setOpponentData(null);
//             pendingGameStartData.current = null;
//             readyToNavigateRef.current = false;
//             hasNavigatedRef.current = false;
//         }, 500);
//     };

//     /* ================= START SEARCH HANDLER ================= */
//     // const handleStartSearch = async () => {
//     //     // ✅ Reset all state
//     //     setIsSearching(true);
//     //     setMatchFound(false);
//     //     setOpponentData(null);
//     //     pendingGameStartData.current = null;
//     //     readyToNavigateRef.current = false;
//     //     hasNavigatedRef.current = false;

//     const handleStartSearch = () => {
//   if (!socketRef.current?.connected) {
//     Alert.alert('Error', 'Socket not connected');
//     return;
//   }

//   // reset state
//   setIsSearching(true);
//   setMatchFound(false);
//   setOpponentData(null);
//   pendingGameStartData.current = null;
//   readyToNavigateRef.current = false;
//   hasNavigatedRef.current = false;

//   console.log('🚪 Joining lobby...');
//   socketRef.current.emit('join-lobby');

//   Animated.spring(scaleAnim, {
//     toValue: 0.95,
//     tension: 150,
//     friction: 4,
//     useNativeDriver: true,
//   }).start();
// };

//     //     try {
//     //         const storedUserData = await AsyncStorage.getItem('userData');

//     //         if (!storedUserData) {
//     //             console.error('❌ No user data found');
//     //             Alert.alert('Error', 'Please login first');
//     //             setIsSearching(false);
//     //             navigation.goBack();
//     //             return;
//     //         }

//     //         const userData = JSON.parse(storedUserData);

//     //         if (!userData._id && !userData.id) {
//     //             console.error('❌ User data missing ID');
//     //             Alert.alert('Error', 'Invalid user data. Please login again.');
//     //             setIsSearching(false);
//     //             navigation.goBack();
//     //             return;
//     //         }

//     //         if (!socketRef.current?.connected) {
//     //             console.error('❌ Socket not connected');
//     //             Alert.alert('Error', 'Not connected to server. Please try again.');
//     //             setIsSearching(false);
//     //             return;
//     //         }

//     //         console.log('🔍 Joining lobby with MongoDB ID:', userData._id);

//     //         // ✅ Emit join-lobby with all required data
//     //         socketRef.current.emit('join-lobby', {
//     //             userId: userData._id || userData.id,
//     //             username: userData.username || 'Player',
//     //             email: userData.email || '',
//     //             rating: userData.pr?.pvp?.[difficulty] ?? 1000,
//     //             diff: difficulty,
//     //             timer: timer,
//     //             symbol: symbol || ['sum', 'difference', 'product', 'quotient'],
//     //         });

//     //         // ✅ Start scale animation
//     //         Animated.spring(scaleAnim, {
//     //             toValue: 0.95,
//     //             tension: 150,
//     //             friction: 4,
//     //             useNativeDriver: true,
//     //         }).start();
//     //     } catch (error) {
//     //         console.error('❌ Error starting search:', error);
//     //         Alert.alert('Error', 'Failed to start matchmaking');
//     //         setIsSearching(false);
//     //     }
//     // };

//     /* ================= CANCEL SEARCH HANDLER ================= */
//     const handleCancelSearch = () => {
//         console.log('❌ Cancelling search');

//         // ✅ Reset state
//         setIsSearching(false);
//         setMatchFound(false);
//         setOpponentData(null);
//         pendingGameStartData.current = null;
//         readyToNavigateRef.current = false;

//         // ✅ Emit cancel to server
//         if (socketRef.current?.connected) {
//             socketRef.current.emit('cancel_search');
//         }

//         // ✅ Reset scale animation
//         Animated.spring(scaleAnim, {
//             toValue: 1,
//             tension: 150,
//             friction: 4,
//             useNativeDriver: true,
//         }).start();
//     };

//     return (
//         <LinearGradient
//             colors={theme.backgroundGradient || ['#0B1220', '#0B1220']}
//             style={styles.container}>
//             <View style={styles.header}>
//                 <Text style={[styles.headerTitle, { color: theme.text || '#ffffff' }]}>
//                     Game Lobby
//                 </Text>
//                 <TouchableOpacity onPress={() => navigation.goBack()}>
//                     <X color={theme.text || '#ffffff'} size={24} />
//                 </TouchableOpacity>
//             </View>

//             <Animated.View
//                 style={[styles.content, { transform: [{ scale: scaleAnim }] }]}>
//                 <View
//                     style={[
//                         styles.playerCard,
//                         {
//                             backgroundColor:
//                                 theme.cardBackground || 'rgba(255, 255, 255, 0.1)',
//                             borderColor: theme.borderColor || 'rgba(255, 255, 255, 0.2)',
//                         },
//                     ]}>
//                     <View style={styles.ratingSection}>
//                         <Star color="#ffd700" size={20} />
//                         <Text style={[styles.ratingText, { color: theme.text || '#ffffff' }]}>
//                             Rating: {player?.pr?.pvp?.[difficulty] || 1000}
//                         </Text>
//                     </View>
//                     <Text
//                         style={[
//                             styles.playerName,
//                             { color: theme.secondaryText || '#90caf9' },
//                         ]}>
//                         {player?.username || 'Player'}
//                     </Text>
//                 </View>

//                 <View
//                     style={[
//                         styles.matchCard,
//                         {
//                             backgroundColor:
//                                 theme.cardBackground || 'rgba(255, 255, 255, 0.05)',
//                             borderColor: theme.borderColor || 'rgba(255, 255, 255, 0.1)',
//                         },
//                     ]}>
//                     {!isSearching ? (
//                         <View style={styles.readyState}>
//                             <View
//                                 style={[
//                                     styles.iconContainer,
//                                     { backgroundColor: theme.iconBg || 'rgba(144, 202, 249, 0.1)' },
//                                 ]}>
//                                 <Search color={theme.secondaryText || '#90caf9'} size={48} />
//                             </View>
//                             <Text
//                                 style={[styles.statusTitle, { color: theme.text || '#ffffff' }]}>
//                                 Ready to Find Match
//                             </Text>
//                             <Text
//                                 style={[
//                                     styles.statusSubtitle,
//                                     { color: theme.secondaryText || '#90caf9' },
//                                 ]}>
//                                 You'll be matched with players of similar rating
//                             </Text>

//                             <TouchableOpacity
//                                 style={[
//                                     styles.searchButton,
//                                     { backgroundColor: theme.primary || '#FB923C' },
//                                 ]}
//                                 onPress={handleStartSearch}>
//                                 <Text
//                                     style={[
//                                         styles.searchButtonText,
//                                         { color: theme.buttonText || '#ffffff' },
//                                     ]}>
//                                     Find Match
//                                 </Text>
//                             </TouchableOpacity>
//                         </View>
//                     ) : (
//                         <View style={styles.searchingState}>
//                             <Animated.View
//                                 style={[
//                                     styles.searchIconContainer,
//                                     !matchFound && {
//                                         transform: [{ scale: pulseAnim }],
//                                     },
//                                     { backgroundColor: theme.iconBg || 'rgba(144, 202, 249, 0.1)' },
//                                 ]}>
//                                 {matchFound && opponentData ? (
//                                     <Animated.Image
//                                         source={{
//                                             uri: DUMMY_AVATARS[0],
//                                         }}
//                                         style={[
//                                             styles.avatarImage,
//                                             { opacity: 1, borderColor: theme.success || '#4ade80' },
//                                         ]}
//                                     />
//                                 ) : (
//                                     <Animated.Image
//                                         key={dummyIdx}
//                                         source={{ uri: DUMMY_AVATARS[dummyIdx] }}
//                                         style={styles.avatarImage}
//                                     />
//                                 )}
//                             </Animated.View>

//                             <Text
//                                 style={[
//                                     styles.searchingTitle,
//                                     { color: theme.text || '#ffffff' },
//                                 ]}>
//                                 {matchFound ? 'Opponent Found!' : 'Finding opponent...'}
//                             </Text>
//                             <Text
//                                 style={[
//                                     styles.searchingSubtitle,
//                                     { color: theme.secondaryText || '#90caf9' },
//                                 ]}>
//                                 {matchFound
//                                     ? `Playing against ${opponentData?.username || 'Opponent'}`
//                                     : `Looking for players with rating ${(player?.pr?.pvp?.[difficulty] || 1000) - 100
//                                     } - ${(player?.pr?.pvp?.[difficulty] || 1000) + 100}`}
//                             </Text>

//                             {matchFound && (
//                                 <Text
//                                     style={{
//                                         color: theme.success || '#4ade80',
//                                         fontSize: 16,
//                                         fontWeight: 'bold',
//                                         marginTop: 10,
//                                     }}>
//                                     Ready to Battle...
//                                 </Text>
//                             )}

//                             {!matchFound && (
//                                 <TouchableOpacity
//                                     style={[
//                                         styles.cancelButton,
//                                         {
//                                             borderColor: theme.warning || '#ff9800',
//                                             backgroundColor: (theme.warning || '#ff9800') + '33',
//                                         },
//                                     ]}
//                                     onPress={handleCancelSearch}>
//                                     <Text
//                                         style={[
//                                             styles.cancelButtonText,
//                                             { color: theme.warning || '#ff9800' },
//                                         ]}>
//                                         Cancel Search
//                                     </Text>
//                                 </TouchableOpacity>
//                             )}
//                         </View>
//                     )}
//                 </View>
//             </Animated.View>
//         </LinearGradient>
//     );
// }

// const styles = StyleSheet.create({
//     container: { flex: 1 },
//     header: {
//         flexDirection: 'row',
//         justifyContent: 'space-between',
//         alignItems: 'center',
//         paddingTop: 50,
//         paddingHorizontal: 20,
//         paddingBottom: 20,
//     },
//     headerTitle: {
//         fontSize: 24,
//         fontWeight: 'bold',
//         color: '#ffffff',
//     },
//     content: {
//         flex: 1,
//         paddingHorizontal: 20,
//     },
//     playerCard: {
//         backgroundColor: 'rgba(255, 255, 255, 0.1)',
//         borderRadius: 16,
//         padding: 20,
//         marginBottom: 20,
//         borderWidth: 1,
//         borderColor: 'rgba(255, 255, 255, 0.2)',
//     },
//     ratingSection: {
//         flexDirection: 'row',
//         alignItems: 'center',
//         marginBottom: 8,
//     },
//     ratingText: {
//         color: '#ffffff',
//         fontSize: 16,
//         fontWeight: '600',
//         marginLeft: 8,
//     },
//     playerName: {
//         color: '#90caf9',
//         fontSize: 14,
//         opacity: 0.8,
//     },
//     matchCard: {
//         backgroundColor: 'rgba(255, 255, 255, 0.05)',
//         borderRadius: 20,
//         padding: 30,
//         marginBottom: 20,
//         borderWidth: 1,
//         borderColor: 'rgba(255, 255, 255, 0.1)',
//         alignItems: 'center',
//     },
//     readyState: { alignItems: 'center' },
//     iconContainer: {
//         backgroundColor: 'rgba(144, 202, 249, 0.1)',
//         borderRadius: 40,
//         padding: 20,
//         marginBottom: 20,
//     },
//     statusTitle: {
//         fontSize: 24,
//         fontWeight: 'bold',
//         color: '#ffffff',
//         marginBottom: 8,
//         textAlign: 'center',
//     },
//     statusSubtitle: {
//         fontSize: 16,
//         color: '#90caf9',
//         textAlign: 'center',
//         marginBottom: 24,
//         opacity: 0.8,
//     },
//     searchButton: {
//         backgroundColor: '#FB923C',
//         paddingVertical: 16,
//         paddingHorizontal: 40,
//         borderRadius: 25,
//         shadowColor: '#000',
//         shadowOffset: { width: 0, height: 4 },
//         shadowOpacity: 0.3,
//         shadowRadius: 6,
//         elevation: 8,
//     },
//     searchButtonText: {
//         color: '#ffffff',
//         fontSize: 18,
//         fontWeight: 'bold',
//     },
//     searchingState: { alignItems: 'center' },
//     searchIconContainer: {
//         backgroundColor: 'rgba(144, 202, 249, 0.1)',
//         borderRadius: 40,
//         padding: 20,
//         marginBottom: 20,
//     },
//     searchingTitle: {
//         fontSize: 24,
//         fontWeight: 'bold',
//         color: '#ffffff',
//         marginBottom: 8,
//         textAlign: 'center',
//     },
//     searchingSubtitle: {
//         fontSize: 14,
//         color: '#90caf9',
//         textAlign: 'center',
//         marginBottom: 24,
//         opacity: 0.8,
//     },
//     cancelButton: {
//         backgroundColor: 'rgba(255, 152, 0, 0.2)',
//         paddingVertical: 12,
//         paddingHorizontal: 32,
//         borderRadius: 20,
//         borderWidth: 1,
//         borderColor: '#ff9800',
//     },
//     cancelButtonText: {
//         color: '#ff9800',
//         fontSize: 16,
//         fontWeight: '600',
//     },
//     avatarImage: {
//         width: 100,
//         height: 100,
//         borderRadius: 50,
//         borderWidth: 3,
//         borderColor: '#4ade80',
//         marginBottom: 20,
//     },
// });


import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Animated,
    Image,
    Alert,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Search, X, Users, Clock, Star } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSocket } from '../context/Socket';
import { useTheme } from '../context/ThemeContext';
import { useTranslation } from 'react-i18next';

export default function Lobby() {
    const socket = useSocket();
    const { theme } = useTheme();
    const route = useRoute();
    const { t } = useTranslation();
    const { difficulty, digit, symbol, timer, qm } = route.params;
    const navigation = useNavigation();

    /* ================= STATE ================= */
    const [isSearching, setIsSearching] = useState(false);
    const [player, setPlayer] = useState(null);
    const [matchFound, setMatchFound] = useState(false);
    const [opponentData, setOpponentData] = useState(null);
    const [dummyIdx, setDummyIdx] = useState(0);

    const DUMMY_AVATARS = [
        'https://img.freepik.com/free-psd/3d-illustration-human-avatar-profile_23-2150671142.jpg',
        'https://img.freepik.com/free-psd/3d-illustration-human-avatar-profile_23-2150671122.jpg',
        'https://img.freepik.com/free-psd/3d-illustration-person-with-sunglasses_23-2149436188.jpg',
    ];

    /* ================= REFS ================= */
    const pulseAnim = useRef(new Animated.Value(1)).current;
    const rotateAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(1)).current;

    const readyToNavigateRef = useRef(false);
    const pendingGameStartData = useRef(null);
    const hasNavigatedRef = useRef(false);
    const socketRef = useRef(null);
    const opponentRef = useRef(null);
    const myMongoIdRef = useRef(null);

    /* ================= EFFECT 1: Load User Data ================= */
    useEffect(() => {
        const getUserData = async () => {
            try {
                const userData = await AsyncStorage.getItem('userData');
                if (userData) {
                    const user = JSON.parse(userData);
                    console.log('✅ User Info:', user);
                    setPlayer(user);

                    // ✅ CRITICAL: Set MongoDB ID immediately
                    const mongoId = user._id || user.id;
                    if (!mongoId) {
                        console.error('❌ No MongoDB ID found in user data!');
                        Alert.alert('Error', 'User ID not found. Please login again.');
                        navigation.goBack();
                        return;
                    }

                    myMongoIdRef.current = mongoId;
                    console.log('✅ MongoDB ID set:', mongoId);
                } else {
                    console.error('❌ No user data in AsyncStorage');
                    Alert.alert('Error', 'Please login first');
                    navigation.goBack();
                }
            } catch (error) {
                console.error('❌ Error loading user data:', error);
                Alert.alert('Error', 'Failed to load user data');
            }
        };
        getUserData();
    }, []);

    /* ================= EFFECT 2: Dummy Avatar Animation ================= */
    useEffect(() => {
        let dummyInterval;
        let pulseAnimation;
        let rotateAnimation;

        if (isSearching && !matchFound) {
            // Cycle dummy avatars
            dummyInterval = setInterval(() => {
                setDummyIdx(prev => (prev + 1) % DUMMY_AVATARS.length);
            }, 600);

            // Pulse animation
            pulseAnimation = Animated.loop(
                Animated.sequence([
                    Animated.timing(pulseAnim, {
                        toValue: 1.1,
                        duration: 800,
                        useNativeDriver: true,
                    }),
                    Animated.timing(pulseAnim, {
                        toValue: 1,
                        duration: 800,
                        useNativeDriver: true,
                    }),
                ]),
            );

            // Rotate animation
            rotateAnimation = Animated.loop(
                Animated.timing(rotateAnim, {
                    toValue: 1,
                    duration: 2000,
                    useNativeDriver: true,
                }),
            );

            pulseAnimation.start();
            rotateAnimation.start();
        }

        // Cleanup function
        return () => {
            if (dummyInterval) clearInterval(dummyInterval);
            if (pulseAnimation) pulseAnimation.stop();
            if (rotateAnimation) rotateAnimation.stop();
            pulseAnim.setValue(1);
            rotateAnim.setValue(0);
        };
    }, [isSearching, matchFound, pulseAnim, rotateAnim]);

    /* ================= EFFECT 3: Cleanup on Unmount ================= */
    useEffect(() => {
        return () => {
            // ✅ CRITICAL: Cancel search when leaving lobby
            if (isSearching && socketRef.current?.connected) {
                console.log('🧹 Lobby unmount - cancelling search');
                socketRef.current.emit('cancel_search');
            }

            // ✅ Reset all refs
            readyToNavigateRef.current = false;
            hasNavigatedRef.current = false;
            pendingGameStartData.current = null;
            opponentRef.current = null;
        };
    }, [isSearching]);

    /* ================= EFFECT 4: Socket Listeners ================= */
    useEffect(() => {
        if (!socket) {
            console.warn('⚠️ Socket not available');
            return;
        }

        socketRef.current = socket;
        console.log('🔌 Setting up socket listeners...');

        // Connection handlers
        const handleConnect = () => {
            console.log('🟢 Connected to socket server');
            console.log('🆔 Socket ID:', socket.id);
        };

        const handleDisconnect = reason => {
            console.log('🔴 Disconnected from socket:', reason);
            if (isSearching) {
                setIsSearching(false);
                setMatchFound(false);
                Alert.alert('Disconnected', 'Connection lost. Please try again.');
            }
        };

        // Lobby joined handler
        const handleLobbyJoined = data => {
            console.log('📥 lobby-joined:', data);

            if (data.success && data.player?.id) {
                console.log('✅ My MongoDB ID confirmed:', data.player.id);
                myMongoIdRef.current = data.player.id;
            } else {
                console.error('❌ Invalid lobby-joined response:', data);
            }
        };

        // Match found handler
        const handleMatchFound = ({
            gameRoom,
            opponent,
            myPlayerId,
            initialQuestionMeter,
        }) => {
            console.log('✅ MATCH FOUND!');
            console.log('📊 Match Data:', {
                opponent: opponent?.username,
                myPlayerId,
                initialQuestionMeter,
            });

            // ✅ Validate opponent data
            if (!opponent?.id || !opponent?.username) {
                console.error('❌ Invalid opponent data:', opponent);
                Alert.alert('Error', 'Invalid match data received');
                setIsSearching(false);
                return;
            }

            // ✅ Store complete opponent data with MongoDB ID
            const opponentInfo = {
                id: opponent.id,
                username: opponent.username,
                rating: opponent.rating || 1000,
            };

            myMongoIdRef.current = myPlayerId;
            opponentRef.current = opponentInfo;

            setOpponentData(opponentInfo);
            setMatchFound(true);
            hasNavigatedRef.current = false;

            // ✅ Wait 2 seconds for animation before allowing navigation
            setTimeout(() => {
                readyToNavigateRef.current = true;

                // If game-started already received, navigate now
                if (pendingGameStartData.current) {
                    console.log('🚀 Navigating to Game (Delayed trigger)');
                    navigateToGame(pendingGameStartData.current);
                }
            }, 2000);
        };

        // Game started handler
        const handleGameStarted = data => {
            console.log('🚀 GAME STARTED received:', data);

            // ✅ Validate data
            if (!data.currentQuestion) {
                console.error('❌ No current question in game-started:', data);
                Alert.alert('Error', 'Invalid game data received');
                setIsSearching(false);
                setMatchFound(false);
                return;
            }

            if (readyToNavigateRef.current) {
                // Ready to navigate immediately
                navigateToGame(data);
            } else {
                // Wait for match-found animation to finish
                console.log('⏳ Waiting for Match Found animation...');
                pendingGameStartData.current = data;
            }
        };

        // Error handler
        const handleError = error => {
            console.error('❌ Socket error:', error);
            Alert.alert('Error', error.message || 'An error occurred');
            setIsSearching(false);
            setMatchFound(false);
        };

        // Register listeners
        socket.on('connect', handleConnect);
        socket.on('disconnect', handleDisconnect);
        socket.on('lobby-joined', handleLobbyJoined);
        socket.on('match-found', handleMatchFound);
        socket.on('game-started', handleGameStarted);
        socket.on('error', handleError);

        // Cleanup function
        return () => {
            console.log('🧹 Removing socket listeners');
            socket.off('connect', handleConnect);
            socket.off('disconnect', handleDisconnect);
            socket.off('lobby-joined', handleLobbyJoined);
            socket.off('match-found', handleMatchFound);
            socket.off('game-started', handleGameStarted);
            socket.off('error', handleError);
        };
    }, [socket, isSearching]);

    /* ================= NAVIGATION HELPER ================= */
    const navigateToGame = ({ gameState, currentQuestion, myPlayerId }) => {
        // ✅ Prevent duplicate navigation
        if (hasNavigatedRef.current) {
            console.log('🛑 Already navigated to game, skipping duplicate.');
            return;
        }

        // ✅ Validate required data
        if (!currentQuestion) {
            console.error('❌ Cannot navigate: No current question');
            Alert.alert('Error', 'Game data is missing');
            setIsSearching(false);
            setMatchFound(false);
            return;
        }

        const finalMongoId = myPlayerId || myMongoIdRef.current;
        const finalOpponent = opponentRef.current;

        if (!finalMongoId) {
            console.error('❌ Cannot navigate: No MongoDB ID');
            Alert.alert('Error', 'Player ID is missing');
            setIsSearching(false);
            setMatchFound(false);
            return;
        }

        if (!finalOpponent?.id) {
            console.error('❌ Cannot navigate: No opponent data');
            Alert.alert('Error', 'Opponent data is missing');
            setIsSearching(false);
            setMatchFound(false);
            return;
        }

        hasNavigatedRef.current = true;

        console.log('🎮 Navigating to game with:');
        console.log('  - My MongoDB ID:', finalMongoId);
        console.log('  - Opponent:', finalOpponent);
        console.log('  - Question:', currentQuestion);

        // ✅ Navigate to game
        navigation.navigate('MultiPlayerGame', {
            currentQuestion,
            timer,
            opponent: finalOpponent,
            myMongoId: finalMongoId,
            difficulty,
        });

        // ✅ Reset state after navigation
        setTimeout(() => {
            setIsSearching(false);
            setMatchFound(false);
            setOpponentData(null);
            pendingGameStartData.current = null;
            readyToNavigateRef.current = false;
            hasNavigatedRef.current = false;
        }, 500);
    };

    /* ================= START SEARCH HANDLER ================= */
    const handleStartSearch = () => {
        if (!socketRef.current?.connected) {
            Alert.alert('Error', 'Socket not connected');
            return;
        }

        // reset state
        setIsSearching(true);
        setMatchFound(false);
        setOpponentData(null);
        pendingGameStartData.current = null;
        readyToNavigateRef.current = false;
        hasNavigatedRef.current = false;

        // ✅ BUILD LOBBY PAYLOAD FROM USER SELECTION
        const lobbyData = {
            diff: difficulty, // selected difficulty
            timer: timer, // selected timer
            symbol: symbol, // selected symbols
            rating: player?.pr?.pvp?.[difficulty] || 1000, // rating per difficulty
            qm: qm, // optional (question mode)
        };

        console.log('🚪 Joining lobby with data:', lobbyData);

        // ✅ SEND DATA TO SERVER
        socketRef.current.emit('join-lobby', lobbyData);

        Animated.spring(scaleAnim, {
            toValue: 0.95,
            tension: 150,
            friction: 4,
            useNativeDriver: true,
        }).start();
    };



    /* ================= CANCEL SEARCH HANDLER ================= */
    const handleCancelSearch = () => {
        console.log('❌ Cancelling search');

        // ✅ Reset state
        setIsSearching(false);
        setMatchFound(false);
        setOpponentData(null);
        pendingGameStartData.current = null;
        readyToNavigateRef.current = false;

        // ✅ Emit cancel to server
        if (socketRef.current?.connected) {
            socketRef.current.emit('cancel_search');
        }

        // ✅ Reset scale animation
        Animated.spring(scaleAnim, {
            toValue: 1,
            tension: 150,
            friction: 4,
            useNativeDriver: true,
        }).start();
    };

    return (
        <LinearGradient
            colors={theme.backgroundGradient || ['#0B1220', '#0B1220']}
            style={styles.container}>
            <View style={styles.header}>
                <Text style={[styles.headerTitle, { color: theme.text || '#ffffff' }]}>
                    {t('multiplayer.gameLobby')}
                </Text>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <X color={theme.text || '#ffffff'} size={24} />
                </TouchableOpacity>
            </View>

            <Animated.View
                style={[styles.content, { transform: [{ scale: scaleAnim }] }]}>
                <View
                    style={[
                        styles.playerCard,
                        {
                            backgroundColor:
                                theme.cardBackground || 'rgba(255, 255, 255, 0.1)',
                            borderColor: theme.borderColor || 'rgba(255, 255, 255, 0.2)',
                        },
                    ]}>
                    <View style={styles.ratingSection}>
                        <Star color="#ffd700" size={20} />
                        <Text style={[styles.ratingText, { color: theme.text || '#ffffff' }]}>
                            {t('multiplayer.rating')}: {player?.pr?.pvp?.[difficulty] || 1000}
                        </Text>
                    </View>
                    <Text
                        style={[
                            styles.playerName,
                            { color: theme.secondaryText || '#90caf9' },
                        ]}>
                        {player?.username || 'Player'}
                    </Text>
                </View>

                <View
                    style={[
                        styles.matchCard,
                        {
                            backgroundColor:
                                theme.cardBackground || 'rgba(255, 255, 255, 0.05)',
                            borderColor: theme.borderColor || 'rgba(255, 255, 255, 0.1)',
                        },
                    ]}>
                    {!isSearching ? (
                        <View style={styles.readyState}>
                            <View
                                style={[
                                    styles.iconContainer,
                                    { backgroundColor: theme.iconBg || 'rgba(144, 202, 249, 0.1)' },
                                ]}>
                                <Search color={theme.secondaryText || '#90caf9'} size={48} />
                            </View>
                            <Text
                                style={[styles.statusTitle, { color: theme.text || '#ffffff' }]}>
                                {t('multiplayer.readyToFindMatch')}
                            </Text>
                            <Text
                                style={[
                                    styles.statusSubtitle,
                                    { color: theme.secondaryText || '#90caf9' },
                                ]}>
                                {t('multiplayer.findMatchDescription')}
                            </Text>
                            <TouchableOpacity
                                style={[
                                    styles.searchButton,
                                    { backgroundColor: theme.primary || '#FB923C' },
                                ]}
                                onPress={handleStartSearch}>
                                <Text
                                    style={[
                                        styles.searchButtonText,
                                        { color: theme.buttonText || '#ffffff' },
                                    ]}>
                                    {t('multiplayer.findMatch')}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <View style={styles.searchingState}>
                            <Animated.View
                                style={[
                                    styles.searchIconContainer,
                                    !matchFound && {
                                        transform: [{ scale: pulseAnim }],
                                    },
                                    { backgroundColor: theme.iconBg || 'rgba(144, 202, 249, 0.1)' },
                                ]}>
                                {matchFound && opponentData ? (
                                    <Animated.Image
                                        source={{
                                            uri: DUMMY_AVATARS[0],
                                        }}
                                        style={[
                                            styles.avatarImage,
                                            { opacity: 1, borderColor: theme.success || '#4ade80' },
                                        ]}
                                    />
                                ) : (
                                    <Animated.Image
                                        key={dummyIdx}
                                        source={{ uri: DUMMY_AVATARS[dummyIdx] }}
                                        style={styles.avatarImage}
                                    />
                                )}
                            </Animated.View>

                            <Text
                                style={[
                                    styles.searchingTitle,
                                    { color: theme.text || '#ffffff' },
                                ]}>
                                {matchFound ? t('multiplayer.opponentFound') : t('multiplayer.findingOpponent')}
                            </Text>
                            <Text
                                style={[
                                    styles.searchingSubtitle,
                                    { color: theme.secondaryText || '#90caf9' },
                                ]}>
                                {matchFound
                                    ? `${t('multiplayer.playingAgainst')} ${opponentData?.username || t('multiplayer.opponent')}`
                                    : `${t('multiplayer.lookingForPlayers')} ${(player?.pr?.pvp?.[difficulty] || 1000) - 100
                                    } - ${(player?.pr?.pvp?.[difficulty] || 1000) + 100}`}
                            </Text>

                            {matchFound && (
                                <Text
                                    style={{
                                        color: theme.success || '#4ade80',
                                        fontSize: 16,
                                        fontWeight: 'bold',
                                        marginTop: 10,
                                    }}>
                                    {t('multiplayer.readyToBattle')}
                                </Text>
                            )}

                            {!matchFound && (
                                <TouchableOpacity
                                    style={[
                                        styles.cancelButton,
                                        {
                                            borderColor: theme.warning || '#ff9800',
                                            backgroundColor: (theme.warning || '#ff9800') + '33',
                                        },
                                    ]}
                                    onPress={handleCancelSearch}>
                                    <Text
                                        style={[
                                            styles.cancelButtonText,
                                            { color: theme.warning || '#ff9800' },
                                        ]}>
                                        {t('multiplayer.cancelSearch')}
                                    </Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    )}
                </View>
            </Animated.View>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 50,
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#ffffff',
    },
    content: {
        flex: 1,
        paddingHorizontal: 20,
    },
    playerCard: {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 16,
        padding: 20,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.2)',
    },
    ratingSection: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    ratingText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: '600',
        marginLeft: 8,
    },
    playerName: {
        color: '#90caf9',
        fontSize: 14,
        opacity: 0.8,
    },
    matchCard: {
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: 20,
        padding: 30,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
        alignItems: 'center',
    },
    readyState: { alignItems: 'center' },
    iconContainer: {
        backgroundColor: 'rgba(144, 202, 249, 0.1)',
        borderRadius: 40,
        padding: 20,
        marginBottom: 20,
    },
    statusTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#ffffff',
        marginBottom: 8,
        textAlign: 'center',
    },
    statusSubtitle: {
        fontSize: 16,
        color: '#90caf9',
        textAlign: 'center',
        marginBottom: 24,
        opacity: 0.8,
    },
    searchButton: {
        backgroundColor: '#FB923C',
        paddingVertical: 16,
        paddingHorizontal: 40,
        borderRadius: 25,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
        elevation: 8,
    },
    searchButtonText: {
        color: '#ffffff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    searchingState: { alignItems: 'center' },
    searchIconContainer: {
        backgroundColor: 'rgba(144, 202, 249, 0.1)',
        borderRadius: 40,
        padding: 20,
        marginBottom: 20,
    },
    searchingTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#ffffff',
        marginBottom: 8,
        textAlign: 'center',
    },
    searchingSubtitle: {
        fontSize: 14,
        color: '#90caf9',
        textAlign: 'center',
        marginBottom: 24,
        opacity: 0.8,
    },
    cancelButton: {
        backgroundColor: 'rgba(255, 152, 0, 0.2)',
        paddingVertical: 12,
        paddingHorizontal: 32,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#ff9800',
    },
    cancelButtonText: {
        color: '#ff9800',
        fontSize: 16,
        fontWeight: '600',
    },
    avatarImage: {
        width: 100,
        height: 100,
        borderRadius: 50,
        borderWidth: 3,
        borderColor: '#4ade80',
        marginBottom: 20,
    },
});
