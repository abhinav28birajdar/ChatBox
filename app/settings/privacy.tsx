import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Switch, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/hooks/useTheme';
import { Text } from '@/components/ui/Text';
import { Ionicons } from '@expo/vector-icons';
import { ScreenWrapper } from '@/components/layout/ScreenWrapper';

export default function PrivacySettings() {
    const { colors } = useTheme();
    const router = useRouter();

    const [switches, setSwitches] = useState({
        profile: true,
        activity: true,
        dms: false,
        analytics: true
    });

    const toggleSwitch = (key: keyof typeof switches) => {
        setSwitches(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const PrivacyOption = ({ title, desc, value, onToggle }: any) => (
        <View style={styles.option}>
            <View style={{ flex: 1, marginRight: 16 }}>
                <Text variant="subtitle2">{title}</Text>
                <Text variant="caption" color={colors.textSecondary} style={{ marginTop: 4 }}>{desc}</Text>
            </View>
            <Switch
                value={value}
                onValueChange={onToggle}
                trackColor={{ false: '#333', true: colors.primary }}
                thumbColor={value ? '#FFF' : '#AAA'}
            />
        </View>
    );

    return (
        <ScreenWrapper style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="chevron-back" size={28} color={colors.text} />
                </TouchableOpacity>
                <Text variant="h3" style={{ marginLeft: 16 }}>Privacy</Text>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
                <Text variant="caption" color={colors.textSecondary} style={styles.sectionTitle}>VISIBILITY</Text>
                <View style={[styles.card, { backgroundColor: colors.surface }]}>
                    <PrivacyOption
                        title="Public Profile"
                        desc="Allow others to see your profile details and servers."
                        value={switches.profile}
                        onToggle={() => toggleSwitch('profile')}
                    />
                    <PrivacyOption
                        title="Online Status"
                        desc="Show when you are active on the platform."
                        value={switches.activity}
                        onToggle={() => toggleSwitch('activity')}
                    />
                </View>

                <Text variant="caption" color={colors.textSecondary} style={[styles.sectionTitle, { marginTop: 32 }]}>MESSAGING</Text>
                <View style={[styles.card, { backgroundColor: colors.surface }]}>
                    <PrivacyOption
                        title="Strict DMs"
                        desc="Only receive messages from friends."
                        value={switches.dms}
                        onToggle={() => toggleSwitch('dms')}
                    />
                </View>

                <Text variant="caption" color={colors.textSecondary} style={[styles.sectionTitle, { marginTop: 32 }]}>DATA</Text>
                <View style={[styles.card, { backgroundColor: colors.surface }]}>
                    <PrivacyOption
                        title="Usage Analytics"
                        desc="Help us improve ChatBox by sharing anonymous data."
                        value={switches.analytics}
                        onToggle={() => toggleSwitch('analytics')}
                    />
                </View>

                <TouchableOpacity style={styles.exportBtn}>
                    <Text variant="button" color={colors.primary}>Request My Data</Text>
                </TouchableOpacity>
            </ScrollView>
        </ScreenWrapper>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
    },
    content: {
        padding: 20,
    },
    sectionTitle: {
        fontWeight: '800',
        marginBottom: 8,
        marginLeft: 4,
    },
    card: {
        borderRadius: 16,
        overflow: 'hidden',
    },
    option: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.05)',
    },
    exportBtn: {
        marginTop: 40,
        alignItems: 'center',
    }
});
