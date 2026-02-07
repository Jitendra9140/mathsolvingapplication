// ThemeContext.js
import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ThemeContext = createContext();

export const themes = {
    dark: { name: 'Dark', backgroundGradient: ['#0B1220', '#0B1220'], text: '#FFFFFF', primary: '#FB923C', cardBackground: '#1E293B', buttonGradient: ['#595CFF', '#87AEE9'], subText: '#E6EEF8', secondaryColor: '#eb7d1cff' },
    // blue:{name:'Blue Nova',backgroundGradient:['#0A192F','#112D4E','#1B4F72'],text:'#E3F2FD',primary:'#00BFFF',cardBackground:'#1E293B',buttonGradient:['#0D47A1','#1976D2'],subText:'#D8ECFF'},
    // purple:{name:'Purple Galaxy',backgroundGradient:['#2E003E','#3D0075','#6A00B5'],text:'#FFFFFF',primary:'#a346b1ff',cardBackground:'#1F0A36',buttonGradient:['#3D0075','#6A00B5'],subText:'#EFD7FF'},
    royalChamp: { name: 'Royal Champ', backgroundGradient: ['#1A0033', '#3D005C', '#7000A0'], text: '#F4EFFF', primary: '#B600FF', cardBackground: '#160028', buttonGradient: ['#7C00D4', '#C200FF'], subText: '#F4E6FF', secondaryColor: '#0f750fff' },
    teal: { name: 'Teal Fusion', backgroundGradient: ['#012E40', '#026773', '#3CA6A6'], text: '#FFFFFF', primary: '#074963ff', cardBackground: '#0d4a56ff', buttonGradient: ['#026773', '#3CA6A6'], subText: '#D8F6F5', secondaryColor: '#595CFF' },
    // midnightMath:{name:'Midnight Math',backgroundGradient:['#0C0C21','#1A1A49','#2E2E75'],text:'#D9D9FF',primary:'#6677FF',cardBackground:'#111133',buttonGradient:['#4455FF','#8899FF'],subText:'#DCE2FF'},
    // sunriseSolve:{name:'Sunrise Solve',backgroundGradient:['#FF6000','#FF9A00','#FFD200'],text:'#2A1F00',primary:'#FFDA44',cardBackground:'#442E00',buttonGradient:['#FFC000','#FFE066'],subText:'#FFF3D1'},
    // cosmicNumbers:{name:'Cosmic Numbers',backgroundGradient:['#0B0026','#20004D','#400099'],text:'#EDEAFF',primary:'#AA66FF',cardBackground:'#1E001F',buttonGradient:['#9933FF','#CC99FF'],subText:'#F2E8FF'},
    // oceanSurge:{name:'Ocean Surge',backgroundGradient:['#001F3F','#004080','#0074CC'],text:'#E0F7FF',primary:'#00BFFF',cardBackground:'#002A4D',buttonGradient:['#0059B3','#3399FF'],subText:'#DFF6FF'},
    // glacierRush:{name:'Glacier Rush',backgroundGradient:['#003344','#006688','#0099CC'],text:'#E9FFFF',primary:'#33CCFF',cardBackground:'#002B38',buttonGradient:['#00B8E6','#66D9FF'],subText:'#DFF8FF'},
    forestQuest: { name: 'Forest Quest', backgroundGradient: ['#0B3D0B', '#145214', '#1F7A1F'], text: '#E8FFE8', primary: '#1C7A23', cardBackground: '#123312', buttonGradient: ['#1C6B1C', '#2FBF2F'], subText: '#E6F9E6', secondaryColor: '#eb7d1cff' },
    // goldRush:{name:'Gold Rush',backgroundGradient:['#4B3F00','#8C7600'],text:'#FFFFFF',primary:'#FFD700',cardBackground:'#3A2E00',buttonGradient:['#FFB700','#FFC845'],subText:'#FFF5D6'},
    desertLogic: { name: 'Desert Logic', backgroundGradient: ['#553300', '#A66A00', '#DCA000'], text: '#FFF0F6', primary: '#E6B44C', cardBackground: '#3F2700', buttonGradient: ['#D4A243', '#FFE1A0'], subText: '#FFF2D9', secondaryColor: '#e8f406ff' },
    blossomDream: { name: 'Blossom Dream', backgroundGradient: ['#4A0A2E', '#B3126E', '#FF66A6'], text: '#FFF0F6', primary: '#FF9ECB', cardBackground: '#2A001A', buttonGradient: ['#C2185B', '#FF80AB'], subText: '#FFE8F2', secondaryColor: '#f3f6cfff' },
    // crimsonVictory:{name:'Crimson Victory',backgroundGradient:['#3A0000','#7A0000','#B30000'],text:'#FDEDED',primary:'#FF4C4C',cardBackground:'#2A0000',buttonGradient:['#FF1A1A','#FF6666'],subText:'#FFE5E5'},
    lavaBlaze: { name: 'Lava Blaze', backgroundGradient: ['#330000', '#660000', '#FF4500'], text: '#FFEFE6', primary: '#FF7A00', cardBackground: '#1A0000', buttonGradient: ['#B30000', '#FF6600'], subText: '#FFEFE8', secondaryColor: '#595CFF' },
}
export const ThemeProvider = ({ children }) => {
    const [theme, setTheme] = useState(themes.dark);
    const [keyboardTheme, setKeyboardTheme] = useState('type1');

    useEffect(() => {
        (async () => {
            const savedTheme = await AsyncStorage.getItem('theme');
            if (savedTheme && themes[savedTheme]) {
                setTheme(themes[savedTheme]);
            }

            const savedKeyboard = await AsyncStorage.getItem('keyboardTheme');
            if (savedKeyboard) {
                setKeyboardTheme(savedKeyboard);
            }
        })();
    }, []);

    const changeTheme = async selected => {
        setTheme(themes[selected]);
        await AsyncStorage.setItem('theme', selected);
    };

    const changeKeyboardTheme = async selected => {
        setKeyboardTheme(selected);
        await AsyncStorage.setItem('keyboardTheme', selected);
    };

    return (
        <ThemeContext.Provider value={{ theme, changeTheme, keyboardTheme, changeKeyboardTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => useContext(ThemeContext);
