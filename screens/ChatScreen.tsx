import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, ActivityIndicator, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { formatDistanceToNow } from 'date-fns';
import { ClaimCompletionPopup } from '../components/ClaimCompletionPopup';
import { API_URL } from '../config';
import { RootStackParamList } from '../navigation/types';
import { auth, db } from '../config/firebase';
import { collection, query, where, orderBy, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

type ChatScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;
type ChatScreenRouteProp = RouteProp<RootStackParamList, 'Chat'>;

interface ChatUser {
  id: string;
  displayName: string;
  photoURL?: string | null;
}

// Helper function to convert Auth User to ChatUser
const convertToChatUser = (user: any | null): ChatUser | null => {
  if (!user) return null;
  return {
    id: user.id || user._id || '',
    displayName: user.displayName || user.name || 'Anonymous',
    photoURL: user.photoURL || user.avatar
  };
};

interface Message {
  _id: string;
  content: string;
  sender: ChatUser;
  createdAt: string;
  readBy: string[];
  attachments?: {
    type: string;
    url: string;
  }[];
}

export const ChatScreen: React.FC = () => {
  const route = useRoute<ChatScreenRouteProp>();
  const { conversationId, otherUser, item } = route.params;
  const { user: firebaseUser } = useAuth();
  const user = convertToChatUser(firebaseUser);
  const { socket, isConnected } = useSocket();
  const navigation = useNavigation<ChatScreenNavigationProp>();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [showClaimPopup, setShowClaimPopup] = useState(false);
  const [isFinder, setIsFinder] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [otherUserTyping, setOtherUserTyping] = useState(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    if (!user) {
      navigation.navigate('Auth');
      return;
    }

    fetchMessages();
    checkUserRole();
    setupSocketListeners();

    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [conversationId, socket, user]);

  const setupSocketListeners = () => {
    if (!socket) return;

    socket.on('newMessage', (message: Message) => {
      setMessages(prev => [...prev, message]);
      if (user?.id) {
        markMessageAsRead(message._id);
      }
    });

    socket.on('messageRead', (messageId: string) => {
      setMessages(prev => prev.map(msg => 
        msg._id === messageId 
          ? { ...msg, readBy: [...msg.readBy, otherUser.id] }
          : msg
      ));
    });

    socket.on('typing', (userId: string) => {
      if (userId === otherUser.id) {
        setOtherUserTyping(true);
        setTimeout(() => setOtherUserTyping(false), 3000);
      }
    });

    socket.on('stopTyping', (userId: string) => {
      if (userId === otherUser.id) {
        setOtherUserTyping(false);
      }
    });
  };

  const checkUserRole = async () => {
    if (item) {
      try {
        const response = await fetch(`${API_URL}/items/${item._id}`);
        const data = await response.json();
        setIsFinder(data.finder?.id === user?.id);
      } catch (error) {
        console.error('Error checking user role:', error);
      }
    }
  };

  const fetchMessages = async () => {
    try {
      const response = await fetch(`${API_URL}/messages/${conversationId}`);
      const data = await response.json();
      setMessages(data);
      setLoading(false);
      
      // Mark all messages as read
      if (user?.id) {
        data.forEach((message: Message) => {
          if (!message.readBy.includes(user.id)) {
            markMessageAsRead(message._id);
          }
        });
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
      setLoading(false);
    }
  };

  const markMessageAsRead = async (messageId: string) => {
    if (!socket || !user?.id) return;

    try {
      await fetch(`${API_URL}/messages/${messageId}/read`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: user.id }),
      });

      socket.emit('messageRead', { messageId, userId: user.id });
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !socket || !isConnected || !user?.id) return;

    const messageData = {
      conversation: conversationId,
      content: newMessage.trim(),
      sender: user.id,
    };

    try {
      const response = await fetch(`${API_URL}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(messageData),
      });

      if (response.ok) {
        const newMessageData = await response.json();
        setMessages(prev => [...prev, newMessageData]);
        setNewMessage('');
        
        if (messages.length === 0) {
          setShowClaimPopup(true);
        }

        socket.emit('sendMessage', {
          conversationId,
          message: newMessageData,
        });
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleTyping = () => {
    if (!socket || !isConnected || !user?.id) return;

    setIsTyping(true);
    socket.emit('typing', { userId: user.id, conversationId });

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      socket.emit('stopTyping', { userId: user.id, conversationId });
    }, 3000);
  };

  const handleClaimCompletion = async (completed: boolean) => {
    if (!item || !user?.id) return;

    try {
      const response = await fetch(`${API_URL}/items/${item._id}/complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          completed,
          userId: user.id,
          isFinder,
        }),
      });

      if (response.ok) {
        if (completed) {
          navigation.goBack();
        }
      }
    } catch (error) {
      console.error('Error handling claim completion:', error);
    } finally {
      setShowClaimPopup(false);
    }
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isOwnMessage = item.sender.id === user?.id;

    return (
      <View style={[styles.messageContainer, isOwnMessage ? styles.ownMessage : styles.otherMessage]}>
        {!isOwnMessage && (
          <Image
            source={{ uri: item.sender.photoURL || 'https://via.placeholder.com/40' }}
            style={styles.avatar}
          />
        )}
        <View style={[styles.messageContent, isOwnMessage ? styles.ownMessageContent : styles.otherMessageContent]}>
          <Text style={styles.messageText}>{item.content}</Text>
          <Text style={styles.messageTime}>
            {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
            {isOwnMessage && item.readBy.includes(otherUser.id) && (
              <Ionicons name="checkmark-done" size={16} color={colors.primary} style={styles.readIcon} />
            )}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>{otherUser.displayName}</Text>
          {item && <Text style={styles.headerSubtitle}>{item.title}</Text>}
          {otherUserTyping && <Text style={styles.typingIndicator}>typing...</Text>}
        </View>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={item => item._id}
          contentContainerStyle={styles.messagesList}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
        />
      )}

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={newMessage}
          onChangeText={text => {
            setNewMessage(text);
            handleTyping();
          }}
          placeholder="Type a message..."
          placeholderTextColor={colors.gray}
          multiline
        />
        <TouchableOpacity
          style={[styles.sendButton, !newMessage.trim() && styles.sendButtonDisabled]}
          onPress={handleSendMessage}
          disabled={!newMessage.trim() || !isConnected}
        >
          <Ionicons name="send" size={24} color={colors.background} />
        </TouchableOpacity>
      </View>

      <ClaimCompletionPopup
        visible={showClaimPopup}
        onYes={() => handleClaimCompletion(true)}
        onNo={() => handleClaimCompletion(false)}
        onClose={() => setShowClaimPopup(false)}
      />
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
  },
  backButton: {
    marginRight: 16,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  headerSubtitle: {
    fontSize: 14,
    color: colors.gray,
  },
  typingIndicator: {
    fontSize: 12,
    color: colors.gray,
    fontStyle: 'italic',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  messagesList: {
    padding: 16,
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    maxWidth: '80%',
  },
  ownMessage: {
    alignSelf: 'flex-end',
  },
  otherMessage: {
    alignSelf: 'flex-start',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 8,
  },
  messageContent: {
    padding: 12,
    borderRadius: 16,
  },
  ownMessageContent: {
    backgroundColor: colors.primary,
  },
  otherMessageContent: {
    backgroundColor: colors.lightGray,
  },
  messageText: {
    color: colors.text,
    fontSize: 16,
  },
  messageTime: {
    fontSize: 12,
    color: colors.gray,
    marginTop: 4,
    flexDirection: 'row',
    alignItems: 'center',
  },
  readIcon: {
    marginLeft: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: colors.lightGray,
  },
  input: {
    flex: 1,
    backgroundColor: colors.lightGray,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    maxHeight: 100,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: colors.gray,
  },
}); 