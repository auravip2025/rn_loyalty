import { useNavigation } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Image, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { GET_CHAT_SUGGESTIONS, useQuery } from '../../api/client';
import ScreenWrapper from '../../components/old_app/common/ScreenWrapper';
import { IconSymbol } from '../../components/ui/icon-symbol';

export default function ChatPage() {
    const { data: suggestionsData } = useQuery(GET_CHAT_SUGGESTIONS);
    const suggestionsList = (suggestionsData as any)?.chatSuggestions || [];
    const navigation = useNavigation();
    const insets = useSafeAreaInsets();
    const scrollViewRef = useRef<ScrollView>(null);
    const [isNavVisible, setIsNavVisible] = useState(true);
    const [messages, setMessages] = useState<{ id: string; text: string; isUser: boolean; component?: React.ReactNode }[]>([
        { id: '1', text: 'Hello! I am your AI assistant. How can I help you today?', isUser: false }
    ]);
    const [inputText, setInputText] = useState('');

    useEffect(() => {
        navigation.setOptions({
            tabBarStyle: { display: isNavVisible ? 'flex' : 'none' },
        });
    }, [isNavVisible, navigation]);

    const sendMessage = (text: string) => {
        if (!text.trim()) return;

        // Add user message
        const newMessages = [...messages, { id: Date.now().toString(), text, isUser: true }];
        setMessages(newMessages);
        setInputText('');

        // Mock AI response
        setTimeout(() => {
            let aiText = "I'm looking into that for you...";
            let component: React.ReactNode = undefined;

            const matchedSuggestion = suggestionsList.find((s: any) => s.question === text);

            if (matchedSuggestion) {
                aiText = matchedSuggestion.responseText;

                if (matchedSuggestion.responseType === 'SHOP_LIST') {
                    component = (
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 8 }}>
                            {matchedSuggestion.shops?.map((shop: any, i: number) => (
                                <View key={i} style={styles.shopCard}>
                                    <Image source={{ uri: shop.img }} style={styles.shopImg} />
                                    <View style={styles.shopInfo}>
                                        <Text style={styles.shopName} numberOfLines={1}>{shop.name}</Text>
                                        <Text style={styles.shopDetails}>⭐ {shop.rating} • {shop.distance}</Text>
                                        <TouchableOpacity style={styles.actionBtn}>
                                            <Text style={styles.actionBtnText}>View Menu</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            ))}
                        </ScrollView>
                    );
                } else if (matchedSuggestion.responseType === 'FEATURED_SHOP') {
                    component = (
                        <View style={styles.featuredCard}>
                            <Image source={{ uri: matchedSuggestion.featured?.img }} style={styles.featuredImg} />
                            <View style={styles.featuredOverlay}>
                                <Text style={styles.featuredTitle}>{matchedSuggestion.featured?.title}</Text>
                                <Text style={styles.featuredSub}>{matchedSuggestion.featured?.sub}</Text>
                            </View>
                            <View style={styles.featuredActions}>
                                <TouchableOpacity style={styles.primaryBtn}><Text style={styles.primaryBtnText}>Get Directions</Text></TouchableOpacity>
                            </View>
                        </View>
                    );
                } else if (matchedSuggestion.responseType === 'DEAL_LIST') {
                    component = (
                        <View style={styles.dealList}>
                            {matchedSuggestion.deals?.map((deal: any, i: number) => (
                                <View key={i} style={styles.dealItem}>
                                    <View style={styles.dealIconCircle}>
                                        <IconSymbol name="tag.fill" size={16} color="#4f46e5" />
                                    </View>
                                    <View style={styles.dealTextCol}>
                                        <Text style={styles.dealTitle}>{deal.title}</Text>
                                        <Text style={styles.dealLoc}>{deal.loc}</Text>
                                    </View>
                                    <Text style={styles.dealPrice}>{deal.price}</Text>
                                </View>
                            ))}
                        </View>
                    );
                }
            }

            setMessages((prev) => [
                ...prev,
                { id: Date.now().toString(), text: aiText, isUser: false, component }
            ]);
        }, 1000);
    };

    return (
        <ScreenWrapper style={styles.container}>
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior="padding"
                keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 50}
            >
                <View style={styles.header}>
                    <Text style={styles.userName}>AI Assistant</Text>
                    <TouchableOpacity
                        style={styles.toggleNavBtn}
                        onPress={() => setIsNavVisible(!isNavVisible)}
                    >
                        <Text style={styles.toggleNavText}>{isNavVisible ? 'Hide Nav' : 'Show Nav'}</Text>
                    </TouchableOpacity>
                </View>

                <ScrollView
                    ref={scrollViewRef}
                    style={{ flex: 1 }}
                    contentContainerStyle={styles.messageList}
                    onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
                >
                    {messages.map((item) => (
                        <View key={item.id} style={{ alignItems: item.isUser ? 'flex-end' : 'flex-start', marginBottom: 16 }}>
                            <View style={[styles.messageBubble, item.isUser ? styles.userBubble : styles.aiBubble, { marginBottom: item.component ? 8 : 0 }]}>
                                <Text style={[styles.messageText, item.isUser ? styles.userText : styles.aiText]}>{item.text}</Text>
                            </View>
                            {item.component && (
                                <View style={styles.componentWrapper}>
                                    {item.component}
                                </View>
                            )}
                        </View>
                    ))}
                </ScrollView>

                <View style={styles.inputSection}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.suggestionsScroll} contentContainerStyle={styles.suggestionsContainer}>
                        {suggestionsList.map((suggestion: any) => (
                            <TouchableOpacity
                                key={suggestion.id}
                                style={styles.suggestionPill}
                                onPress={() => sendMessage(suggestion.question)}
                            >
                                <Text style={styles.suggestionText}>{suggestion.question}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>

                    <View style={styles.inputRow}>
                        <TextInput
                            style={styles.textInput}
                            placeholder="Ask me anything..."
                            value={inputText}
                            onChangeText={setInputText}
                            onSubmitEditing={() => sendMessage(inputText)}
                            returnKeyType="send"
                        />
                        <TouchableOpacity style={styles.sendButton} onPress={() => sendMessage(inputText)}>
                            <IconSymbol name="paperplane.fill" size={24} color="#fff" />
                        </TouchableOpacity>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </ScreenWrapper>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ffffff', // Make background color consistent with home
    },
    keyboardAvoidingView: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
        marginTop: 16,
    },
    userName: {
        fontSize: 30,
        fontWeight: '900',
        color: '#0f172a',
        letterSpacing: -0.5,
        lineHeight: 36,
    },
    toggleNavBtn: {
        backgroundColor: '#4f46e5',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    toggleNavText: {
        color: '#ffffff',
        fontWeight: 'bold',
        fontSize: 12,
    },
    messageList: {
        paddingBottom: 24,
    },
    messageBubble: {
        maxWidth: '80%',
        padding: 14,
        borderRadius: 20,
        marginBottom: 0,
    },
    userBubble: {
        alignSelf: 'flex-end',
        backgroundColor: '#4f46e5',
        borderBottomRightRadius: 4,
    },
    aiBubble: {
        alignSelf: 'flex-start',
        backgroundColor: '#f8fafc',
        borderWidth: 1,
        borderColor: '#e2e8f0',
        borderBottomLeftRadius: 4,
    },
    messageText: {
        fontSize: 15,
        lineHeight: 22,
    },
    userText: {
        color: '#ffffff',
    },
    aiText: {
        color: '#334155',
        fontWeight: '500',
    },
    componentWrapper: {
        width: '100%',
        paddingLeft: 4,
        paddingRight: 14,
    },
    shopCard: {
        width: 160,
        backgroundColor: '#fff',
        borderRadius: 16,
        marginRight: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 3,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#f1f5f9',
    },
    shopImg: {
        width: '100%',
        height: 100,
        backgroundColor: '#e2e8f0',
    },
    shopInfo: {
        padding: 12,
    },
    shopName: {
        fontSize: 14,
        fontWeight: '700',
        color: '#0f172a',
        marginBottom: 4,
    },
    shopDetails: {
        fontSize: 12,
        color: '#64748b',
        marginBottom: 10,
    },
    actionBtn: {
        backgroundColor: '#f1f5f9',
        paddingVertical: 6,
        borderRadius: 8,
        alignItems: 'center',
    },
    actionBtnText: {
        color: '#4f46e5',
        fontSize: 12,
        fontWeight: '600',
    },
    featuredCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 4,
        width: '90%',
        borderWidth: 1,
        borderColor: '#f1f5f9',
    },
    featuredImg: {
        width: '100%',
        height: 140,
        backgroundColor: '#e2e8f0',
    },
    featuredOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        padding: 16,
        backgroundColor: 'rgba(0,0,0,0.3)',
    },
    featuredTitle: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 18,
    },
    featuredSub: {
        color: '#e2e8f0',
        fontSize: 13,
        marginTop: 4,
    },
    featuredActions: {
        padding: 12,
        backgroundColor: '#fff',
    },
    primaryBtn: {
        backgroundColor: '#4f46e5',
        paddingVertical: 10,
        borderRadius: 10,
        alignItems: 'center',
    },
    primaryBtnText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 14,
    },
    dealList: {
        width: '90%',
        backgroundColor: '#ffffff',
        borderRadius: 16,
        padding: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
        borderWidth: 1,
        borderColor: '#f1f5f9',
    },
    dealItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
    },
    dealIconCircle: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#e0e7ff',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    dealTextCol: {
        flex: 1,
    },
    dealTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#0f172a',
    },
    dealLoc: {
        fontSize: 12,
        color: '#64748b',
        marginTop: 2,
    },
    dealPrice: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#10b981',
    },
    inputSection: {
        backgroundColor: '#ffffff',
        paddingTop: 16,
        // paddingBottom: 24,
    },
    suggestionsScroll: {
        marginBottom: 16,
        marginHorizontal: -24,
    },
    suggestionsContainer: {
        paddingHorizontal: 24,
    },
    suggestionPill: {
        backgroundColor: '#f1f5f9',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
        marginRight: 8,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        alignSelf: 'center',
    },
    suggestionText: {
        fontSize: 14,
        color: '#475569',
        fontWeight: '600',
    },
    inputRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    textInput: {
        flex: 1,
        backgroundColor: '#f8fafc',
        borderWidth: 1,
        borderColor: '#e2e8f0',
        borderRadius: 24,
        paddingHorizontal: 20,
        paddingVertical: 14,
        fontSize: 16,
        color: '#0f172a',
        marginRight: 10,
    },
    sendButton: {
        backgroundColor: '#4f46e5',
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#4f46e5',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
});
