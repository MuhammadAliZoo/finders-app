"use client"

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
} from "react-native"
import { useNavigation } from "@react-navigation/native"
import type { NativeStackNavigationProp } from "@react-navigation/native-stack"
import { Ionicons } from "@expo/vector-icons"
import { useTheme } from "../theme/ThemeContext"
import { ItemCard } from "../components/ItemCard"
import MapView, { Heatmap, PROVIDER_GOOGLE } from "react-native-maps"
import { RootStackParamList } from "../navigation/types"
import * as ImagePicker from 'expo-image-picker';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import { check, PERMISSIONS, request, RESULTS } from 'react-native-permissions';
import { processImageWithAI } from '../utils/ai';
import { Item } from '../types/item';
import * as Location from 'expo-location';
import Voice, {
  SpeechResultsEvent,
  SpeechErrorEvent
} from '@react-native-voice/voice';
import { debounce } from 'lodash';
import { SafeAreaView } from 'react-native-safe-area-context';

// Mock data with images
const trendingItems: Item[] = [
  {
    id: "1",
    title: "Black Wallet",
    description: "Found at Central Park, leather material",
    price: 0,
    image: "https://picsum.photos/200/300",
    location: {
      latitude: 40.7829,
      longitude: -73.9654
    },
    timestamp: "2024-03-20T10:30:00Z",
    priority: "high",
    category: "accessories",
    rarity: "Common"
  },
  {
    id: "2",
    title: "iPhone 13",
    description: "Lost at Coffee Shop, black color with clear case",
    price: 0,
    image: "https://picsum.photos/200/301",
    location: {
      latitude: 40.7831,
      longitude: -73.9652
    },
    timestamp: "2024-03-19T15:45:00Z",
    priority: "medium",
    category: "electronics",
    rarity: "Common"
  },
  {
    id: "3",
    title: "House Keys",
    description: "Found on Main Street, has a red keychain",
    price: 0,
    image: "https://picsum.photos/200/302",
    location: {
      latitude: 40.7833,
      longitude: -73.9650
    },
    timestamp: "2024-03-18T09:15:00Z",
    priority: "low",
    category: "accessories",
    rarity: "Common"
  },
  {
    id: "4",
    title: "Backpack",
    description: "Lost at Library, navy blue color with laptop inside",
    price: 0,
    image: "https://picsum.photos/200/303",
    location: {
      latitude: 40.7835,
      longitude: -73.9648
    },
    timestamp: "2024-03-17T14:20:00Z",
    priority: "high",
    category: "accessories",
    rarity: "Common"
  },
]

// Add community tips data
const communityTips = [
  "Check local lost and found centers",
  "Post on social media with clear photos",
  "Use specific keywords in your search",
  "Visit the location where you lost the item",
  "Check with local businesses nearby"
]

// Add rare items data
const rareItems: Item[] = [
  {
    id: "r1",
    title: "Vintage Rolex Watch",
    description: "Found at Luxury Hotel, 1960s model",
    price: 15000,
    image: "https://picsum.photos/200/304",
    isRare: true,
    rarity: "Extremely Rare",
    location: {
      latitude: 40.7837,
      longitude: -73.9646
    },
    timestamp: "2024-03-16T11:10:00Z",
    priority: "high",
    category: "jewelry"
  },
  {
    id: "r2",
    title: "Antique Diamond Ring",
    description: "Found at Museum, Victorian era",
    price: 25000,
    image: "https://picsum.photos/200/305",
    isRare: true,
    rarity: "Very Rare",
    location: {
      latitude: 40.7839,
      longitude: -73.9644
    },
    timestamp: "2024-03-15T16:30:00Z",
    priority: "high",
    category: "jewelry"
  },
  {
    id: "r3",
    title: "Rare Coin Collection",
    description: "Found at Bank, 19th century coins",
    price: 5000,
    image: "https://picsum.photos/200/306",
    isRare: true,
    rarity: "Rare",
    location: {
      latitude: 40.7841,
      longitude: -73.9642
    },
    timestamp: "2024-03-14T13:45:00Z",
    priority: "medium",
    category: "other"
  },
  {
    id: "r4",
    title: "Limited Edition Artwork",
    description: "Found at Gallery, signed by artist",
    price: 10000,
    image: "https://picsum.photos/200/307",
    isRare: true,
    rarity: "Rare",
    location: {
      latitude: 40.7843,
      longitude: -73.9640
    },
    timestamp: "2024-03-13T10:20:00Z",
    priority: "low",
    category: "other"
  },
]

