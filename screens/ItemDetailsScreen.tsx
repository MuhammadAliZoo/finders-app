"use client"

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, Dimensions, ActivityIndicator, Platform } from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { useTheme } from '../theme/ThemeContext';
import { MainStackParamList } from '../navigation/types';
import { Ionicons } from '@expo/vector-icons';
import { Item } from '../types/item';
import axios from 'axios';

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

type ItemDetailsScreenProps = {
  route: RouteProp<MainStackParamList, 'ItemDetails'>;
  navigation: any;
};

export default function ItemDetailsScreen({ route, navigation }: ItemDetailsScreenProps) {
  const { colors } = useTheme();
  const { itemId, item: initialItem } = route.params;
  const [item, setItem] = useState<Item | null>(initialItem || null);
  const [loading, setLoading] = useState(!initialItem);
  const [error, setError] = useState<string | null>(null);

  // Validate MongoDB ObjectId format
  const isValidObjectId = (id: string) => /^[0-9a-fA-F]{24}$/.test(id);

  useEffect(() => {
    if (!initialItem) {
      if (!isValidObjectId(itemId)) {
        setError('Invalid item ID format');
        setLoading(false);
        return;
      }
      fetchItemDetails();
    }
  }, [itemId]);

  const fetchItemDetails = async () => {
    try {
      setLoading(true);
      console.log('Fetching item details from:', `${API_URL}/items/${itemId}`);
      const response = await axios.get(`${API_URL}/items/${itemId}`, {
        timeout: 10000,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        }
      });
      
      if (!response.data) {
        throw new Error('Item not found');
      }

      console.log('API Response:', response.data);
      const fetchedItem = response.data;
      setItem(fetchedItem);
      setError(null);
    } catch (err) {
      console.error('Error fetching item details:', err);
      if (axios.isAxiosError(err)) {
        if (err.code === 'ECONNABORTED') {
          setError('Request timed out. Please check your network connection.');
        } else if (!err.response) {
          setError('Network error. Please check your connection and API server.');
        } else {
          // Handle specific error cases
          switch (err.response?.status) {
            case 404:
              setError('Item not found');
              break;
            case 500:
              if (err.response?.data?.message?.includes('Cast to ObjectId failed')) {
                setError('Invalid item ID format');
              } else {
                setError('Server error. Please try again later.');
              }
              break;
            default:
              const errorMessage = err.response?.data?.message || err.message;
              setError(`Error: ${errorMessage}`);
          }
        }
      } else {
        setError('An unexpected error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

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
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.text }]}>Loading item details...</Text>
      </View>
    );
  }

  if (error || !item) {
    return (
      <View style={[styles.errorContainer, { backgroundColor: colors.background }]}>
        <Ionicons name="alert-circle-outline" size={48} color={colors.error} />
        <Text style={[styles.errorText, { color: colors.text }]}>
          {error || 'Item not found'}
        </Text>
        {error !== 'Invalid item ID format' && (
          <TouchableOpacity
            style={[styles.retryButton, { backgroundColor: colors.primary }]}
            onPress={fetchItemDetails}
          >
            <Text style={styles.buttonText}>Retry</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={[styles.errorBackButton, { backgroundColor: colors.card }]}
          onPress={() => navigation.goBack()}
        >
          <Text style={[styles.backButtonText, { color: colors.text }]}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const itemType = getItemType(item);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.background }]}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]} numberOfLines={1}>
          {itemType === 'lost' ? 'Lost Item Details' : 'Rare Item Details'}
        </Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView bounces={false} showsVerticalScrollIndicator={false}>
        {item.image ? (
          <View style={styles.imageContainer}>
            <Image 
              source={{ 
                uri: item.image.startsWith('http') ? item.image : `https://picsum.photos/400/400`,
                cache: 'force-cache'
              }} 
              style={styles.image}
              onError={() => {
                console.log('Fallback to placeholder image');
              }}
            />
          </View>
        ) : (
          <View style={[styles.image, { backgroundColor: colors.card }]}>
            <Ionicons name="image-outline" size={48} color={colors.text} />
            <Text style={[styles.noImageText, { color: colors.text }]}>
              No image available
            </Text>
          </View>
        )}
        
        <View style={[styles.contentContainer, { backgroundColor: colors.card }]}>
          <Text style={[styles.title, { color: colors.text }]}>{item.title}</Text>
          
          <View style={styles.badgeContainer}>
            {itemType === 'lost' && (
              <View style={[styles.badge, { backgroundColor: colors.primary + '20' }]}>
                <Ionicons name="alert-circle" size={16} color={colors.primary} />
                <Text style={[styles.badgeText, { color: colors.primary }]}>
                  {item.priority} Priority
                </Text>
              </View>
            )}
            {itemType === 'rare' && (
              <View style={[styles.badge, { backgroundColor: colors.primary + '20' }]}>
                <Ionicons name="diamond" size={16} color={colors.primary} />
                <Text style={[styles.badgeText, { color: colors.primary }]}>
                  {item.rarity}
                </Text>
              </View>
            )}
            <View style={[styles.badge, { backgroundColor: colors.secondary + '20' }]}>
              <Ionicons name="pricetag" size={16} color={colors.secondary} />
              <Text style={[styles.badgeText, { color: colors.secondary }]}>
                ${item.price.toLocaleString()} {itemType === 'rare' ? 'Value' : 'Reward'}
              </Text>
            </View>
          </View>

          <Text style={[styles.description, { color: colors.text }]}>
            {item.description}
          </Text>

          <View style={styles.detailsContainer}>
            {item.location && (
              <View style={styles.detailRow}>
                <Ionicons name="location" size={20} color={colors.primary} />
                <Text style={[styles.detailText, { color: colors.text }]}>
                  {`${item.location.latitude.toFixed(4)}, ${item.location.longitude.toFixed(4)}`}
                </Text>
              </View>
            )}
            
            <View style={styles.detailRow}>
              <Ionicons name="time" size={20} color={colors.primary} />
              <Text style={[styles.detailText, { color: colors.text }]}>
                {formatDate(item.timestamp)}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Ionicons name="apps" size={20} color={colors.primary} />
              <Text style={[styles.detailText, { color: colors.text }]}>
                Category: {item.category.charAt(0).toUpperCase() + item.category.slice(1)}
              </Text>
            </View>

            {itemType === 'lost' && item.lastSeen && (
              <View style={styles.detailRow}>
                <Ionicons name="eye-outline" size={20} color={colors.primary} />
                <Text style={[styles.detailText, { color: colors.text }]}>
                  Last seen: {formatDate(item.lastSeen)}
                </Text>
              </View>
            )}
          </View>

          <TouchableOpacity 
            style={[styles.button, { backgroundColor: colors.primary }]}
            onPress={() => navigation.navigate('ClaimTracking', { itemId: item.id })}
          >
            <Ionicons 
              name={itemType === 'lost' ? 'search-outline' : 'cart-outline'} 
              size={20} 
              color="white" 
              style={styles.buttonIcon} 
            />
            <Text style={styles.buttonText}>
              {itemType === 'lost' ? 'Track Lost Item' : 'Purchase Rare Item'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
  },
  backButton: {
    padding: 8,
    marginRight: 8,
    borderRadius: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
  },
  headerRight: {
    width: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 12,
    marginBottom: 20,
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  imageContainer: {
    width: Dimensions.get('window').width,
    height: 300,
    resizeMode: 'cover',
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: Dimensions.get('window').width,
    height: 300,
    resizeMode: 'cover',
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentContainer: {
    flex: 1,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    marginTop: -20,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  badgeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
  },
  badgeText: {
    fontSize: 13,
    fontWeight: '600',
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 24,
  },
  detailsContainer: {
    gap: 16,
    marginBottom: 24,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  detailText: {
    flex: 1,
    fontSize: 15,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  buttonIcon: {
    marginRight: 4,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
  },
  errorBackButton: {
    marginTop: 12,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  noImageText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

