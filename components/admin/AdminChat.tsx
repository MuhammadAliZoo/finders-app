import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';

interface Message {
  id: string;
  text: string;
  sender: string;
  timestamp: Date;
}

export interface AdminChatProps {
  onClose: () => void;
  onSend: (message: string) => void;
}

const AdminChat: React.FC<AdminChatProps> = ({ onClose, onSend }) => {
  const { colors } = useTheme();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);

  const handleSend = () => {
    if (message.trim()) {
      const newMessage: Message = {
        id: Date.now().toString(),
        text: message.trim(),
        sender: 'admin',
        timestamp: new Date(),
      };
      setMessages([newMessage, ...messages]);
      onSend(message.trim());
      setMessage('');
    }
  };

  const renderMessage = ({ item }: { item: Message }) => (
    <View
      style={[
        styles.messageContainer,
        item.sender === 'admin' ? styles.sentMessage : styles.receivedMessage,
        { backgroundColor: item.sender === 'admin' ? colors.primary + '20' : colors.card },
      ]}
    >
      <Text style={[styles.messageText, { color: colors.text }]}>{item.text}</Text>
      <Text style={[styles.timestamp, { color: colors.secondary }]}>
        {item.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </Text>
    </View>
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
    >
      <FlatList
        data={messages}
        renderItem={renderMessage}
        keyExtractor={item => item.id}
        inverted
        style={styles.messagesList}
        contentContainerStyle={styles.messagesContainer}
      />

      <View style={[styles.inputContainer, { backgroundColor: colors.card }]}>
        <TextInput
          style={[styles.input, { color: colors.text }]}
          placeholder="Type a message..."
          placeholderTextColor={colors.secondary}
          value={message}
          onChangeText={setMessage}
          multiline
        />
        <TouchableOpacity
          style={[styles.sendButton, { backgroundColor: colors.primary }]}
          onPress={handleSend}
          disabled={!message.trim()}
        >
          <Ionicons name="send" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  input: {
    borderRadius: 20,
    flex: 1,
    fontSize: 16,
    marginRight: 8,
    maxHeight: 100,
    minHeight: 40,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  inputContainer: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    padding: 8,
  },
  messageContainer: {
    borderRadius: 16,
    marginBottom: 8,
    maxWidth: '80%',
    padding: 12,
  },
  messageText: {
    fontSize: 16,
    marginBottom: 4,
  },
  messagesContainer: {
    padding: 16,
  },
  messagesList: {
    flex: 1,
  },
  receivedMessage: {
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 4,
  },
  sendButton: {
    alignItems: 'center',
    borderRadius: 20,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  sentMessage: {
    alignSelf: 'flex-end',
    borderBottomRightRadius: 4,
  },
  timestamp: {
    alignSelf: 'flex-end',
    fontSize: 12,
  },
});

export default AdminChat;
