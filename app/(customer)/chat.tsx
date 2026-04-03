import { useNavigation } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ScreenWrapper from '../../components/old_app/common/ScreenWrapper';
import { IconSymbol } from '../../components/ui/icon-symbol';

const SUGGESTIONS = [
    "where can i get best cake?",
    "Which shop has the best ice kacang or chendol add-on?",
    "Find $5 lunch deals + a drink near my MRT?"
];

export default function ChatPage() {
    const navigation = useNavigation();
    const insets = useSafeAreaInsets();
    const [isNavVisible, setIsNavVisible] = useState(true);
    const [messages, setMessages] = useState<{ id: string; text: string; isUser: boolean }[]>([
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
            setMessages((prev) => [
                ...prev,
                { id: Date.now().toString(), text: "I'm looking into that for you...", isUser: false }
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
                    style={{ flex: 1 }}
                    contentContainerStyle={styles.messageList}
                >
                    {messages.map((item) => (
                        <View key={item.id} style={[styles.messageBubble, item.isUser ? styles.userBubble : styles.aiBubble]}>
                            <Text style={[styles.messageText, item.isUser ? styles.userText : styles.aiText]}>{item.text}</Text>
                        </View>
                    ))}
                </ScrollView>

                <View style={styles.inputSection}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.suggestionsScroll} contentContainerStyle={styles.suggestionsContainer}>
                        {SUGGESTIONS.map((suggestion, index) => (
                            <TouchableOpacity
                                key={index}
                                style={styles.suggestionPill}
                                onPress={() => sendMessage(suggestion)}
                            >
                                <Text style={styles.suggestionText}>{suggestion}</Text>
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
        marginBottom: 12,
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
