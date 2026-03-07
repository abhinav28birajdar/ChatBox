import React, { useState } from 'react';
import { View, TextInput, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

interface InputProps {
    label?: string;
    placeholder?: string;
    value: string;
    onChangeText: (text: string) => void;
    secureTextEntry?: boolean;
    error?: string;
    icon?: string;
    leftIcon?: string;
    iconFamily?: 'Ionicons' | 'MaterialCommunityIcons';
    containerStyle?: any;
    keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
    autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
    multiline?: boolean;
    numberOfLines?: number;
}

export const Input: React.FC<InputProps> = ({
    label,
    placeholder,
    value,
    onChangeText,
    secureTextEntry = false,
    error,
    icon,
    leftIcon,
    iconFamily,
    containerStyle,
    keyboardType = 'default',
    autoCapitalize = 'none',
    multiline = false,
    numberOfLines
}) => {
    const { colors, isDark } = useTheme();
    const [isFocused, setIsFocused] = useState(false);
    const [isPasswordVisible, setIsPasswordVisible] = useState(!secureTextEntry);

    const togglePasswordVisibility = () => {
        setIsPasswordVisible(!isPasswordVisible);
    };

    const renderIcon = () => {
        const iconName = leftIcon || icon;
        if (!iconName) return null;

        // Auto-detect family if not specified
        const family = iconFamily || (
            iconName.includes('-outline') || iconName.includes('account') || iconName.includes('email') || iconName.includes('lock')
                ? 'MaterialCommunityIcons'
                : 'Ionicons'
        );

        if (family === 'MaterialCommunityIcons') {
            return (
                <MaterialCommunityIcons
                    name={iconName as any}
                    size={22}
                    color={isFocused ? colors.primary : colors.textMuted}
                    style={styles.icon}
                />
            );
        }

        return (
            <Ionicons
                name={iconName as any}
                size={20}
                color={isFocused ? colors.primary : colors.textMuted}
                style={styles.icon}
            />
        );
    };

    return (
        <View style={[styles.container, containerStyle]}>
            {label && <Text style={[styles.label, { color: colors.textSecondary }]}>{label}</Text>}
            <View style={[
                styles.inputWrapper,
                {
                    backgroundColor: isDark ? colors.surface : colors.background,
                    borderColor: error ? colors.error : (isFocused ? colors.primary : colors.border),
                    borderWidth: isFocused || error ? 1.5 : 1,
                    minHeight: multiline ? 100 : 56,
                    paddingVertical: multiline ? 12 : 0,
                    alignItems: multiline ? 'flex-start' : 'center',
                }
            ]}>
                {renderIcon()}
                <TextInput
                    style={[styles.input, { color: colors.text }]}
                    placeholder={placeholder}
                    placeholderTextColor={colors.textMuted}
                    value={value}
                    onChangeText={onChangeText}
                    secureTextEntry={secureTextEntry && !isPasswordVisible}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    keyboardType={keyboardType}
                    autoCapitalize={autoCapitalize}
                    multiline={multiline}
                    numberOfLines={numberOfLines}
                />
                {secureTextEntry && (
                    <TouchableOpacity onPress={togglePasswordVisibility} style={styles.eyeIcon}>
                        <Ionicons
                            name={isPasswordVisible ? 'eye-off' : 'eye'}
                            size={20}
                            color={colors.textMuted}
                        />
                    </TouchableOpacity>
                )}
            </View>
            {error && <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
        marginBottom: 16,
    },
    label: {
        fontSize: 14,
        fontWeight: '500',
        marginBottom: 8,
        marginLeft: 4,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 12,
        paddingHorizontal: 12,
        height: 56,
    },
    icon: {
        marginRight: 10,
    },
    input: {
        flex: 1,
        fontSize: 16,
        height: '100%',
    },
    eyeIcon: {
        padding: 8,
    },
    errorText: {
        fontSize: 12,
        marginTop: 4,
        marginLeft: 4,
    },
});
