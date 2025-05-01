import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';
import { MainStackParamList } from '../navigation/types';
import { supabase } from '../config/supabase';
import { useAuth } from '../context/AuthContext';

type Props = NativeStackScreenProps<MainStackParamList, 'Chat'>;

interface Message {
  id: string;
  content: string;
  created_at: string;
  sender_id: string;
  conversation_id: string;
  is_read: boolean;
}

export const ChatScreen: React.FC<Props> = ({ route, navigation }) => {
  const { colors } = useTheme();
  const { user } = useAuth();
  const { conversationId, otherUser, item } = route.params;
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    // Fetch initial messages
    const fetchMessages = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data, error } = await supabase
          .from('messages')
          .select('*')
          .eq('conversation_id', conversationId)
          .order('created_at', { ascending: true });

        if (error) throw error;
        setMessages(data || []);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch messages');
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();

    // Subscribe to new messages
    const subscription = supabase
      .channel(`conversation:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        payload => {
          const newMessage = payload.new as Message;
          setMessages(prev => [...prev, newMessage]);
          scrollToBottom();
        },
      )
      .subscribe();

    // Mark messages as read
    const markMessagesAsRead = async () => {
      try {
        await supabase
          .from('messages')
          .update({ is_read: true })
          .eq('conversation_id', conversationId)
          .eq('is_read', false)
          .neq('sender_id', user?.id);
      } catch (err) {
        console.error('Error marking messages as read:', err);
      }
    };

    markMessagesAsRead();

    return () => {
      subscription.unsubscribe();
    };
  }, [conversationId, user?.id]);

  const scrollToBottom = () => {
    flatListRef.current?.scrollToEnd({ animated: true });
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      const { error } = await supabase.from('messages').insert({
        content: newMessage,
        conversation_id: conversationId,
        sender_id: user?.id,
        is_read: false,
      });

      if (error) throw error;
      setNewMessage('');
      scrollToBottom();
    } catch (err: any) {
      setError(err.message || 'Failed to send message');
    }
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isOwnMessage = item.sender_id === user?.id;

    return (
      <View
        style={[styles.messageContainer, isOwnMessage ? styles.ownMessage : styles.otherMessage]}
      >
        <View
          style={[
            styles.messageBubble,
            {
              backgroundColor: isOwnMessage ? colors.primary : colors.card,
            },
          ]}
        >
          <Text style={[styles.messageText, { color: isOwnMessage ? '#FFFFFF' : colors.text }]}>
            {item.content}
          </Text>
          <Text
            style={[
              styles.messageTime,
              { color: isOwnMessage ? 'rgba(255,255,255,0.7)' : colors.secondary },
            ]}
          >
            {new Date(item.created_at).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Text>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <View style={[styles.header, { backgroundColor: colors.background }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            {otherUser?.name || 'Chat'}
          </Text>
          {item && (
            <Text style={[styles.headerSubtitle, { color: colors.secondary }]}>{item.title}</Text>
          )}
        </View>
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.messagesList}
        onContentSizeChange={scrollToBottom}
        onLayout={scrollToBottom}
      />

      <View
        style={[
          styles.inputContainer,
          { backgroundColor: colors.card, borderTopColor: colors.border },
        ]}
      >
        <TextInput
          style={[styles.input, { color: colors.text }]}
          placeholder="Type a message..."
          placeholderTextColor={colors.secondary}
          value={newMessage}
          onChangeText={setNewMessage}
          multiline
        />
        <TouchableOpacity
          style={[
            styles.sendButton,
            { backgroundColor: newMessage.trim() ? colors.primary : colors.secondary },
          ]}
          onPress={handleSendMessage}
          disabled={!newMessage.trim()}
        >
          <Ionicons name="send" size={24} color={newMessage.trim() ? '#FFFFFF' : colors.text} />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  backButton: {
    marginRight: 8,
    padding: 8,
  },
  container: {
    flex: 1,
  },
  errorText: {
    fontSize: 16,
    margin: 20,
    textAlign: 'center',
  },
  header: {
    alignItems: 'center',
    borderBottomWidth: 1,
    flexDirection: 'row',
    paddingBottom: 16,
    paddingHorizontal: 16,
    paddingTop: 60,
  },
  headerContent: {
    flex: 1,
  },
  headerSubtitle: {
    fontSize: 14,
    marginTop: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  input: {
    borderRadius: 20,
    flex: 1,
    fontSize: 16,
    marginRight: 8,
    maxHeight: 100,
    padding: 12,
  },
  inputContainer: {
    alignItems: 'center',
    borderTopWidth: 1,
    flexDirection: 'row',
    padding: 16,
  },
  messageBubble: {
    borderRadius: 16,
    elevation: 2,
    maxWidth: '80%',
    padding: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  messageContainer: {
    marginBottom: 16,
  },
  messageText: {
    fontSize: 16,
    marginBottom: 4,
  },
  messageTime: {
    alignSelf: 'flex-end',
    fontSize: 12,
  },
  messagesList: {
    padding: 16,
  },
  otherMessage: {
    alignItems: 'flex-start',
  },
  ownMessage: {
    alignItems: 'flex-end',
  },
  sendButton: {
    alignItems: 'center',
    borderRadius: 20,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
});

export default ChatScreen;
