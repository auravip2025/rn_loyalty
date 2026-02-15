import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { X, Send, MessageCircle } from 'lucide-react-native';

const HelpChat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    { 
      id: 1, 
      text: "Hi! I'm Dan, your AI support agent. How can I assist you with your rewards today?", 
      sender: 'agent' 
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const scrollViewRef = useRef(null);

  useEffect(() => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollToEnd({ animated: true });
    }
  }, [messages, isTyping]);

  const handleSend = () => {
    if (!input.trim()) return;
    
    const userMsg = { 
      id: Date.now(), 
      text: input, 
      sender: 'user' 
    };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    setTimeout(() => {
      let responseText = "I can help with that. Could you provide more details?";
      const lowerInput = userMsg.text.toLowerCase();
      
      if (lowerInput.includes('point') || lowerInput.includes('balance')) {
        responseText = "I see you're asking about points. You currently have 12,450 dandan points. You're 75% of the way to Platinum status!";
      } else if (lowerInput.includes('redeem') || lowerInput.includes('reward')) {
        responseText = "You can redeem rewards in the 'Catalog' or 'Rewards' tab. We have some great offers on coffee right now.";
      } else if (lowerInput.includes('scan') || lowerInput.includes('pay')) {
        responseText = "To pay or earn points, just tap the QR code icon in the bottom center of your screen.";
      } else if (lowerInput.includes('hello') || lowerInput.includes('hi')) {
        responseText = "Hello! Ready to earn some rewards?";
      }

      setMessages(prev => [...prev, { 
        id: Date.now() + 1, 
        text: responseText, 
        sender: 'agent' 
      }]);
      setIsTyping(false);
    }, 1500);
  };

  return (
    <>
      {isOpen && (
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.chatWindow}
        >
          <View style={styles.chatContainer}>
            <View style={styles.header}>
              <View style={styles.headerLeft}>
                <View style={styles.statusDot} />
                <Text style={styles.headerTitle}>Dan (AI Support)</Text>
              </View>
              <TouchableOpacity onPress={() => setIsOpen(false)} style={styles.closeButton}>
                <X size={16} color="#ffffff" />
              </TouchableOpacity>
            </View>
            
            <ScrollView 
              ref={scrollViewRef}
              style={styles.messagesContainer}
              contentContainerStyle={styles.messagesContent}
            >
              {messages.map(m => (
                <View 
                  key={m.id} 
                  style={[
                    styles.messageWrapper,
                    m.sender === 'user' ? styles.userWrapper : styles.agentWrapper
                  ]}
                >
                  <View 
                    style={[
                      styles.messageBubble,
                      m.sender === 'user' ? styles.userBubble : styles.agentBubble
                    ]}
                  >
                    <Text style={[
                      styles.messageText,
                      m.sender === 'user' && styles.userText
                    ]}>
                      {m.text}
                    </Text>
                  </View>
                </View>
              ))}
              
              {isTyping && (
                <View style={[styles.messageWrapper, styles.agentWrapper]}>
                  <View style={[styles.messageBubble, styles.typingBubble]}>
                    <View style={styles.typingIndicator}>
                      <View style={[styles.typingDot, styles.typingDot1]} />
                      <View style={[styles.typingDot, styles.typingDot2]} />
                      <View style={[styles.typingDot, styles.typingDot3]} />
                    </View>
                  </View>
                </View>
              )}
            </ScrollView>

            <View style={styles.inputContainer}>
              <TextInput 
                style={styles.input}
                placeholder="Type a message..."
                placeholderTextColor="#94a3b8"
                value={input}
                onChangeText={setInput}
                onSubmitEditing={handleSend}
              />
              <TouchableOpacity 
                onPress={handleSend}
                style={styles.sendButton}
              >
                <Send size={16} color="#ffffff" />
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      )}

      <TouchableOpacity 
        onPress={() => setIsOpen(!isOpen)}
        style={styles.chatButton}
      >
        {isOpen ? (
          <X size={20} color="#ffffff" />
        ) : (
          <>
            <MessageCircle size={20} color="#ffffff" />
            <View style={styles.notificationDot} />
          </>
        )}
      </TouchableOpacity>
    </>
  );
};

const styles = StyleSheet.create({
  chatWindow: {
    position: 'absolute',
    bottom: 96,
    right: 16,
    left: 16,
    height: 384,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 32,
    elevation: 16,
    zIndex: 70,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  chatContainer: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
  },
  header: {
    backgroundColor: '#4f46e5',
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    backgroundColor: '#10b981',
    borderRadius: 4,
  },
  headerTitle: {
    fontWeight: 'bold',
    fontSize: 14,
    color: '#ffffff',
  },
  closeButton: {
    padding: 4,
    borderRadius: 4,
  },
  messagesContainer: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  messagesContent: {
    padding: 16,
  },
  messageWrapper: {
    marginBottom: 12,
    flexDirection: 'row',
  },
  userWrapper: {
    justifyContent: 'flex-end',
  },
  agentWrapper: {
    justifyContent: 'flex-start',
  },
  messageBubble: {
    maxWidth: '85%',
    padding: 12,
    borderRadius: 16,
  },
  userBubble: {
    backgroundColor: '#4f46e5',
    borderTopRightRadius: 4,
  },
  agentBubble: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#f1f5f9',
    borderTopLeftRadius: 4,
  },
  typingBubble: {
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  messageText: {
    fontSize: 12,
    lineHeight: 18,
  },
  userText: {
    color: '#ffffff',
  },
  typingIndicator: {
    flexDirection: 'row',
    gap: 4,
    alignItems: 'center',
  },
  typingDot: {
    width: 6,
    height: 6,
    backgroundColor: '#94a3b8',
    borderRadius: 3,
  },
  typingDot1: {
    opacity: 0.6,
  },
  typingDot2: {
    opacity: 0.8,
  },
  typingDot3: {
    opacity: 1,
  },
  inputContainer: {
    padding: 12,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    flexDirection: 'row',
    gap: 8,
  },
  input: {
    flex: 1,
    backgroundColor: '#f1f5f9',
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 12,
    color: '#0f172a',
  },
  sendButton: {
    padding: 10,
    backgroundColor: '#4f46e5',
    borderRadius: 999,
  },
  chatButton: {
    position: 'absolute',
    bottom: 112,
    right: 32,
    padding: 14,
    borderRadius: 999,
    backgroundColor: '#4f46e5',
    shadowColor: '#4f46e5',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  notificationDot: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 10,
    height: 10,
    backgroundColor: '#f43f5e',
    borderRadius: 5,
    borderWidth: 2,
    borderColor: '#ffffff',
  },
});

export default HelpChat;