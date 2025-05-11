'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  FlatList,
  Alert,
  Image,
  Dimensions,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { ItemCard } from '../components/ItemCard';
import MapView, { PROVIDER_GOOGLE } from 'react-native-maps';
import { MainStackParamList, TabParamList } from '../navigation/types';
import * as ImagePicker from 'expo-image-picker';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import { processImageWithAI } from '../utils/ai';
import { Item } from '../types/item';
import * as Location from 'expo-location';
import { debounce } from 'lodash';
import { SafeAreaView } from 'react-native-safe-area-context';
import HeatmapView from '../components/admin/HeatmapView';

// Add mock data at the top of the file
const trendingItems: Item[] = [
  {
    id: '1',
    title: 'Lost iPhone 13',
    description: 'Black iPhone 13 lost in Central Park area',
    image: 'https://picsum.photos/200',
    price: 100,
    location: { latitude: 40.7829, longitude: -73.9654 },
    timestamp: new Date().toISOString(),
    priority: 'high',
    category: 'electronics',
    rarity: 'Common'
  },
  {
    id: '2',
    title: 'Gold Watch',
    description: 'Vintage gold watch lost near Times Square',
    image: 'https://picsum.photos/201',
    price: 500,
    location: { latitude: 40.7580, longitude: -73.9855 },
    timestamp: new Date().toISOString(),
    priority: 'medium',
    category: 'accessories',
    rarity: 'Uncommon'
  }
];

const rareItems: Item[] = [
  {
    id: '3',
    title: 'Antique Ring',
    description: 'Family heirloom lost in Brooklyn',
    image: 'https://picsum.photos/202',
    price: 1000,
    location: { latitude: 40.6782, longitude: -73.9442 },
    rarity: 'Very Rare',
    timestamp: new Date().toISOString(),
    priority: 'high',
    category: 'jewelry'
  }
];

const heatmapPoints = [
  { latitude: 40.7829, longitude: -73.9654, weight: 1 },
  { latitude: 40.7580, longitude: -73.9855, weight: 0.8 },
  { latitude: 40.6782, longitude: -73.9442, weight: 0.6 }
];

const communityTips = [
  "Always check lost and found offices in the area",
  "Take clear photos of valuable items for identification",
  "Register your items with unique identifiers"
];

type NavigationProp = NativeStackNavigationProp<MainStackParamList>;

