// src/SocketContext.js
import React, {
  createContext,
  useContext,
  useRef,
  useState,
  useEffect,
} from 'react';
import { AppState } from 'react-native';
import { io } from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Base backend URL for all socket connections
// const SOCKET_URL = 'http://43.204.167.118:3000/';
const SOCKET_URL = 'https://mataletics-backend.onrender.com/';
// const SOCKET_URL = 'http://43.204.167.118:3000/';

// How long we wait for an initial connection before forcing a retry
const CONNECTION_TIMEOUT = 15000;

// Infinite reconnection attempts – frontend should keep trying
const MAX_RECONNECTION_ATTEMPTS = Infinity;

const SocketContext = createContext(null);
const SocketStateContext = createContext(null);

export const Socket = ({ children }) => {
  // useRef so we only create one socket.io instance for the entire app
  const socketRef = useRef();
  const [connectionState, setConnectionState] = useState('connecting'); // 'connecting', 'connected', 'disconnected', 'error'
  const [registrationQueue, setRegistrationQueue] = useState([]);
  const reconnectionAttemptsRef = useRef(0);
  const connectionTimeoutRef = useRef(null);
  const hasRegisteredRef = useRef(false);
  const appStateRef = useRef(AppState.currentState);

  if (!socketRef.current) {
    // Create singleton socket instance with explicit reconnect behaviour
    socketRef.current = io(SOCKET_URL, {
      transports: ['websocket'],
      autoConnect: true, // we will manually control when to connect
      reconnection: true,
      reconnectionAttempts: MAX_RECONNECTION_ATTEMPTS,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: CONNECTION_TIMEOUT,
    });

    // Connect immediately on first creation so the player is registered asap
    socketRef.current.connect();

    // Auto-register the player every time the socket connects
    const autoRegisterPlayer = async () => {
      try {
        const userData = await AsyncStorage.getItem('userData');
        if (!userData) {
          console.warn(
            '⚠️ No user data in AsyncStorage, skipping auto-registration',
          );
          return;
        }

        const user = JSON.parse(userData);
        console.log('📤 Auto-registering player:', user.username);

        socketRef.current.emit('register-player', {
          userId: user._id,
          username: user.username,
          email: user.email,
          rating: user.pr?.pvp?.medium || user.pr?.pvp?.easy || 1000,
          diff: user.preferences?.defaultDifficulty || 'easy',
          timer: user.preferences?.defaultTimer || 60,
          symbol: user.preferences?.defaultSymbol || ['sum', 'difference'],
        });

        // Mark that we have successfully attempted registration at least once
        hasRegisteredRef.current = true;
        console.log('✅ Auto-registration emitted to server');
      } catch (err) {
        console.error('❌ Auto-registration failed:', err);
      }
    };

    // Core connection lifecycle handlers
    const handleConnect = () => {
      console.log('🟢 Socket connected successfully');
      clearTimeout(connectionTimeoutRef.current);
      reconnectionAttemptsRef.current = 0;
      setConnectionState('connected');

      // Always (re)register the player when we get a connection.
      // This makes sure that after any reconnect the backend knows
      // the current player is online and in the pool.
      autoRegisterPlayer();

      // ✅ Process any queued registration events
      if (registrationQueue.length > 0) {
        console.log(
          `📤 Processing ${registrationQueue.length} queued registration events`,
        );
        registrationQueue.forEach(({ event, data }) => {
          socketRef.current.emit(event, data);
        });
        setRegistrationQueue([]);
      }
    };

    const handleDisconnect = reason => {
      console.log('🔴 Socket disconnected:', reason);
      setConnectionState('disconnected');
    };

    const handleConnectError = error => {
      console.error('❌ Socket connection error:', error);
      setConnectionState('error');
    };

    const handleReconnectAttempt = () => {
      reconnectionAttemptsRef.current += 1;
      console.log(
        `🔄 Reconnection attempt ${reconnectionAttemptsRef.current}/${MAX_RECONNECTION_ATTEMPTS}`,
      );
    };

    const handleReconnectFailed = () => {
      console.error('❌ Reconnection failed after max attempts');
      setConnectionState('error');
    };

    // Connection timeout guard – if the initial attempt takes too long,
    // force a new connect call so we don't stay stuck forever.
    connectionTimeoutRef.current = setTimeout(() => {
      if (socketRef.current && !socketRef.current.connected) {
        console.warn('⚠️ Connection timeout - forcing reconnection');
        setConnectionState('error');
        socketRef.current.connect();
      }
    }, CONNECTION_TIMEOUT);

    socketRef.current.on('connect', handleConnect);
    socketRef.current.on('disconnect', handleDisconnect);
    socketRef.current.on('connect_error', handleConnectError);
    socketRef.current.on('reconnect_attempt', handleReconnectAttempt);
    socketRef.current.on('reconnect_failed', handleReconnectFailed);
  }

  useEffect(() => {
    // Listen to AppState so we can reconnect as soon as the app
    // returns to the foreground or the device is unlocked.
    const handleAppStateChange = nextState => {
      const prevState = appStateRef.current;
      appStateRef.current = nextState;

      const wentToForeground =
        prevState.match(/inactive|background/) && nextState === 'active';

      if (wentToForeground && socketRef.current) {
        // If the socket is not connected when app becomes active,
        // trigger a fast reconnect.
        if (!socketRef.current.connected) {
          console.log('📱 App active - ensuring socket connection');
          socketRef.current.connect();
        }
      }
    };

    const subscription = AppState.addEventListener(
      'change',
      handleAppStateChange,
    );

    // Cleanup listener when provider unmounts
    return () => {
      subscription.remove();
    };
  }, []);

  useEffect(() => {
    // Global cleanup on unmount to avoid memory leaks and zombie listeners.
    return () => {
      clearTimeout(connectionTimeoutRef.current);
      if (socketRef.current) {
        socketRef.current.removeAllListeners();
        socketRef.current.disconnect();
      }
    };
  }, []);

  return (
    <SocketContext.Provider value={socketRef.current}>
      <SocketStateContext.Provider
        value={{ connectionState, registrationQueue, setRegistrationQueue }}>
        {children}
      </SocketStateContext.Provider>
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const socket = useContext(SocketContext);
  if (!socket) {
    throw new Error('useSocket must be used within a <SocketProvider>');
  }
  return socket;
};

export const useSocketState = () => {
  const state = useContext(SocketStateContext);
  if (!state) {
    throw new Error('useSocketState must be used within a <Socket>');
  }
  return state;
};

// ✅ HELPER HOOK: Wait for socket connection before emitting
export const useWaitForSocketConnection = () => {
  const socket = useSocket();
  const { connectionState } = useSocketState();

  return {
    isConnected: connectionState === 'connected' && socket.connected,
    connectionState,
    // ✅ Safe emit with automatic queueing
    safeEmit: (event, data) => {
      if (socket.connected) {
        socket.emit(event, data);
        return true;
      } else {
        console.warn(`⚠️ Socket not connected, queueing event: ${event}`);
        return false;
      }
    },
    // ✅ Wait for connection promise
    waitForConnection: () => {
      return new Promise(resolve => {
        if (socket.connected) {
          resolve();
        } else {
          const checkConnection = () => {
            if (socket.connected) {
              socket.off('connect', checkConnection);
              resolve();
            }
          };
          socket.on('connect', checkConnection);
          // Timeout after 30 seconds
          setTimeout(() => {
            socket.off('connect', checkConnection);
            resolve();
          }, 30000);
        }
      });
    },
  };
};
