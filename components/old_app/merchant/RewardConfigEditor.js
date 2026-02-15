import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
} from 'react-native';
import {
    ArrowLeft,
    Tag,
    FileText,
    Save,
    Package,
    Gift,
    Award,
    ToggleRight,
    ToggleLeft,
} from 'lucide-react-native';
import Card from '../common/Card';
import Button from '../common/Button';
import Input from '../common/Input';

const RewardConfigEditor = ({ reward, onSave, onBack }) => {
    const [formData, setFormData] = useState({
        active: true, // Default to true if not present
        ...reward
    });

    const iconMap = {
        Package: Package,
        Gift: Gift,
        Award: Award,
    };

    const RewardIcon = reward.icon || Gift;

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            <View style={styles.header}>
                <TouchableOpacity onPress={onBack} style={styles.backButton}>
                    <ArrowLeft size={20} color="#0f172a" />
                </TouchableOpacity>
                <Text style={styles.title}>Configure Reward</Text>
            </View>

            <Card style={styles.card}>
                <View style={styles.cardHeader}>
                    <View style={styles.programInfo}>
                        <View style={[styles.iconContainer, { backgroundColor: formData.active ? '#f1f5f9' : '#f8fafc' }]}>
                            <RewardIcon size={28} color={formData.active ? "#4f46e5" : "#94a3b8"} />
                        </View>
                        <View>
                            <Text style={styles.programName}>{formData.title}</Text>
                            <Text style={[styles.programStatus, !formData.active && styles.programStatusInactive]}>
                                {formData.active
                                    ? (formData.stock === '∞' ? 'Active • Unlimited Stock' : `Active • ${formData.stock} in stock`)
                                    : 'Disabled'
                                }
                            </Text>
                        </View>
                    </View>
                    <TouchableOpacity
                        onPress={() => setFormData({ ...formData, active: !formData.active })}>
                        {formData.active ? (
                            <ToggleRight size={40} color="#10b981" />
                        ) : (
                            <ToggleLeft size={40} color="#94a3b8" />
                        )}
                    </TouchableOpacity>
                </View>

                <View style={styles.form}>
                    <View style={styles.typeSelector}>
                        <TouchableOpacity
                            style={[styles.typeButton, formData.type !== 'bundle' && styles.typeButtonActive]}
                            onPress={() => setFormData({ ...formData, type: 'single' })}>
                            <Text style={[styles.typeText, formData.type !== 'bundle' && styles.typeTextActive]}>Single Reward</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.typeButton, formData.type === 'bundle' && styles.typeButtonActive]}
                            onPress={() => setFormData({ ...formData, type: 'bundle' })}>
                            <Text style={[styles.typeText, formData.type === 'bundle' && styles.typeTextActive]}>Pre-paid Bundle</Text>
                        </TouchableOpacity>
                    </View>

                    <Input
                        label="Reward Name"
                        icon={Gift}
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e })}
                    />

                    <View style={styles.row}>
                        <View style={{ flex: 1 }}>
                            <Input
                                label={formData.type === 'bundle' ? "Bundle Price (Pts/Cash)" : "Point Cost"}
                                icon={Tag}
                                value={String(formData.points)}
                                keyboardType="numeric"
                                onChange={(e) => setFormData({ ...formData, points: e })}
                            />
                        </View>
                        {formData.type === 'bundle' && (
                            <View style={{ flex: 1 }}>
                                <Input
                                    label="Items in Bundle"
                                    icon={Package}
                                    value={String(formData.bundleCount || 10)}
                                    keyboardType="numeric"
                                    onChange={(e) => setFormData({ ...formData, bundleCount: e })}
                                />
                            </View>
                        )}
                    </View>

                    <Input
                        label="Stock Quantity"
                        icon={Package}
                        value={String(formData.stock)}
                        placeholder="Enter number or '∞'"
                        onChange={(e) => setFormData({ ...formData, stock: e })}
                    />
                    <Input
                        label="Description"
                        icon={FileText}
                        value={formData.description || ''}
                        placeholder="Optional description"
                        onChange={(e) => setFormData({ ...formData, description: e })}
                    />
                </View>
            </Card>

            <View style={styles.actions}>
                <Button variant="outline" onPress={onBack} style={styles.cancelButton}>
                    Cancel
                </Button>
                <Button
                    variant="merchant"
                    onPress={() => onSave(formData)}
                    style={styles.saveButton}>
                    <Save size={18} color="#ffffff" />
                    <Text style={styles.saveButtonText}>Save Changes</Text>
                </Button>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingBottom: 20,
        marginHorizontal: -12,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 16,
        marginTop: 0,
        paddingHorizontal: 12,
    },
    backButton: {
        padding: 8,
        borderRadius: 999,
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: 20,
        fontWeight: '900',
        color: '#0f172a',
    },
    card: {
        marginBottom: 24,
        padding: 12,
        marginHorizontal: 12,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    programInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    iconContainer: {
        padding: 12,
        borderRadius: 16,
    },
    programName: {
        fontSize: 18,
        fontWeight: '900',
        color: '#0f172a',
        lineHeight: 24,
    },
    programStatus: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#64748b',
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginTop: 4,
    },
    programStatusInactive: {
        color: '#94a3b8',
    },
    form: {
        gap: 8,
    },
    row: {
        flexDirection: 'row',
        gap: 12,
    },
    typeSelector: {
        flexDirection: 'row',
        backgroundColor: '#f1f5f9',
        borderRadius: 12,
        padding: 4,
        gap: 4,
        marginBottom: 8,
    },
    typeButton: {
        flex: 1,
        paddingVertical: 8,
        alignItems: 'center',
        borderRadius: 10,
    },
    typeButtonActive: {
        backgroundColor: '#ffffff',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    typeText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#64748b',
    },
    typeTextActive: {
        color: '#0f172a',
    },
    actions: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 8,
        marginBottom: 32,
        paddingHorizontal: 12,
    },
    cancelButton: {
        flex: 1,
    },
    saveButton: {
        flex: 2,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    saveButtonText: {
        color: '#ffffff',
        fontSize: 14,
        fontWeight: 'bold',
    },
});

export default RewardConfigEditor;
