import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { supabase } from '../config/supabase';
import { useTheme } from '../context/ThemeContext';

interface User {
  id: string;
  email: string;
  created_at: string;
}

interface Item {
  id: string;
  title: string;
  description: string;
  created_at: string;
}

const CollaborativeWorkspaceScreen: React.FC = () => {
  const { colors } = useTheme();
  const [users, setUsers] = useState<User[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingItems, setLoadingItems] = useState(true);
  const [errorUsers, setErrorUsers] = useState<string | null>(null);
  const [errorItems, setErrorItems] = useState<string | null>(null);

  // Fetch initial data
  useEffect(() => {
    fetchUsers();
    fetchItems();
    // Real-time subscriptions
    const userChannel = supabase
      .channel('realtime:profiles')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, handleUserChange)
      .subscribe();
    const itemChannel = supabase
      .channel('realtime:items')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'items' }, handleItemChange)
      .subscribe();
    return () => {
      userChannel.unsubscribe();
      itemChannel.unsubscribe();
    };
  }, []);

  // Handlers for real-time changes
  const handleUserChange = (payload: any) => {
    if (payload.eventType === 'INSERT') {
      setUsers(prev => [payload.new, ...prev]);
    } else if (payload.eventType === 'UPDATE') {
      setUsers(prev => prev.map(u => (u.id === payload.new.id ? payload.new : u)));
    } else if (payload.eventType === 'DELETE') {
      setUsers(prev => prev.filter(u => u.id !== payload.old.id));
    }
  };
  const handleItemChange = (payload: any) => {
    if (payload.eventType === 'INSERT') {
      setItems(prev => [payload.new, ...prev]);
    } else if (payload.eventType === 'UPDATE') {
      setItems(prev => prev.map(i => (i.id === payload.new.id ? payload.new : i)));
    } else if (payload.eventType === 'DELETE') {
      setItems(prev => prev.filter(i => i.id !== payload.old.id));
    }
  };

  // Fetchers
  const fetchUsers = async () => {
    setLoadingUsers(true);
    setErrorUsers(null);
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) setErrorUsers(error.message);
    setUsers(data || []);
    setLoadingUsers(false);
  };
  const fetchItems = async () => {
    setLoadingItems(true);
    setErrorItems(null);
    const { data, error } = await supabase
      .from('items')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) setErrorItems(error.message);
    setItems(data || []);
    setLoadingItems(false);
  };

  // Delete actions
  const handleDeleteUser = (userId: string) => {
    const deleteUser = async () => {
      const { error } = await supabase.from('profiles').delete().eq('id', userId);
      if (error) Alert.alert('Error', error.message);
    };
    Alert.alert('Delete User', 'Are you sure you want to delete this user?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: deleteUser },
    ]);
  };
  const handleDeleteItem = (itemId: string) => {
    const deleteItem = async () => {
      const { error } = await supabase.from('items').delete().eq('id', itemId);
      if (error) Alert.alert('Error', error.message);
    };
    Alert.alert('Delete Item', 'Are you sure you want to delete this item?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: deleteItem },
    ]);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.header, { color: colors.primary }]}>Collaborative Workspace</Text>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>Users (Real-time)</Text>
      {loadingUsers ? (
        <ActivityIndicator size="large" color={colors.primary} />
      ) : errorUsers ? (
        <Text style={[styles.errorText, { color: colors.error }]}>{errorUsers}</Text>
      ) : (
        <FlatList
          data={users}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <View style={[styles.card, { backgroundColor: colors.card }]}>
              <Text style={[styles.cardTitle, { color: colors.text }]}>{item.email}</Text>
              <TouchableOpacity
                onPress={() => handleDeleteUser(item.id)}
                style={[styles.deleteButton, { backgroundColor: colors.error }]}
              >
                <Text style={styles.deleteButtonText}>Delete</Text>
              </TouchableOpacity>
            </View>
          )}
          ListEmptyComponent={
            <Text style={[styles.emptyText, { color: colors.secondary }]}>No users found.</Text>
          }
        />
      )}
      <Text style={[styles.sectionTitle, { color: colors.text }]}>Items (Real-time)</Text>
      {loadingItems ? (
        <ActivityIndicator size="large" color={colors.primary} />
      ) : errorItems ? (
        <Text style={[styles.errorText, { color: colors.error }]}>{errorItems}</Text>
      ) : (
        <FlatList
          data={items}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <View style={[styles.card, { backgroundColor: colors.card }]}>
              <Text style={[styles.cardTitle, { color: colors.text }]}>{item.title}</Text>
              <Text style={[styles.cardSubtitle, { color: colors.secondary }]}>
                {item.description}
              </Text>
              <TouchableOpacity
                onPress={() => handleDeleteItem(item.id)}
                style={[styles.deleteButton, { backgroundColor: colors.error }]}
              >
                <Text style={styles.deleteButtonText}>Delete</Text>
              </TouchableOpacity>
            </View>
          )}
          ListEmptyComponent={
            <Text style={[styles.emptyText, { color: colors.secondary }]}>No items found.</Text>
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    elevation: 2,
    marginBottom: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  cardSubtitle: {
    fontSize: 14,
    marginTop: 4,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  container: {
    flex: 1,
    padding: 16,
  },
  deleteButton: {
    alignSelf: 'flex-start',
    borderRadius: 8,
    marginTop: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  deleteButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  emptyText: {
    fontSize: 16,
    marginVertical: 12,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 16,
    marginVertical: 12,
    textAlign: 'center',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 16,
  },
});

export default CollaborativeWorkspaceScreen;
