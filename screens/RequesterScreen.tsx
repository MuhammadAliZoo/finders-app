'use client';

import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { TabScreenProps } from '../navigation/types';
import { supabase } from '../config/supabase';

type Props = TabScreenProps<'RequesterTab'>;

interface Request {
  id: string;
  title: string;
  description: string;
  status: 'searching' | 'found' | 'resolved';
  created_at: string;
  user_id: string;
  item_id: string;
  image_url: string;
  location: string;
  potential_matches: number;
}

// Mock data for requests
const mockRequests: Request[] = [
  {
    id: '1',
    title: 'Lost MacBook Pro',
    description: 'Space Gray MacBook Pro 16" lost in Central Library study area. Has distinctive stickers on the cover.',
    status: 'searching',
    created_at: '2024-03-20T14:30:00Z',
    user_id: 'user123',
    item_id: 'item123',
    image_url: 'https://via.placeholder.com/150',
    location: 'Central Library, 2nd Floor',
    potential_matches: 2
  },
  {
    id: '2',
    title: 'Missing Blue Backpack',
    description: 'North Face blue backpack with important documents inside. Last seen at Campus Center.',
    status: 'found',
    created_at: '2024-03-19T09:15:00Z',
    user_id: 'user123',
    item_id: 'item124',
    image_url: 'https://via.placeholder.com/150',
    location: 'Campus Center',
    potential_matches: 1
  },
  {
    id: '3',
    title: 'Lost AirPods Pro',
    description: 'AirPods Pro in white case with custom skin. Lost near the gym.',
    status: 'resolved',
    created_at: '2024-03-18T16:45:00Z',
    user_id: 'user123',
    item_id: 'item125',
    image_url: 'https://via.placeholder.com/150',
    location: 'University Gym',
    potential_matches: 0
  },
  {
    id: '4',
    title: 'Missing Student ID Card',
    description: 'Student ID card lost somewhere between the parking lot and science building.',
    status: 'searching',
    created_at: '2024-03-17T11:20:00Z',
    user_id: 'user123',
    item_id: 'item126',
    image_url: 'https://via.placeholder.com/150',
    location: 'Science Building Area',
    potential_matches: 3
  },
  {
    id: '5',
    title: 'Lost Car Keys',
    description: 'Toyota car keys with black fob and house key attached. Lost in parking structure.',
    status: 'found',
    created_at: '2024-03-16T13:10:00Z',
    user_id: 'user123',
    item_id: 'item127',
    image_url: 'https://via.placeholder.com/150',
    location: 'West Parking Structure',
    potential_matches: 1
  }
];

