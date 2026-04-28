import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator,
    Alert,
    Modal,
    TextInput,
    Image,
    Dimensions
} from 'react-native';
import { Plus, Trash2, Edit2, ChevronRight, Utensils, DollarSign, Image as ImageIcon, X } from 'lucide-react-native';
import ScreenWrapper from '../../components/old_app/common/ScreenWrapper';
import Card from '../../components/old_app/common/Card';
import Button from '../../components/old_app/common/Button';
import { useAuth } from '../../contexts/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');
const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api';

const MerchantMenu = () => {
    const { merchantProfile } = useAuth();
    const merchantId = merchantProfile?.id;

    const [stores, setStores] = useState([]);
    const [selectedStore, setSelectedStore] = useState(null);
    const [menus, setMenus] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    
    // Form state
    const [menuName, setMenuName] = useState('');
    const [items, setItems] = useState([{ id: Date.now(), name: '', description: '', price: '', imageUrl: '' }]);

    const fetchStores = useCallback(async () => {
        if (!merchantId) return;
        try {
            const token = await AsyncStorage.getItem('@dandan_auth_token');
            const res = await fetch(`${API_URL}/stores/merchant/${merchantId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (res.ok) {
                setStores(data);
                if (data.length > 0) {
                    setSelectedStore(data[0]);
                }
            }
        } catch (error) {
            console.error('Error fetching stores:', error);
        } finally {
            setLoading(false);
        }
    }, [merchantId]);

    const fetchMenus = useCallback(async (storeId) => {
        try {
            const token = await AsyncStorage.getItem('@dandan_auth_token');
            const res = await fetch(`${API_URL}/stores/${storeId}/menus`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (res.ok) {
                setMenus(data);
            }
        } catch (error) {
            console.error('Error fetching menus:', error);
        }
    }, []);

    useEffect(() => {
        fetchStores();
    }, [fetchStores]);

    useEffect(() => {
        if (selectedStore) {
            fetchMenus(selectedStore.id);
        }
    }, [selectedStore, fetchMenus]);

    const handleAddItem = () => {
        setItems([...items, { id: Date.now(), name: '', description: '', price: '', imageUrl: '' }]);
    };

    const handleRemoveItem = (id) => {
        setItems(items.filter(item => item.id !== id));
    };

    const handleUpdateItem = (id, field, value) => {
        setItems(items.map(item => item.id === id ? { ...item, [field]: value } : item));
    };

    const handleSaveMenu = async () => {
        if (!menuName.trim()) {
            Alert.alert('Error', 'Please enter a menu name');
            return;
        }

        if (items.some(item => !item.name.trim() || !item.price)) {
            Alert.alert('Error', 'Please fill in name and price for all items');
            return;
        }

        try {
            const token = await AsyncStorage.getItem('@dandan_auth_token');
            const res = await fetch(`${API_URL}/stores/${selectedStore.id}/menus`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    name: menuName,
                    items: items.map(item => ({
                        name: item.name,
                        description: item.description,
                        price: parseFloat(item.price),
                        imageUrl: item.imageUrl
                    }))
                })
            });

            if (res.ok) {
                Alert.alert('Success', 'Menu created successfully');
                setModalVisible(false);
                setMenuName('');
                setItems([{ id: Date.now(), name: '', description: '', price: '', imageUrl: '' }]);
                fetchMenus(selectedStore.id);
            } else {
                const data = await res.json();
                Alert.alert('Error', data.error || 'Failed to create menu');
            }
        } catch (error) {
            Alert.alert('Error', 'An error occurred while saving the menu');
        }
    };

    if (loading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color="#10b981" />
            </View>
        );
    }

    return (
        <ScreenWrapper scroll contentContainerStyle={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Menu Management</Text>
                <Text style={styles.subtitle}>Create and manage your store menus</Text>
            </View>

            {stores.length > 0 ? (
                <View style={styles.storeSelector}>
                    <Text style={styles.label}>Select Store</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.storeList}>
                        {stores.map(store => (
                            <TouchableOpacity
                                key={store.id}
                                style={[styles.storeChip, selectedStore?.id === store.id && styles.storeChipActive]}
                                onPress={() => setSelectedStore(store)}
                            >
                                <Text style={[styles.storeChipText, selectedStore?.id === store.id && styles.storeChipTextActive]}>
                                    {store.name}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>
            ) : (
                <View style={styles.emptyState}>
                    <Utensils size={48} color="#cbd5e1" />
                    <Text style={styles.emptyStateText}>No stores found. Create a store first.</Text>
                </View>
            )}

            {selectedStore && (
                <>
                    <View style={styles.menuHeader}>
                        <Text style={styles.sectionTitle}>Active Menus</Text>
                        <Button
                            onPress={() => setModalVisible(true)}
                            style={styles.addButton}
                            size="small"
                        >
                            <Plus size={18} color="#fff" />
                            <Text style={styles.addButtonText}>New Menu</Text>
                        </Button>
                    </View>

                    {menus.length > 0 ? (
                        menus.map(menu => (
                            <Card key={menu.id} style={styles.menuCard}>
                                <View style={styles.menuCardHeader}>
                                    <View>
                                        <Text style={styles.menuName}>{menu.name}</Text>
                                        <Text style={styles.itemCount}>{menu.items?.length || 0} items</Text>
                                    </View>
                                    <TouchableOpacity>
                                        <ChevronRight size={20} color="#94a3b8" />
                                    </TouchableOpacity>
                                </View>
                                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.itemList}>
                                    {menu.items?.map(item => (
                                        <View key={item.id} style={styles.itemThumb}>
                                            {item.imageUrl ? (
                                                <Image source={{ uri: item.imageUrl }} style={styles.itemImage} />
                                            ) : (
                                                <View style={styles.itemImagePlaceholder}>
                                                    <Utensils size={20} color="#94a3b8" />
                                                </View>
                                            )}
                                            <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
                                            <Text style={styles.itemPrice}>${item.price}</Text>
                                        </View>
                                    ))}
                                </ScrollView>
                            </Card>
                        ))
                    ) : (
                        <View style={styles.noMenus}>
                            <Text style={styles.noMenusText}>No menus created for this store yet.</Text>
                        </View>
                    )}
                </>
            )}

            <Modal
                visible={modalVisible}
                animationType="slide"
                transparent={true}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Create New Menu</Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <X size={24} color="#64748b" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.modalScroll}>
                            <View style={styles.formGroup}>
                                <Text style={styles.label}>Menu Name</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="e.g. Breakfast Menu"
                                    value={menuName}
                                    onChangeText={setMenuName}
                                />
                            </View>

                            <View style={styles.itemsSection}>
                                <View style={styles.itemsHeader}>
                                    <Text style={styles.label}>Menu Items</Text>
                                    <TouchableOpacity onPress={handleAddItem}>
                                        <Text style={styles.addText}>+ Add Item</Text>
                                    </TouchableOpacity>
                                </View>

                                {items.map((item, index) => (
                                    <View key={item.id} style={styles.itemForm}>
                                        <View style={styles.itemFormHeader}>
                                            <Text style={styles.itemIndex}>Item #{index + 1}</Text>
                                            {items.length > 1 && (
                                                <TouchableOpacity onPress={() => handleRemoveItem(item.id)}>
                                                    <Trash2 size={18} color="#ef4444" />
                                                </TouchableOpacity>
                                            )}
                                        </View>
                                        <TextInput
                                            style={styles.input}
                                            placeholder="Item Name"
                                            value={item.name}
                                            onChangeText={(v) => handleUpdateItem(item.id, 'name', v)}
                                        />
                                        <TextInput
                                            style={[styles.input, styles.textArea]}
                                            placeholder="Description"
                                            value={item.description}
                                            onChangeText={(v) => handleUpdateItem(item.id, 'description', v)}
                                            multiline
                                        />
                                        <View style={styles.row}>
                                            <View style={[styles.inputContainer, { flex: 1 }]}>
                                                <DollarSign size={16} color="#94a3b8" style={styles.inputIcon} />
                                                <TextInput
                                                    style={[styles.input, { paddingLeft: 35 }]}
                                                    placeholder="Price"
                                                    value={item.price}
                                                    onChangeText={(v) => handleUpdateItem(item.id, 'price', v)}
                                                    keyboardType="numeric"
                                                />
                                            </View>
                                            <View style={[styles.inputContainer, { flex: 2, marginLeft: 10 }]}>
                                                <ImageIcon size={16} color="#94a3b8" style={styles.inputIcon} />
                                                <TextInput
                                                    style={[styles.input, { paddingLeft: 35 }]}
                                                    placeholder="Image URL"
                                                    value={item.imageUrl}
                                                    onChangeText={(v) => handleUpdateItem(item.id, 'imageUrl', v)}
                                                />
                                            </View>
                                        </View>
                                    </View>
                                ))}
                            </View>
                        </ScrollView>

                        <View style={styles.modalFooter}>
                            <Button
                                variant="outline"
                                onPress={() => setModalVisible(false)}
                                style={{ flex: 1, marginRight: 10 }}
                            >
                                <Text>Cancel</Text>
                            </Button>
                            <Button
                                onPress={handleSaveMenu}
                                style={{ flex: 2 }}
                            >
                                <Text style={{ color: '#fff', fontWeight: 'bold' }}>Save Menu</Text>
                            </Button>
                        </View>
                    </View>
                </View>
            </Modal>
        </ScreenWrapper>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 20,
        backgroundColor: '#f8fafc',
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        marginBottom: 24,
    },
    title: {
        fontSize: 28,
        fontWeight: '900',
        color: '#0f172a',
    },
    subtitle: {
        fontSize: 14,
        color: '#64748b',
        marginTop: 4,
    },
    storeSelector: {
        marginBottom: 24,
    },
    label: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#94a3b8',
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 12,
    },
    storeList: {
        gap: 10,
    },
    storeChip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    storeChipActive: {
        backgroundColor: '#10b981',
        borderColor: '#10b981',
    },
    storeChipText: {
        fontSize: 14,
        color: '#64748b',
        fontWeight: '600',
    },
    storeChipTextActive: {
        color: '#fff',
    },
    menuHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: '#0f172a',
    },
    addButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#10b981',
        gap: 6,
    },
    addButtonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    menuCard: {
        marginBottom: 16,
        padding: 16,
    },
    menuCardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    menuName: {
        fontSize: 16,
        fontWeight: '700',
        color: '#0f172a',
    },
    itemCount: {
        fontSize: 12,
        color: '#94a3b8',
    },
    itemList: {
        flexDirection: 'row',
    },
    itemThumb: {
        width: 100,
        marginRight: 12,
    },
    itemImage: {
        width: 100,
        height: 100,
        borderRadius: 12,
        backgroundColor: '#f1f5f9',
    },
    itemImagePlaceholder: {
        width: 100,
        height: 100,
        borderRadius: 12,
        backgroundColor: '#f1f5f9',
        justifyContent: 'center',
        alignItems: 'center',
    },
    itemName: {
        fontSize: 13,
        fontWeight: '600',
        color: '#334155',
        marginTop: 8,
    },
    itemPrice: {
        fontSize: 12,
        fontWeight: '700',
        color: '#10b981',
    },
    noMenus: {
        padding: 40,
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 16,
        borderStyle: 'dashed',
        borderWidth: 1,
        borderColor: '#cbd5e1',
    },
    noMenusText: {
        color: '#94a3b8',
        fontSize: 14,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        height: '90%',
        padding: 20,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '900',
        color: '#0f172a',
    },
    modalScroll: {
        flex: 1,
    },
    formGroup: {
        marginBottom: 20,
    },
    input: {
        backgroundColor: '#f8fafc',
        borderWidth: 1,
        borderColor: '#e2e8f0',
        borderRadius: 12,
        padding: 12,
        fontSize: 15,
        color: '#0f172a',
    },
    textArea: {
        height: 80,
        textAlignVertical: 'top',
        marginTop: 10,
    },
    itemsSection: {
        marginTop: 10,
    },
    itemsHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
    },
    addText: {
        color: '#10b981',
        fontWeight: 'bold',
        fontSize: 14,
    },
    itemForm: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#e2e8f0',
        borderRadius: 16,
        padding: 15,
        marginBottom: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    itemFormHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    itemIndex: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#6366f1',
    },
    row: {
        flexDirection: 'row',
        marginTop: 10,
    },
    inputContainer: {
        position: 'relative',
    },
    inputIcon: {
        position: 'absolute',
        left: 12,
        top: 14,
        zIndex: 1,
    },
    modalFooter: {
        flexDirection: 'row',
        paddingTop: 20,
        borderTopWidth: 1,
        borderTopColor: '#e2e8f0',
    },
    emptyState: {
        padding: 40,
        alignItems: 'center',
        gap: 12,
    },
    emptyStateText: {
        color: '#94a3b8',
        fontSize: 14,
        textAlign: 'center',
    }
});

export default MerchantMenu;
