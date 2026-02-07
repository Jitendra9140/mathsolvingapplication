import { useNavigation } from '@react-navigation/native';
import React from 'react';
import {
    StyleSheet,
    Text,
    View,
    ImageBackground,
    Dimensions,
    TouchableOpacity,
    Image,
    PixelRatio,
    BackHandler,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTranslation } from 'react-i18next';
const { width, height } = Dimensions.get('window');
const scaleFont = (size) => size * PixelRatio.getFontScale();

const QuitScreen = () => {
    const navigation = useNavigation();
    const { t } = useTranslation();
    return (
        <ImageBackground
            source={require('../assets/backGroundImage.png')}
            style={styles.background}
            resizeMode="cover"
        >
            <View style={styles.modalBox}>
                <Text style={styles.title}>{t('dialogs.quitTitle')}</Text>
                <Text style={styles.subtitle}>{t('dialogs.quitSubtitle', { score: '0.0' })}</Text>
                <View style={styles.button}>
                    <TouchableOpacity
                        onPress={() => BackHandler.exitApp()}
                    >
                        <LinearGradient
                            colors={['#F89B29', '#FF0F7B']}
                            // start={{ x: 1, y: 0 }}
                            // end={{ x: 0, y: 0 }}
                            style={styles.gradientBtn}
                        >
                            <Text style={styles.buttonText}>{t('dialogs.yes')}</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => {
                        navigation.navigate("Home")
                    }}>
                        <LinearGradient
                            colors={['#F89B29', '#FF0F7B']}
                            // start={{ x: 1, y: 0 }}
                            // end={{ x: 0, y: 0 }}
                            style={styles.gradientBtn1}
                        >
                            <Image
                                source={require('../assets/crossIcon.png')}
                            />

                        </LinearGradient>
                    </TouchableOpacity>
                </View>
            </View>
        </ImageBackground>
    );
};

export default QuitScreen;

const styles = StyleSheet.create({
    background: {
        flex: 1,
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: "#0F172A"
    },
    modalBox: {
        width: '80%',
        backgroundColor: '#1E293B',
        padding: 20,
        borderRadius: 12,
        // borderColor: '#3C9DFB',
        borderWidth: 1,
        alignItems: 'center',
        elevation: 5,
    },
    title: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 10,
    },
    subtitle: {
        color: '#D0D0D0',
        fontSize: 14,
        marginBottom: 20,
        textAlign: 'center',
    },
    button: {
        width: '80%',
        flexDirection: "row"
    },
    gradientBtn: {
        // flexDirection: 'row',
        // justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 8,
        borderRadius: 5,
        width: 150
    },
    gradientBtn1: {
        // flexDirection: 'row',
        // justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 8,
        borderRadius: 5,
        width: 50,
        marginStart: 10
    },
    buttonText: {
        color: '#fff',
        fontWeight: 'bold',
        marginRight: 10,
    },
    icon: {
        width: 20,
        height: 20,
    },
});

