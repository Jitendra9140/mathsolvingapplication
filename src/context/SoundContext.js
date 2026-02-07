import { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { muteBackgroundMusic, unmuteBackgroundMusic } from '../utils/playBackgroundMusic';

export const SoundContext = createContext();

export const SoundProvider = ({ children }) => {
    const [isSoundOn, setIsSoundOn] = useState(true);

    // Load saved setting on mount
    useEffect(() => {
        const loadSoundSetting = async () => {
            try {
                const savedSound = await AsyncStorage.getItem('isSoundOn');
                if (savedSound !== null) {
                    setIsSoundOn(JSON.parse(savedSound));
                }
            } catch (e) {
                console.log("Failed to load sound settings", e);
            }
        };
        loadSoundSetting();
    }, []);

    // Save setting and apply mute/unmute
    useEffect(() => {
        AsyncStorage.setItem('isSoundOn', JSON.stringify(isSoundOn));
        if (isSoundOn) {
            unmuteBackgroundMusic();
        } else {
            muteBackgroundMusic();
        }
    }, [isSoundOn]);

    const toggleSound = () => setIsSoundOn(prev => !prev);

    return (
        <SoundContext.Provider value={{ isSoundOn, toggleSound, setIsSoundOn }}>
            {children}
        </SoundContext.Provider>
    );
};

export const useSound = () => useContext(SoundContext);
