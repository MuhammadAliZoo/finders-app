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
  Alert,
} from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';
import { MainStackParamList } from '../navigation/types';
import { Ionicons } from '@expo/vector-icons';
import { Item } from '../types/item';
import axios from 'axios';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { supabase } from '../config/supabase';
import { useAuth } from '../context/AuthContext';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path } from 'react-native-svg';

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
  // Try to fetch from items table first
  let { data: item, error: itemError } = await supabase
    .from('items')
    .select('*')
    .eq('id', itemId)
    .single();

  // If not found, try requests table
  if (itemError || !item) {
    const { data: reqItem, error: reqError } = await supabase
      .from('requests')
      .select('*')
      .eq('id', itemId)
      .single();
    if (reqError) throw reqError;
    item = reqItem;
  }

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
  const { user } = useAuth();
  const [item, setItem] = useState<Item | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [claimLoading, setClaimLoading] = useState(false);
  const [claimError, setClaimError] = useState<string | null>(null);

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

  // Handler for creating a claim
  const handleClaimItem = async () => {
    if (!user || !item) return;
    setClaimLoading(true);
    setClaimError(null);
    try {
      const { data, error } = await supabase
        .from('claims')
        .insert({
          item_id: item.id,
          requester_id: user.id,
          status: 'pending',
          created_at: new Date().toISOString(),
        })
        .select()
        .single();
      if (error) throw error;
      navigation.navigate('ClaimTracking', { claimId: data.id });
    } catch (err: any) {
      setClaimError('Failed to create claim. Please try again.');
      console.error('Error creating claim:', err);
    } finally {
      setClaimLoading(false);
    }
  };

  // Handler for flagging an item as inappropriate
  const handleFlagItem = async () => {
    if (!user || !item) return;
    Alert.alert(
      'Flag Item',
      'Are you sure you want to flag this item as inappropriate? This will send it to the admin for review.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Flag',
          style: 'destructive',
          onPress: async () => {
            try {
              // Insert into moderation queue (or flagged_items)
              await supabase.from('moderation_queue').insert({
                item_id: item.id,
                flagged_by: user.id,
                flagged_at: new Date().toISOString(),
                reason: 'inappropriate',
                status: 'pending',
              });
              // Update item status to 'flagged'
              await supabase.from('items').update({ status: 'flagged' }).eq('id', item.id);
              Alert.alert('Flagged', 'This item has been sent to the admin for review.');
              navigation.goBack();
            } catch (err) {
              Alert.alert('Error', 'Failed to flag item. Please try again.');
              console.error('Error flagging item:', err);
            }
          },
        },
      ]
    );
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
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Floating yellow flag icon at top right */}
      <TouchableOpacity
        style={{
          position: 'absolute',
          top: 24,
          right: 24,
          zIndex: 10,
          backgroundColor: 'rgba(255,255,255,0.85)',
          borderRadius: 24,
          padding: 8,
          elevation: 4,
          shadowColor: '#FFD600',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.18,
          shadowRadius: 6,
        }}
        onPress={handleFlagItem}
        accessibilityLabel="Flag as inappropriate"
      >
        <Ionicons name="flag" size={28} color="#FFD600" />
      </TouchableOpacity>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 120 }}>
        {/* Image Section */}
        <View style={{
          alignItems: 'center',
          backgroundColor: colors.card,
          borderBottomLeftRadius: 32,
          borderBottomRightRadius: 32,
          overflow: 'hidden',
          elevation: 2,
          shadowColor: colors.primary,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.10,
          shadowRadius: 12,
          marginBottom: -32,
        }}>
          <Image source={{ uri: item.image }} style={{ width: '100%', height: 260, borderBottomLeftRadius: 32, borderBottomRightRadius: 32 }} resizeMode="cover" />
        </View>
        {/* Card Section */}
        <View style={[styles.card, { backgroundColor: colors.card, borderRadius: 22, marginTop: -24, marginHorizontal: 16, elevation: 6, shadowColor: colors.primary, shadowOpacity: 0.08 }]}> 
          {/* Title and Price */}
          <Text style={[styles.itemTitle, { color: colors.text, fontSize: 24, fontWeight: 'bold', marginBottom: 4 }]}>{item.title}</Text>
          {typeof item.price === 'number' && item.price > 0 && (
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
              <Ionicons name="pricetag" size={18} color={colors.primary} style={{ marginRight: 4 }} />
              <Text style={[styles.price, { color: colors.primary, fontSize: 18, fontWeight: 'bold' }]}>{`$${item.price.toFixed(2)}`}</Text>
            </View>
          )}
          <Text style={[styles.description, { color: colors.text, fontSize: 16, marginBottom: 14 }]}>{item.description}</Text>
          {/* Meta Info Section */}
          <View style={{ borderTopColor: '#eee', borderTopWidth: 1, marginTop: 8, paddingTop: 12, marginBottom: 12, gap: 10 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
              <Ionicons name="grid-outline" size={18} color={colors.primary} style={{ marginRight: 4 }} />
              <Text style={[styles.metaLabel, { color: colors.primary, fontWeight: '700' }]}>Category:</Text>
              <Text style={[styles.metaValue, { color: colors.text, fontWeight: '500', marginLeft: 4 }]}>{item.category}</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
              <Ionicons name="flag-outline" size={18} color={colors.primary} style={{ marginRight: 4 }} />
              <Text style={[styles.metaLabel, { color: colors.primary, fontWeight: '700' }]}>Priority:</Text>
              <View style={{ backgroundColor: colors.primary + '22', borderRadius: 8, paddingHorizontal: 8, marginLeft: 4 }}>
                <Text style={[styles.metaValue, { color: colors.primary, fontWeight: 'bold' }]}>{item.priority}</Text>
              </View>
            </View>
            {item.rarity && (
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
                <Ionicons name="star-outline" size={18} color={colors.primary} style={{ marginRight: 4 }} />
                <Text style={[styles.metaLabel, { color: colors.primary, fontWeight: '700' }]}>Rarity:</Text>
                <View style={{ backgroundColor: colors.primary + '22', borderRadius: 8, paddingHorizontal: 8, marginLeft: 4 }}>
                  <Text style={[styles.metaValue, { color: colors.primary, fontWeight: 'bold' }]}>{item.rarity}</Text>
                </View>
              </View>
            )}
            {typeof (item as any).status === 'string' && (
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
                <Ionicons name="information-circle-outline" size={18} color={colors.primary} style={{ marginRight: 4 }} />
                <Text style={[styles.metaLabel, { color: colors.primary, fontWeight: '700' }]}>Status:</Text>
                <View style={{ backgroundColor: colors.primary + '22', borderRadius: 8, paddingHorizontal: 8, marginLeft: 4 }}>
                  <Text style={[styles.metaValue, { color: colors.primary, fontWeight: 'bold' }]}>{(item as any).status}</Text>
                </View>
              </View>
            )}
            {item.timestamp && (
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
                <Ionicons name="calendar-outline" size={18} color={colors.primary} style={{ marginRight: 4 }} />
                <Text style={[styles.metaLabel, { color: colors.primary, fontWeight: '700' }]}>Date:</Text>
                <Text style={[styles.metaValue, { color: colors.text, fontWeight: '500', marginLeft: 4 }]}>{formatDate(item.timestamp)}</Text>
              </View>
            )}
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
              <Ionicons name="location-outline" size={18} color={colors.primary} style={{ marginRight: 4 }} />
              <Text style={[styles.metaLabel, { color: colors.primary, fontWeight: '700' }]}>Location:</Text>
              <Text style={[styles.metaValue, { color: colors.text, fontWeight: '500', marginLeft: 4 }]}>
                {item.location && typeof item.location.latitude === 'number' && typeof item.location.longitude === 'number'
                  ? `${item.location.latitude.toFixed(4)}, ${item.location.longitude.toFixed(4)}`
                  : 'Not specified'}
              </Text>
            </View>
          </View>
          {/* User Info Section (if available) */}
          {typeof (item as any).user === 'object' && (item as any).user && (
            <View style={{
              alignItems: 'center',
              backgroundColor: colors.background,
              borderRadius: 12,
              flexDirection: 'row',
              marginBottom: 16,
              marginTop: 8,
              padding: 10,
              borderWidth: 1,
              borderColor: colors.border,
            }}>
              <Ionicons name="person-circle-outline" size={22} color={colors.primary} style={{ marginRight: 8 }} />
              <Text style={[styles.metaLabel, { color: colors.primary, fontWeight: '700' }]}>Posted by:</Text>
              <Text style={[styles.metaValue, { color: colors.text, fontWeight: '500', marginLeft: 4 }]}>{(item as any).user.full_name || (item as any).user.username || (item as any).user.email}</Text>
            </View>
          )}
          {/* Action Buttons */}
          <View style={{ flexDirection: 'row', gap: 12, marginTop: 16 }}>
            <TouchableOpacity
              style={[styles.claimButton, { backgroundColor: colors.primary, flex: 1, borderRadius: 14, elevation: 2 }]}
              onPress={handleClaimItem}
              disabled={claimLoading}
            >
              <Ionicons name="checkmark-done" size={22} color="#fff" style={{ marginRight: 6 }} />
              <Text style={styles.claimButtonText}>{claimLoading ? 'Claiming...' : 'Claim Item'}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.foundButton, { backgroundColor: '#22C55E', flex: 1, borderRadius: 14, elevation: 2 }]}
              onPress={() => alert('This feature is coming soon!')}
            >
              <Ionicons name="checkmark-circle" size={22} color="#fff" style={{ marginRight: 6 }} />
              <Text style={styles.foundButtonText}>Found Item</Text>
            </TouchableOpacity>
          </View>
          {claimError && <Text style={{ color: 'red', marginTop: 8 }}>{claimError}</Text>}
        </View>
      </ScrollView>
      {/* Creative bottom section */}
      <View style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 120, alignItems: 'center', justifyContent: 'flex-end' }} pointerEvents="none">
        {/* Soft wave SVG */}
        <Svg height="100%" width="100%" viewBox="0 0 400 120" style={{ position: 'absolute', bottom: 0 }}>
          <Path
            d="M0,40 Q100,80 200,40 T400,40 V120 H0 Z"
            fill={colors.primary + '11'}
          />
          <Path
            d="M0,60 Q100,100 200,60 T400,60 V120 H0 Z"
            fill={colors.primary + '22'}
          />
        </Svg>
        {/* Friendly message */}
        <LinearGradient
          colors={[colors.background + '00', colors.primary + '10', colors.primary + '22']}
          style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 120 }}
          pointerEvents="none"
        />
        <Text style={{
          color: colors.primary,
          fontWeight: '600',
          fontSize: 16,
          textAlign: 'center',
          marginBottom: 24,
          zIndex: 2,
          textShadowColor: colors.background,
          textShadowOffset: { width: 0, height: 1 },
          textShadowRadius: 4,
        }}>
          Remember: Every item returned is a story reunited.
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  backButton: {
    marginRight: 16,
  },
  container: {
    flex: 1,
  },
  imageContainer: {
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    elevation: 2,
    marginBottom: 0,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  image: {
    height: 260,
    width: '100%',
  },
  card: {
    borderRadius: 18,
    elevation: 4,
    margin: 18,
    marginTop: -32,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.10,
    shadowRadius: 12,
  },
  itemTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'left',
  },
  price: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 16,
    opacity: 0.9,
  },
  metaSection: {
    borderTopColor: '#eee',
    borderTopWidth: 1,
    marginTop: 8,
    paddingTop: 12,
    marginBottom: 12,
    gap: 8,
  },
  metaItem: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
    marginBottom: 2,
  },
  metaIcon: {
    marginRight: 2,
  },
  metaLabel: {
    color: '#888',
    fontSize: 14,
    fontWeight: '600',
    marginRight: 4,
  },
  metaValue: {
    color: '#222',
    fontSize: 15,
    fontWeight: '500',
  },
  userSection: {
    alignItems: 'center',
    backgroundColor: '#f7f7fa',
    borderRadius: 12,
    flexDirection: 'row',
    marginBottom: 16,
    marginTop: 8,
    padding: 10,
  },
  claimButton: {
    alignItems: 'center',
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
  },
  foundButton: {
    alignItems: 'center',
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    padding: 16,
    shadowColor: '#22C55E',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
  },
  claimButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  foundButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  title: {
    flex: 1,
    fontSize: 20,
    fontWeight: 'bold',
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    padding: 16,
  },
  detailsContainer: {
    flexDirection: 'row',
    marginBottom: 8,
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
  errorText: {
    fontSize: 16,
    marginTop: 20,
    textAlign: 'center',
  },
});
