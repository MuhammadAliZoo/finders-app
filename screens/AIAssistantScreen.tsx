'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  Animated,
} from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { MainStackParamList } from '../navigation/types';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../api/auth';

type NavigationProp = NativeStackNavigationProp<MainStackParamList, 'AIAssistant'>;

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
}

export const AIAssistantScreen: React.FC = () => {
  const { colors } = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const [keyboardHeight] = useState(new Animated.Value(0));

  useEffect(() => {
    const keyboardWillShow = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      e => {
        Animated.timing(keyboardHeight, {
          duration: 250,
          toValue: e.endCoordinates.height,
          useNativeDriver: false,
        }).start();
      },
    );

    const keyboardWillHide = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        Animated.timing(keyboardHeight, {
          duration: 250,
          toValue: 0,
          useNativeDriver: false,
        }).start();
      },
    );

    return () => {
      keyboardWillShow.remove();
      keyboardWillHide.remove();
    };
  }, []);

  useEffect(() => {
    if (messages.length > 0) {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: input.trim(),
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await authApi.getAIAssistantResponse(input.trim());

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response.message,
        sender: 'assistant',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error getting AI response:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: 'Sorry, I encountered an error. Please try again.',
        sender: 'assistant',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>AI Assistant</Text>
        <View style={styles.backButton} />
      </View>

      <View style={styles.content}>
        <ScrollView
          ref={scrollViewRef}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {messages.map(message => (
            <View
              key={message.id}
              style={[
                styles.messageContainer,
                message.sender === 'user' ? styles.userMessage : styles.assistantMessage,
              ]}
            >
              <View
                style={[
                  styles.messageBubble,
                  {
                    backgroundColor: message.sender === 'user' ? colors.primary : colors.card,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.messageText,
                    {
                      color: message.sender === 'user' ? '#FFFFFF' : colors.text,
                    },
                  ]}
                >
                  {message.text}
                </Text>
                <Text
                  style={[
                    styles.timestamp,
                    {
                      color:
                        message.sender === 'user' ? 'rgba(255, 255, 255, 0.7)' : colors.text + '80',
                    },
                  ]}
                >
                  {formatTime(message.timestamp)}
                </Text>
              </View>
            </View>
          ))}
        </ScrollView>
      </View>

      <Animated.View
        style={[
          styles.inputContainer,
          {
            backgroundColor: colors.card,
            transform: [{ translateY: keyboardHeight }],
          },
        ]}
      >
        <TextInput
          style={[
            styles.input,
            {
              color: colors.text,
              backgroundColor: colors.background,
            },
          ]}
          placeholder="Type your message..."
          placeholderTextColor={colors.text + '80'}
          value={input}
          onChangeText={setInput}
          multiline
        />
        <TouchableOpacity
          style={[
            styles.sendButton,
            {
              backgroundColor: colors.primary,
              opacity: input.trim() ? 1 : 0.5,
            },
          ]}
          onPress={handleSend}
          disabled={!input.trim() || isLoading}
        >
          <Ionicons name={isLoading ? 'time' : 'send'} size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </Animated.View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  assistantMessage: {
    alignSelf: 'flex-start',
  },
  backButton: {
    alignItems: 'center',
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 8,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  input: {
    borderRadius: 20,
    flex: 1,
    fontSize: 16,
    height: 40,
    marginRight: 8,
    paddingHorizontal: 16,
  },
  inputContainer: {
    alignItems: 'center',
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
    borderTopWidth: 1,
    flexDirection: 'row',
    padding: 16,
  },
  messageBubble: {
    borderRadius: 16,
    padding: 12,
  },
  messageContainer: {
    marginBottom: 16,
    maxWidth: '80%',
  },
  messageText: {
    fontSize: 16,
    lineHeight: 24,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  sendButton: {
    alignItems: 'center',
    borderRadius: 20,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  timestamp: {
    alignSelf: 'flex-end',
    fontSize: 12,
    marginTop: 4,
  },
  userMessage: {
    alignSelf: 'flex-end',
  },
});
