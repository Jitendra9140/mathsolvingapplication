import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { normalizeFont } from '../utils/Responsive';

const AuthHeader = ({ title }) => {
    return <Text style={styles.title}>{title}</Text>;
};

const styles = StyleSheet.create({
    title: {
        fontSize: normalizeFont(32),
        fontWeight: '600',
        color: 'white',
        marginBottom: normalizeFont(70),
        textAlign: 'center',
    },
});

export default AuthHeader;