export const HomeScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<MainStackParamList>>();
  const { colors } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('Most Recent');
  const [filteredItems, setFilteredItems] = useState<Item[]>(trendingItems);
  const [isSearching, setIsSearching] = useState(false);
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(
    null,
  );
  const [feedbackMessage, setFeedbackMessage] = useState<string>('');

  const filters = ['Most Recent', 'Near Me', 'High Priority'];

  const handleSearch = async (query: string) => {
    setIsSearching(true);
    try {
      // Perform search logic here
      const results = filteredItems.filter(
        item =>
          item.title.toLowerCase().includes(query.toLowerCase()) ||
          item.description.toLowerCase().includes(query.toLowerCase()),
      );
      setFilteredItems(results);
    } catch (error) {
      console.error('Search error:', error);
      Alert.alert('Error', 'Failed to perform search');
    } finally {
      setIsSearching(false);
    }
  };

  const debouncedSearch = useCallback(
    debounce((query: string) => handleSearch(query), 500),
    [],
  );

  // Handle search input changes
  const handleSearchChange = (text: string) => {
    setSearchQuery(text);
    debouncedSearch(text);
  };

  // Helper function to calculate distance between two points
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
  };

  const deg2rad = (deg: number) => {
    return deg * (Math.PI / 180);
  };

  // Handle filter selection
  const handleFilterSelect = (filter: string) => {
    setActiveFilter(filter);
    let filtered = [...trendingItems];

    switch (filter) {
      case 'Near Me':
        if (userLocation) {
          filtered = filtered
            .filter(item => item.location)
            .sort((a, b) => {
              if (!a.location || !b.location) return 0;

              const distA = calculateDistance(
                userLocation.latitude,
                userLocation.longitude,
                a.location.latitude,
                a.location.longitude,
              );
              const distB = calculateDistance(
                userLocation.latitude,
                userLocation.longitude,
                b.location.latitude,
                b.location.longitude,
              );
              return distA - distB;
            });
        }
        break;
      case 'High Priority':
        filtered = filtered.filter(item => item.priority === 'high');
        break;
      default:
        // Most Recent
        filtered = filtered
          .filter(item => item.timestamp)
          .sort((a, b) => {
            if (!a.timestamp || !b.timestamp) return 0;
            return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
          });
    }

    setFilteredItems(filtered);
  };

  // Handle item press
  const handleItemPress = (item: Item) => {
    navigation.navigate('ItemDetails', { id: item.id });
  };

  // Handle rare item press
  const handleRareItemPress = (item: Item) => {
    navigation.navigate('ItemDetails', { id: item.id });
  };

  // Handle see all press
  const handleSeeAll = useCallback(() => {
    navigation.navigate('AllTrendingItems', { items: trendingItems });
  }, [navigation]);

  // Handle search submit
  const handleSearchSubmit = useCallback(() => {
    if (searchQuery.trim()) {
      navigation.navigate('SearchResults', { searchQuery: searchQuery.trim() });
    }
  }, [searchQuery, navigation]);

  // Handle camera press
  const handleCameraPress = () => {
    if (isProcessingImage) return;
    navigation.navigate('AIAssistant');
  };

  const handleAIAssistantPress = () => {
    navigation.navigate('AIAssistant');
  };

  useEffect(() => {
    const initializeFeatures = async () => {
      try {
        // Request location permissions
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission Denied', 'Location permission is required for this feature.');
          return;
        }

        // Get current location
        const location = await Location.getCurrentPositionAsync({});
        setUserLocation({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });
      } catch (error) {
        console.error('Error initializing features:', error);
        Alert.alert('Error', 'Failed to initialize app features.');
      }
    };

    initializeFeatures();
  }, []);

  // Render map component
  const renderMap = () => (
    <View style={styles.mapContainer}>
      <HeatmapView
        data={heatmapPoints.map(point => ({
          latitude: point.latitude,
          longitude: point.longitude,
          weight: point.weight,
        }))}
      />
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={[styles.header, { backgroundColor: colors.background }]}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Finders</Text>
        </View>

        <View style={styles.content}>
          {/* Search Bar */}
          <View style={[styles.searchContainer, {
            backgroundColor: colors.card,
            borderRadius: 24,
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 12,
            paddingVertical: 4,
            shadowColor: '#000',
            shadowOpacity: 0.06,
            shadowRadius: 8,
            shadowOffset: { width: 0, height: 2 },
            marginBottom: 24,
          }]}> 
            <Ionicons name="search" size={22} color={colors.secondary} style={{ marginRight: 8 }} />
            <TextInput
              style={{
                flex: 1,
                fontSize: 16,
                color: colors.text,
                backgroundColor: 'transparent',
                paddingVertical: 10,
                paddingHorizontal: 0,
              }}
              placeholder="Search for items..."
              value={searchQuery}
              onChangeText={handleSearchChange}
              placeholderTextColor={colors.secondary}
              returnKeyType="search"
              onSubmitEditing={handleSearchSubmit}
            />
            <TouchableOpacity 
              style={{
                backgroundColor: colors.primary,
                borderRadius: 20,
                padding: 8,
                marginLeft: 8,
                alignItems: 'center',
                justifyContent: 'center',
                height: 40,
                width: 40,
              }} 
              onPress={handleCameraPress}
            >
              <Ionicons name="camera" size={22} color="#fff" />
            </TouchableOpacity>
          </View>

          {/* Quick Filters */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.filtersContainer}
          >
            {filters.map(filter => (
              <TouchableOpacity
                key={filter}
                style={[
                  styles.filterButton,
                  activeFilter === filter && { backgroundColor: colors.primary },
                ]}
                onPress={() => handleFilterSelect(filter)}
              >
                <Text
                  style={[
                    styles.filterText,
                    { color: activeFilter === filter ? colors.background : colors.text },
                  ]}
                >
                  {filter}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* AI Image Search Section */}
          <TouchableOpacity
            style={[styles.aiSearchBox, { backgroundColor: colors.card }]}
            onPress={handleCameraPress}
          >
            <Ionicons name="camera" size={24} color={colors.primary} />
            <Text style={[styles.aiSearchText, { color: colors.text }]}>
              Search with AI Image Recognition
            </Text>
          </TouchableOpacity>

          {/* Trending Items Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Ionicons name="flame" size={22} color={colors.primary} style={{ marginRight: 4 }} />
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Hot Lost Items</Text>
              </View>
              <TouchableOpacity style={styles.seeAllButton} onPress={handleSeeAll}>
                <Text style={[styles.seeAllText, { color: colors.primary }]}>See All</Text>
                <Ionicons name="chevron-forward" size={16} color={colors.primary} />
              </TouchableOpacity>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.trendingScrollContainer}
            >
              {filteredItems.map(item => (
                <TouchableOpacity
                  key={item.id}
                  style={[styles.trendingItemCard, { backgroundColor: colors.card }]}
                  onPress={() => handleItemPress(item)}
                >
                  <Image
                    source={{ uri: item.image }}
                    style={styles.trendingItemImage}
                    resizeMode="cover"
                  />
                  <View style={styles.trendingItemContent}>
                    <Text
                      style={[styles.trendingItemTitle, { color: colors.text }]}
                      numberOfLines={1}
                    >
                      {item.title}
                    </Text>
                    <Text
                      style={[styles.trendingItemDescription, { color: colors.text }]}
                      numberOfLines={2}
                    >
                      {item.description}
                    </Text>
                    <View style={styles.trendingItemFooter}>
                      <View style={styles.trendingItemLocation}>
                        <Ionicons name="location-outline" size={14} color={colors.secondary} />
                        <Text
                          style={[styles.trendingItemLocationText, { color: colors.secondary }]}
                        >
                          {item.location
                            ? `${item.location.latitude.toFixed(2)}, ${item.location.longitude.toFixed(2)}`
                            : 'Location not specified'}
                        </Text>
                      </View>
                      <Text style={[styles.trendingItemPrice, { color: colors.primary }]}>
                        ${item.price.toFixed(2)}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Lost Item Heatmap */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleContainer}>
                <Ionicons name="map-outline" size={24} color={colors.primary} />
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Lost Item Heatmap</Text>
              </View>
            </View>
            {renderMap()}
          </View>

          {/* Community Tips Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleContainer}>
                <Ionicons name="bulb-outline" size={24} color={colors.primary} />
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Community Tips</Text>
              </View>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.tipsContainer}
            >
              {communityTips.map((tip, index) => (
                <View key={index} style={[styles.tipCard, { backgroundColor: colors.card }]}>
                  <Ionicons name="information-circle-outline" size={20} color={colors.primary} />
                  <Text style={[styles.tipText, { color: colors.text }]} numberOfLines={2}>
                    {tip}
                  </Text>
                </View>
              ))}
            </ScrollView>
          </View>

          {/* Rare Items Marketplace */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleContainer}>
                <Ionicons name="diamond-outline" size={24} color={colors.primary} />
                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                  Rare Items Marketplace
                </Text>
              </View>
              <TouchableOpacity
                style={styles.seeAllButton}
                onPress={() => navigation.navigate('SearchResults', { searchQuery: 'rare' })}
              >
                <Text style={[styles.seeAllText, { color: colors.primary }]}>See All</Text>
                <Ionicons name="chevron-forward" size={16} color={colors.primary} />
              </TouchableOpacity>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.rareItemsScrollContainer}
            >
              {rareItems.map(item => (
                <TouchableOpacity
                  key={item.id}
                  style={[styles.rareItemCard, { backgroundColor: colors.card }]}
                  onPress={() => handleRareItemPress(item)}
                >
                  <Image
                    source={{ uri: item.image }}
                    style={styles.rareItemImage}
                    resizeMode="cover"
                  />
                  <View style={styles.rareItemContent}>
                    <View style={styles.rareItemHeader}>
                      <Text
                        style={[styles.rareItemTitle, { color: colors.text }]}
                        numberOfLines={1}
                      >
                        {item.title}
                      </Text>
                      <View
                        style={[styles.rarityBadge, { backgroundColor: colors.primary + '20' }]}
                      >
                        <Text style={[styles.rarityText, { color: colors.primary }]}>
                          {item.rarity}
                        </Text>
                      </View>
                    </View>
                    <Text
                      style={[styles.rareItemDescription, { color: colors.text }]}
                      numberOfLines={2}
                    >
                      {item.description}
                    </Text>
                    <View style={styles.rareItemFooter}>
                      <View style={styles.rareItemLocation}>
                        <Ionicons name="location-outline" size={14} color={colors.secondary} />
                        <Text style={[styles.rareItemLocationText, { color: colors.secondary }]}>
                          {item.location
                            ? `${item.location.latitude.toFixed(2)}, ${item.location.longitude.toFixed(2)}`
                            : 'Location not specified'}
                        </Text>
                      </View>
                      <View style={styles.rewardContainer}>
                        <Ionicons name="gift-outline" size={14} color={colors.primary} />
                        <Text style={[styles.rareItemPrice, { color: colors.primary }]}>
                          ${item.price.toLocaleString()} Reward
                        </Text>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>

        {isSearching && (
          <View style={[styles.loadingOverlay, { backgroundColor: colors.background + '80' }]}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  aiSearchBox: {
    alignItems: 'center',
    borderRadius: 16,
    flexDirection: 'row',
    gap: 12,
    marginBottom: 32,
    padding: 16,
  },
  aiSearchText: {
    fontSize: 16,
    fontWeight: '600',
  },
  cameraButton: {
    backgroundColor: '#E0E0E0',
    borderRadius: 20,
    padding: 8,
  },
  container: {
    backgroundColor: '#FFFFFF',
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
  },
  filterButton: {
    borderColor: '#E0E0E0',
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
  },
  filtersContainer: {
    marginBottom: 24,
    paddingLeft: 4,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingBottom: 20,
    paddingHorizontal: 20,
    paddingTop: 60,
  },
  headerTitle: {
    fontSize: 34,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  mapContainer: {
    borderRadius: 16,
    height: 200,
    marginBottom: 24,
    overflow: 'hidden',
  },
  rareItemCard: {
    borderRadius: 16,
    elevation: 3,
    marginRight: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    width: 280,
  },
  rareItemContent: {
    padding: 12,
  },
  rareItemDescription: {
    fontSize: 14,
    lineHeight: 18,
    marginBottom: 8,
    opacity: 0.8,
  },
  rareItemFooter: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  rareItemHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  rareItemImage: {
    backgroundColor: '#f5f5f5',
    height: 160,
    width: '100%',
  },
  rareItemLocation: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 4,
  },
  rareItemLocationText: {
    fontSize: 12,
  },
  rareItemPrice: {
    fontSize: 16,
    fontWeight: '600',
  },
  rareItemTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
  rareItemsScrollContainer: {
    gap: 16,
    paddingLeft: 4,
    paddingRight: 24,
  },
  rarityBadge: {
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  rarityText: {
    fontSize: 12,
    fontWeight: '600',
  },
  rewardContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 4,
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    flexGrow: 1,
  },
  searchContainer: {
    alignItems: 'center',
    borderRadius: 16,
    flexDirection: 'row',
    marginBottom: 24,
    padding: 16,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 8,
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  sectionTitleContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  seeAllButton: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 4,
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: '600',
  },
  tipCard: {
    alignItems: 'center',
    borderRadius: 16,
    elevation: 3,
    flexDirection: 'row',
    gap: 8,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    width: 280,
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
  },
  tipsContainer: {
    gap: 16,
    paddingLeft: 4,
    paddingRight: 24,
  },
  trendingItemCard: {
    borderRadius: 16,
    elevation: 3,
    marginRight: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    width: 280,
  },
  trendingItemContent: {
    padding: 12,
  },
  trendingItemDescription: {
    fontSize: 14,
    lineHeight: 18,
    marginBottom: 8,
    opacity: 0.8,
  },
  trendingItemFooter: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  trendingItemImage: {
    backgroundColor: '#f5f5f5',
    height: 160,
    width: '100%',
  },
  trendingItemLocation: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 4,
  },
  trendingItemLocationText: {
    fontSize: 12,
  },
  trendingItemPrice: {
    fontSize: 16,
    fontWeight: '600',
  },
  trendingItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  trendingScrollContainer: {
    gap: 16,
    paddingLeft: 4,
    paddingRight: 24,
  },
});