// Mock heatmap data
const heatmapPoints = [
  { latitude: 37.78825, longitude: -122.4324, weight: 1 },
  { latitude: 37.78925, longitude: -122.4344, weight: 1 },
  { latitude: 37.78925, longitude: -122.4314, weight: 1 },
  { latitude: 37.78725, longitude: -122.4324, weight: 1 },
  { latitude: 37.78625, longitude: -122.4334, weight: 1 },
]

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

export const HomeScreen = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const { colors } = useTheme()
  const [searchQuery, setSearchQuery] = useState("")
  const [activeFilter, setActiveFilter] = useState("Most Recent")
  const [filteredItems, setFilteredItems] = useState<Item[]>(trendingItems)
  const [isSearching, setIsSearching] = useState(false)
  const [isProcessingImage, setIsProcessingImage] = useState(false)
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null)
  const [feedbackMessage, setFeedbackMessage] = useState<string>('');
  const [isVoiceAvailable, setIsVoiceAvailable] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const isMounted = useRef(true)
  const [error, setError] = useState<string | null>(null);
  const [mapReady, setMapReady] = useState(false);

  const filters = ["Most Recent", "Near Me", "High Priority"]

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce((query: string) => {
      if (!isMounted.current) return;
      
      setIsSearching(true);
      try {
        const filtered = trendingItems.filter(item =>
          item.title.toLowerCase().includes(query.toLowerCase()) ||
          item.description.toLowerCase().includes(query.toLowerCase())
        );
        setFilteredItems(filtered);
      } catch (error) {
        console.error('Search error:', error);
        setError('Error performing search');
      } finally {
        setIsSearching(false);
      }
    }, 300),
    []
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
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2); 
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    return R * c; // Distance in km
  };

  const deg2rad = (deg: number) => {
    return deg * (Math.PI/180);
  };

  // Handle filter selection
  const handleFilterSelect = (filter: string) => {
    setActiveFilter(filter);
    let filtered = [...trendingItems];
    
    switch (filter) {
      case "Near Me":
        if (userLocation) {
          filtered = filtered.filter(item => item.location).sort((a, b) => {
            if (!a.location || !b.location) return 0;
            
            const distA = calculateDistance(
              userLocation.latitude,
              userLocation.longitude,
              a.location.latitude,
              a.location.longitude
            );
            const distB = calculateDistance(
              userLocation.latitude,
              userLocation.longitude,
              b.location.latitude,
              b.location.longitude
            );
            return distA - distB;
          });
        }
        break;
      case "High Priority":
        filtered = filtered.filter(item => item.priority === "high");
        break;
      default:
        // Most Recent
        filtered = filtered.filter(item => item.timestamp).sort((a, b) => {
          if (!a.timestamp || !b.timestamp) return 0;
          return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
        });
    }
    
    setFilteredItems(filtered);
  };

  // Handle item press
  const handleItemPress = (item: Item) => {
    navigation.navigate('ItemDetails', { itemId: item.id });
  };

  // Handle rare item press
  const handleRareItemPress = (item: Item) => {
    navigation.navigate('ItemDetails', { itemId: item.id });
  };

  // Handle see all press
  const handleSeeAll = () => {
    navigation.navigate('Tabs', {
      screen: 'Search',
      params: { searchQuery: '' }
    });
  };

  // Handle camera press
  const handleCameraPress = () => {
    if (isProcessingImage) return;
    navigation.navigate('AIAssistant');
  };

  // Voice recognition handlers
  const startVoiceRecognition = async () => {
    try {
      if (!isVoiceAvailable) {
        Alert.alert('Error', 'Voice recognition is not available');
        return;
      }
      await Voice.start('en-US');
      setIsRecording(true);
    } catch (error) {
      console.error('Voice recognition error:', error);
      setIsRecording(false);
    }
  };

  const stopVoiceRecognition = async () => {
    try {
      await Voice.stop();
      setIsRecording(false);
    } catch (error) {
      console.error('Error stopping voice recognition:', error);
      setIsRecording(false);
    }
  };

  // Initialize features
  useEffect(() => {
    const initializeFeatures = async () => {
      try {
        // Check and request microphone permission
        const micPermission = await check(PERMISSIONS.IOS.MICROPHONE);
        if (micPermission === RESULTS.DENIED) {
          const permissionResult = await request(PERMISSIONS.IOS.MICROPHONE);
          setIsVoiceAvailable(permissionResult === RESULTS.GRANTED);
        } else {
          setIsVoiceAvailable(micPermission === RESULTS.GRANTED);
        }

        // Check and request location permission
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          const location = await Location.getCurrentPositionAsync({});
          setUserLocation({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude
          });
        }
      } catch (error) {
        console.error('Error initializing features:', error);
      }
    };

    initializeFeatures();

    // Voice recognition event listeners
    Voice.onSpeechResults = (e: SpeechResultsEvent) => {
      if (e.value) {
        setSearchQuery(e.value[0]);
        debouncedSearch(e.value[0]);
      }
    };

    Voice.onSpeechError = (e: SpeechErrorEvent) => {
      console.error('Speech error:', e.error);
      setIsRecording(false);
    };

    return () => {
      isMounted.current = false;
      Voice.destroy().then(Voice.removeAllListeners);
    };
  }, []);

  // Render map component
  const renderMap = () => (
    <View style={styles.mapContainer}>
      <MapView
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={{
          latitude: userLocation?.latitude || 37.78825,
          longitude: userLocation?.longitude || -122.4324,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
        onMapReady={() => setMapReady(true)}
      >
        {mapReady && (
          <Heatmap
            points={heatmapPoints}
            radius={50}
            opacity={0.7}
            gradient={{
              colors: ["#00ff00", "#ff0000"],
              startPoints: [0.1, 1],
              colorMapSize: 256
            }}
          />
        )}
      </MapView>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
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
          <View style={[styles.searchContainer, { backgroundColor: colors.card }]}>
            <View style={styles.searchInputContainer}>
              <Ionicons name="search" size={20} color={colors.secondary} />
              <TextInput
                style={[styles.searchInput, { color: colors.text }]}
                placeholder="Search items..."
                value={searchQuery}
                onChangeText={handleSearchChange}
                placeholderTextColor={colors.secondary}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <Ionicons name="close-circle" size={20} color={colors.secondary} />
                </TouchableOpacity>
              )}
              <TouchableOpacity onPress={isRecording ? stopVoiceRecognition : startVoiceRecognition}>
                <Ionicons 
                  name={isRecording ? "mic" : "mic-outline"} 
                  size={24} 
                  color={isRecording ? colors.primary : colors.secondary} 
                />
              </TouchableOpacity>
              <TouchableOpacity onPress={handleCameraPress}>
                <Ionicons name="camera-outline" size={24} color={colors.secondary} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Quick Filters */}
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.filtersContainer}
          >
            {filters.map((filter) => (
              <TouchableOpacity
                key={filter}
                style={[
                  styles.filterButton,
                  activeFilter === filter && { backgroundColor: colors.primary }
                ]}
                onPress={() => handleFilterSelect(filter)}
              >
                <Text
                  style={[
                    styles.filterText,
                    { color: activeFilter === filter ? colors.background : colors.text }
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
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Trending Items
              </Text>
              <TouchableOpacity 
                style={styles.seeAllButton}
                onPress={handleSeeAll}
              >
                <Text style={[styles.seeAllText, { color: colors.primary }]}>
                  See All
                </Text>
                <Ionicons name="chevron-forward" size={16} color={colors.primary} />
              </TouchableOpacity>
            </View>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.trendingScrollContainer}
            >
              {filteredItems.map((item) => (
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
                    <Text style={[styles.trendingItemTitle, { color: colors.text }]} numberOfLines={1}>
                      {item.title}
                    </Text>
                    <Text style={[styles.trendingItemDescription, { color: colors.text }]} numberOfLines={2}>
                      {item.description}
                    </Text>
                    <View style={styles.trendingItemFooter}>
                      <View style={styles.trendingItemLocation}>
                        <Ionicons name="location-outline" size={14} color={colors.secondary} />
                        <Text style={[styles.trendingItemLocationText, { color: colors.secondary }]}>
                          {item.location ? `${item.location.latitude.toFixed(2)}, ${item.location.longitude.toFixed(2)}` : 'Location not specified'}
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
                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                  Lost Item Heatmap
                </Text>
              </View>
            </View>
            {renderMap()}
          </View>

          {/* Community Tips Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleContainer}>
                <Ionicons name="bulb-outline" size={24} color={colors.primary} />
                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                  Community Tips
                </Text>
              </View>
            </View>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.tipsContainer}
            >
              {communityTips.map((tip, index) => (
                <View 
                  key={index}
                  style={[styles.tipCard, { backgroundColor: colors.card }]}
                >
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
                onPress={() => navigation.navigate('Tabs', {
                  screen: 'Search',
                  params: { searchQuery: 'rare' }
                })}
              >
                <Text style={[styles.seeAllText, { color: colors.primary }]}>
                  See All
                </Text>
                <Ionicons name="chevron-forward" size={16} color={colors.primary} />
              </TouchableOpacity>
            </View>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.rareItemsScrollContainer}
            >
              {rareItems.map((item) => (
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
                      <Text style={[styles.rareItemTitle, { color: colors.text }]} numberOfLines={1}>
                        {item.title}
                      </Text>
                      <View style={[styles.rarityBadge, { backgroundColor: colors.primary + '20' }]}>
                        <Text style={[styles.rarityText, { color: colors.primary }]}>
                          {item.rarity}
                        </Text>
                      </View>
                    </View>
                    <Text style={[styles.rareItemDescription, { color: colors.text }]} numberOfLines={2}>
                      {item.description}
                    </Text>
                    <View style={styles.rareItemFooter}>
                      <View style={styles.rareItemLocation}>
                        <Ionicons name="location-outline" size={14} color={colors.secondary} />
                        <Text style={[styles.rareItemLocationText, { color: colors.secondary }]}>
                          {item.location ? `${item.location.latitude.toFixed(2)}, ${item.location.longitude.toFixed(2)}` : 'Location not specified'}
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
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    flexGrow: 1,
  },
  content: {
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 34,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  searchContainer: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 24,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 8,
  },
  filtersContainer: {
    marginBottom: 24,
    paddingLeft: 4,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
  },
  aiSearchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    marginBottom: 32,
    gap: 12,
  },
  aiSearchText: {
    fontSize: 16,
    fontWeight: '600',
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: '600',
  },
  mapContainer: {
    height: 200,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 24,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  trendingScrollContainer: {
    paddingLeft: 4,
    paddingRight: 24,
    gap: 16,
  },
  trendingItemCard: {
    width: 280,
    borderRadius: 16,
    overflow: 'hidden',
    marginRight: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  trendingItemImage: {
    width: '100%',
    height: 160,
    backgroundColor: '#f5f5f5',
  },
  trendingItemContent: {
    padding: 12,
  },
  trendingItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  trendingItemDescription: {
    fontSize: 14,
    marginBottom: 8,
    opacity: 0.8,
    lineHeight: 18,
  },
  trendingItemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  trendingItemLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  trendingItemLocationText: {
    fontSize: 12,
  },
  trendingItemPrice: {
    fontSize: 16,
    fontWeight: '600',
  },
  rareItemsScrollContainer: {
    paddingLeft: 4,
    paddingRight: 24,
    gap: 16,
  },
  rareItemCard: {
    width: 280,
    borderRadius: 16,
    overflow: 'hidden',
    marginRight: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  rareItemImage: {
    width: '100%',
    height: 160,
    backgroundColor: '#f5f5f5',
  },
  rareItemContent: {
    padding: 12,
  },
  rareItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  rareItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
    marginRight: 8,
  },
  rarityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  rarityText: {
    fontSize: 12,
    fontWeight: '600',
  },
  rareItemDescription: {
    fontSize: 14,
    marginBottom: 8,
    opacity: 0.8,
    lineHeight: 18,
  },
  rareItemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rareItemLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  rareItemLocationText: {
    fontSize: 12,
  },
  rareItemPrice: {
    fontSize: 16,
    fontWeight: '600',
  },
  rewardContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tipsContainer: {
    paddingLeft: 4,
    paddingRight: 24,
    gap: 16,
  },
  tipCard: {
    padding: 12,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    width: 280,
  },
  tipText: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
})

