'use client';

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { useTheme } from '../theme/ThemeContext';
import { MainStackParamList } from '../navigation/types';
import { Ionicons } from '@expo/vector-icons';
import { Item } from '../types/item';
import axios from 'axios';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { supabase } from '../config/supabase';

// Get the appropriate API URL based on platform and environment
const getApiUrl = () => {
  // Check if we're using a physical device with a specific IP
  const PHYSICAL_DEVICE_IP = '192.168.1.100'; // Replace with your computer's IP address
  const USE_PHYSICAL_DEVICE = false; // Set this to true when testing on physical device

  if (USE_PHYSICAL_DEVICE) {
    return `http://${PHYSICAL_DEVICE_IP}:5001/api`;
  }

  if (Platform.OS === 'ios') {
    return 'http://localhost:5001/api';
  } else if (Platform.OS === 'android') {
    return 'http://10.0.2.2:5001/api';
  }

  return 'http://localhost:5001/api'; // fallback
};

const API_URL = getApiUrl();
console.log('Using API URL:', API_URL);

type ItemDetailsScreenRouteProp = RouteProp<MainStackParamList, 'ItemDetails'>;
type ItemDetailsScreenNavigationProp = NavigationProp<MainStackParamList>;

type Props = NativeStackScreenProps<MainStackParamList, 'ItemDetails'>;

const fetchItemAndUser = async (itemId: string) => {
  // Fetch item details
  const { data: item, error: itemError } = await supabase
    .from('items')
    .select('*')
    .eq('id', itemId)
    .single();
  if (itemError) throw itemError;

  // Fetch user details
  let user = null;
  if (item && item.user_id) {
    const { data: userData, error: userError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', item.user_id)
      .single();
    if (userError) throw userError;
    user = userData;
  }
  return { item, user };
};

export const ItemDetailsScreen: React.FC<Props> = ({ navigation, route }) => {
  const { colors } = useTheme();
  const { id } = route.params;
  const [item, setItem] = useState<Item | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchItem = async () => {
      try {
        const { item, user } = await fetchItemAndUser(id);
        setItem(item as Item);
      } catch (err) {
        setError('Failed to fetch item details');
        console.error('Error fetching item:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchItem();
  }, [id]);

  // Helper function to determine item type
  const getItemType = (item: Item) => {
    if ('priority' in item) return 'lost';
    if ('rarity' in item) return 'rare';
    return 'unknown';
  };

  // Helper function to format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (error || !item) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorText, { color: colors.text }]}>{error || 'Item not found'}</Text>
      </View>
    );
  }

  const itemType = getItemType(item);

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>{item.title}</Text>
      </View>

      <Image source={{ uri: item.image }} style={styles.image} resizeMode="cover" />

      <View style={[styles.content, { backgroundColor: colors.card }]}>
        <Text style={[styles.price, { color: colors.primary }]}>${item.price.toFixed(2)}</Text>
        <Text style={[styles.description, { color: colors.text }]}>{item.description}</Text>
        <View style={styles.detailsContainer}>
          <Text style={[styles.detailLabel, { color: colors.text }]}>Category:</Text>
          <Text style={[styles.detailValue, { color: colors.text }]}>{item.category}</Text>
        </View>
        <View style={styles.detailsContainer}>
          <Text style={[styles.detailLabel, { color: colors.text }]}>Priority:</Text>
          <Text style={[styles.detailValue, { color: colors.text }]}>{item.priority}</Text>
        </View>
        <View style={styles.detailsContainer}>
          <Text style={[styles.detailLabel, { color: colors.text }]}>Location:</Text>
          <Text style={[styles.detailValue, { color: colors.text }]}>
            {item.location
              ? `${item.location.latitude.toFixed(4)}, ${item.location.longitude.toFixed(4)}`
              : 'Not specified'}
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  backButton: {
    marginRight: 16,
  },
  container: {
    flex: 1,
  },
  content: {
    borderRadius: 8,
    marginBottom: 16,
    marginHorizontal: 16,
    marginTop: 16,
    padding: 16,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 16,
  },
  detailLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 8,
    width: 100,
  },
  detailValue: {
    flex: 1,
    fontSize: 16,
  },
  detailsContainer: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  errorText: {
    fontSize: 16,
    marginTop: 20,
    textAlign: 'center',
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    padding: 16,
  },
  image: {
    height: 300,
    width: Dimensions.get('window').width,
  },
  price: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  title: {
    flex: 1,
    fontSize: 20,
    fontWeight: 'bold',
  },
});
