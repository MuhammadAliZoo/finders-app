import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MainStackParamList } from '../navigation/types';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../config/supabase';

type NavigationProp = NativeStackNavigationProp<MainStackParamList, 'ChatList'>;

const ChatListScreen: React.FC = () => {
  const { colors } = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const { user } = useAuth();
  const [chats, setChats] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!user?.id) return;
    const fetchChats = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch conversations where the user is a participant
        const { data, error } = await supabase
          .from('conversations')
          .select('id, participants, last_message, item_id')
          .contains('participants', [user.id]);
        if (error) throw error;
        setChats(data || []);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch chats');
      } finally {
        setLoading(false);
      }
    };
    fetchChats();
  }, [user?.id]);

  const renderItem = ({ item }: { item: any }) => {
    // Find the other user (not the current user)
    const otherUser = (item.participants || []).find((p: any) => user && p !== user.id) || 'Other User';
    return (
      <TouchableOpacity
        style={[styles.chatCard, { backgroundColor: colors.card }]}
        onPress={() => navigation.navigate('Chat', {
          conversationId: item.id,
          otherUser: { name: otherUser },
          item: { id: item.item_id },
        })}
      >
        <Ionicons name="chatbubble-ellipses" size={28} color={colors.primary} style={{ marginRight: 16 }} />
        <View style={{ flex: 1 }}>
          <Text style={[styles.chatName, { color: colors.text }]}>{otherUser}</Text>
          <Text style={[styles.lastMessage, { color: colors.secondary }]} numberOfLines={1}>{item.last_message || 'No messages yet'}</Text>
          <Text style={[styles.itemTitle, { color: colors.secondary }]} numberOfLines={1}>{item.item_id || ''}</Text>
        </View>
        <Ionicons name="chevron-forward" size={22} color={colors.secondary} />
      </TouchableOpacity>
    );
  };

  if (!user?.id) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}> 
        <Text style={{ color: colors.secondary, textAlign: 'center', marginTop: 32 }}>Loading user...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}> 
      <LinearGradient
        colors={[colors.primary + '30', colors.card]}
        style={styles.headerGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <View style={styles.headerRow}>
          <Ionicons name="chatbubbles" size={28} color={colors.primary} style={{ marginRight: 8 }} />
          <Text style={[styles.headerTitle, { color: colors.text }]}>Active Chats</Text>
        </View>
      </LinearGradient>
      <View style={styles.listCard}>
        {loading ? (
          <Text style={{ color: colors.secondary, textAlign: 'center', marginTop: 32 }}>Loading chats...</Text>
        ) : error ? (
          <Text style={{ color: colors.error, textAlign: 'center', marginTop: 32 }}>{error}</Text>
        ) : (
          <FlatList
            data={chats}
            renderItem={renderItem}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={<Text style={{ color: colors.secondary, textAlign: 'center', marginTop: 32 }}>No active chats</Text>}
          />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  chatCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 18,
    padding: 18,
    marginHorizontal: 8,
    marginVertical: 10,
    backgroundColor: '#f8fafc',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
  },
  chatName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  lastMessage: {
    fontSize: 13,
    marginBottom: 2,
    fontWeight: '400',
    color: '#888',
  },
  itemTitle: {
    fontSize: 13,
    fontStyle: 'italic',
  },
  listContent: {
    paddingVertical: 16,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 32,
    paddingBottom: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  headerGradient: {
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    paddingBottom: 8,
    paddingTop: 0,
    marginBottom: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  listCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    marginHorizontal: 12,
    marginTop: 0,
    marginBottom: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.10,
    shadowRadius: 8,
    flex: 1,
  },
});

export default ChatListScreen; 