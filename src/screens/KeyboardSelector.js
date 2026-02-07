import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, PixelRatio } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { KEYPAD_LAYOUTS } from '../utils/keyboardLayouts';
import LinearGradient from 'react-native-linear-gradient';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useTranslation } from 'react-i18next';

const { width } = Dimensions.get('window');
const scale = width / 375;
const normalize = size => Math.round(PixelRatio.roundToNearestPixel(size * scale));

const KeyboardPreview = ({ layout, theme, isSelected }) => {
  return (
    <View style={[styles.previewContainer, isSelected && styles.selectedPreview]}>
      {layout.map((row, rowIndex) => (
        <View key={rowIndex} style={styles.previewRow}>
          {row.map((item, index) => {
            const strItem = item.toString().toLowerCase();
            const isSpecial = ['clear', 'clr', '⌫', 'del', 'ref', 'pm', '.'].includes(strItem);
            const isSkip = strItem === 'skip';
            const isNa = strItem === 'na';

            if (isNa) return <View key={index} style={styles.previewKeyPlaceholder} />;

            let content = null;
            if (strItem === 'del' || strItem === '⌫') {
              content = <MaterialIcons name="backspace" size={12} color="#fff" />;
            } else if (strItem === 'ref') {
              content = <Text style={{ fontSize: 8, color: '#fff', fontWeight: 'bold' }}>Rev</Text>;
            } else if (strItem === 'pm') {
              content = <Text style={{ fontSize: 8, color: '#fff', fontWeight: 'bold' }}>+/-</Text>;
            } else if (strItem === 'clr' || strItem === 'clear') {
              content = <Text style={{ fontSize: 8, color: '#fff', fontWeight: 'bold' }}>CLR</Text>;
            } else if (strItem === 'skip') {
              content = <Text style={{ fontSize: 8, color: '#fff', fontWeight: 'bold' }}>SKIP</Text>;
            } else {
              content = <Text style={{ fontSize: 14, color: '#fff', fontWeight: 'bold' }}>{item}</Text>;
            }

            return (
              <LinearGradient
                key={index}
                colors={
                  (isSpecial || isSkip)
                    ? ['#334155', '#1E293B'] // Dark gray gradient for special keys
                    : ['#4F46E5', '#3730A3'] // Blue gradient (default) - will overlap with theme color below if needed
                }
                style={[
                  styles.previewKey,
                  {
                    // Override with Theme Primary if strictly needed, or stick to a nice generic premium look
                    // For correct preview, let's use the Theme Context color if available, else Gradient
                  }
                ]}
              >
                {/* Overlay Theme Color if needed, or just use the gradient above which looks premium */}
                <View style={[
                  styles.keyInner,
                  !(isSpecial || isSkip) && { backgroundColor: theme.primary, opacity: 0.8 }
                ]}>
                  {content}
                </View>
              </LinearGradient>
            );
          })}
        </View>
      ))}
    </View>
  );
};

const KeyboardSelector = () => {
  const { keyboardTheme, changeKeyboardTheme, theme } = useTheme();
  const { t } = useTranslation();

  const options = [
    { id: 'type1', label: t('keyboard.option1'), layout: KEYPAD_LAYOUTS.type1 },
    { id: 'type2', label: t('keyboard.option2'), layout: KEYPAD_LAYOUTS.type2 },
  ];

  return (
    <View style={styles.container}>
      {options.map(option => {
        const isSelected = keyboardTheme === option.id;
        return (
          <TouchableOpacity
            key={option.id}
            activeOpacity={0.8}
            style={[
              styles.optionCard,
              isSelected && { borderColor: theme.primary || '#595CFF', borderWidth: 2 }
            ]}
            onPress={() => changeKeyboardTheme(option.id)}>

            <View style={styles.headerRow}>
              <Text style={[styles.optionLabel, { color: isSelected ? (theme.primary || '#fff') : '#94A3B8' }]}>
                {option.label}
              </Text>
              {isSelected && (
                <MaterialIcons name="check-circle" size={24} color={theme.primary || '#595CFF'} />
              )}
            </View>

            <KeyboardPreview layout={option.layout} theme={theme} isSelected={isSelected} />

          </TouchableOpacity>
        );
      })}
    </View>
  );
};

export default KeyboardSelector;

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingHorizontal: 8, // Little bit of breathing room
    paddingTop: 10,
    paddingBottom: 50,
    flexDirection: 'row', // ✅ Side by side
    justifyContent: 'space-between',
    alignItems: 'flex-start'
  },
  optionCard: {
    width: '48%', // ✅ Half width
    backgroundColor: 'rgba(30, 41, 59, 0.6)',
    borderRadius: 20,
    padding: 10,
    marginBottom: 25,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    paddingHorizontal: 2
  },
  optionLabel: {
    fontSize: normalize(14),
    fontWeight: '700',
    letterSpacing: 0.5
  },
  previewContainer: {
    backgroundColor: '#0F172A',
    borderRadius: 12,
    padding: 6,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 3,
  },
  previewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  previewKey: {
    flex: 1,
    height: 30, // Smaller key height
    marginHorizontal: 2,
    borderRadius: 6,
    overflow: 'hidden',
  },
  keyInner: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%'
  },
  previewKeyPlaceholder: {
    flex: 1,
    height: 30,
  }
});