export const RequesterScreen: React.FC<Props> = ({ navigation }) => {
  const { colors } = useTheme();
  const [requests, setRequests] = useState<Request[]>(mockRequests); // Initialize with mock data
  const [loading, setLoading] = useState(false); // Set to false since we're using mock data
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'active' | 'resolved'>('active');

  // Comment out the useEffect that fetches from Supabase while using mock data
  /*
  useEffect(() => {
    const fetchRequests = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data, error } = await supabase
          .from('requests')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        setRequests(data || []);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch requests');
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, []);
  */

  const handleRequestPress = useCallback((request: Request) => {
    if (request.potential_matches > 0) {
      navigation.getParent()?.navigate('SearchResults', { 
        searchQuery: request.title,
        requestId: request.id 
      });
    } else {
      navigation.getParent()?.navigate('ItemDetails', { id: request.item_id });
    }
  }, [navigation]);

  const handleAddNewRequest = useCallback(() => {
    navigation.getParent()?.navigate('Submission', { type: 'lost' });
  }, [navigation]);

  const getStatusColor = (status: Request['status']) => {
    switch (status) {
      case 'found':
        return colors.success;
      case 'resolved':
        return colors.primary;
      default:
        return colors.warning;
    }
  };

  const filteredRequests = requests.filter(request => {
    const matchesSearch = request.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         request.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTab = activeTab === 'active' ? 
                      ['searching', 'found'].includes(request.status) : 
                      request.status === 'resolved';
    return matchesSearch && matchesTab;
  });

  const renderRequest = ({ item }: { item: Request }) => (
    <TouchableOpacity
      style={[styles.requestCard, { backgroundColor: colors.card }]}
      onPress={() => handleRequestPress(item)}
    >
      <Image 
        source={{ uri: item.image_url || 'https://via.placeholder.com/100' }}
        style={styles.itemImage}
      />
      <View style={styles.requestContent}>
        <View style={styles.requestHeader}>
          <Text style={[styles.requestTitle, { color: colors.text }]}>{item.title}</Text>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
            <Text style={styles.statusText}>{item.status}</Text>
          </View>
        </View>
        <Text style={[styles.requestDescription, { color: colors.text }]} numberOfLines={2}>
          {item.description}
        </Text>
        <View style={styles.metaContainer}>
          <View style={styles.metaItem}>
            <Ionicons name="location-outline" size={14} color={colors.secondary} />
            <Text style={[styles.metaText, { color: colors.secondary }]}>{item.location}</Text>
          </View>
          <View style={styles.metaItem}>
            <Ionicons name="time-outline" size={14} color={colors.secondary} />
            <Text style={[styles.metaText, { color: colors.secondary }]}>
              {new Date(item.created_at).toLocaleDateString()}
            </Text>
          </View>
          {item.potential_matches > 0 && (
            <View style={[styles.matchesBadge, { backgroundColor: colors.primary + '20' }]}>
              <Text style={[styles.matchesText, { color: colors.primary }]}>
                {item.potential_matches} matches
              </Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

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
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.background }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Requester</Text>
      </View>

      <View style={[styles.searchContainer, { backgroundColor: colors.card }]}>
        <Ionicons name="search" size={20} color={colors.text} style={styles.searchIcon} />
        <TextInput
          style={[styles.searchInput, { color: colors.text }]}
          placeholder="Search lost items..."
          placeholderTextColor={colors.secondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'active' && { backgroundColor: colors.primary }
          ]}
          onPress={() => setActiveTab('active')}
        >
          <Text style={[
            styles.tabText,
            { color: activeTab === 'active' ? '#FFFFFF' : colors.text }
          ]}>
            Active Requests
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'resolved' && { backgroundColor: colors.primary }
          ]}
          onPress={() => setActiveTab('resolved')}
        >
          <Text style={[
            styles.tabText,
            { color: activeTab === 'resolved' ? '#FFFFFF' : colors.text }
          ]}>
            Resolved
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredRequests}
        renderItem={renderRequest}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="document-text-outline" size={48} color={colors.secondary} />
            <Text style={[styles.emptyStateText, { color: colors.text }]}>
              No {activeTab} requests
            </Text>
            <Text style={[styles.emptyStateSubtext, { color: colors.secondary }]}>
              {activeTab === 'active' 
                ? "When you report a lost item, it will appear here"
                : "Your resolved requests will appear here"}
            </Text>
          </View>
        }
      />

      <TouchableOpacity
        style={[styles.addButton, { backgroundColor: colors.primary }]}
        onPress={handleAddNewRequest}
      >
        <Ionicons name="add" size={24} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    paddingBottom: 16,
    paddingHorizontal: 16,
    paddingTop: 60,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  searchContainer: {
    alignItems: 'center',
    borderRadius: 12,
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    borderRadius: 8,
    paddingVertical: 10,
    marginHorizontal: 4,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
  },
  listContainer: {
    padding: 16,
  },
  requestCard: {
    flexDirection: 'row',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  itemImage: {
    width: 100,
    height: 100,
  },
  requestContent: {
    flex: 1,
    padding: 12,
  },
  requestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  requestTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
  requestDescription: {
    fontSize: 14,
    marginBottom: 8,
    opacity: 0.8,
  },
  statusBadge: {
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  metaContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  metaText: {
    fontSize: 12,
    marginLeft: 4,
  },
  matchesBadge: {
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  matchesText: {
    fontSize: 12,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    textAlign: 'center',
  },
  emptyStateSubtext: {
    fontSize: 14,
    marginTop: 8,
    opacity: 0.8,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 16,
    margin: 20,
    textAlign: 'center',
  },
  addButton: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
});

export default RequesterScreen;
