import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Dimensions,
  StatusBar,
  ActivityIndicator,
  ScrollView,
  TextInput,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { MainStackParamList } from '../navigation/types';
import { Item } from '../types/item';
import { supabase } from '../config/supabase';

type AllTrendingItemsScreenProps = {
  navigation: NativeStackNavigationProp<MainStackParamList>;
  route: {
    params: {
      items: Item[];
    };
  };
};

// Mock data for lost items
const mockLostItems: Item[] = [
  {
    id: '1',
    title: 'Lost iPhone 13',
    description: 'Black iPhone 13 lost in Central Park area',
    image: 'https://picsum.photos/200',
    location: { latitude: 40.7829, longitude: -73.9654 },
    category: 'electronics',
    timestamp: '2024-05-01T10:00:00Z',
    priority: 'high',
    price: 0,
    rarity: 'Common',
  },
  {
    id: '2',
    title: 'Gold Watch',
    description: 'Vintage gold watch lost near Times Square',
    image: 'https://picsum.photos/201',
    location: { latitude: 40.7580, longitude: -73.9855 },
    category: 'accessories',
    timestamp: '2024-05-02T12:00:00Z',
    priority: 'medium',
    price: 0,
    rarity: 'Uncommon',
  },
  {
    id: '3',
    title: 'Antique Ring',
    description: 'Family heirloom lost in Brooklyn',
    image: 'https://picsum.photos/202',
    location: { latitude: 40.6782, longitude: -73.9442 },
    category: 'jewelry',
    timestamp: '2024-05-03T14:00:00Z',
    priority: 'high',
    price: 0,
    rarity: 'Very Rare',
  },
  {
    id: '4',
    title: 'Lost Backpack',
    description: 'Blue backpack with school books lost on subway',
    image: 'https://picsum.photos/203',
    location: { latitude: 40.7306, longitude: -73.9352 },
    category: 'other',
    timestamp: '2024-05-04T16:00:00Z',
    priority: 'low',
    price: 0,
    rarity: 'Common',
  },
  {
    id: '5',
    title: 'Lost Keys',
    description: 'Set of car keys with red keychain lost in Manhattan',
    image: 'https://picsum.photos/204',
    location: { latitude: 40.7128, longitude: -74.0060 },
    category: 'accessories',
    timestamp: '2024-05-05T18:00:00Z',
    priority: 'medium',
    price: 0,
    rarity: 'Common',
  },
  {
    id: '6',
    title: 'Lost Headphones',
    description: 'Wireless headphones lost at the gym',
    image: 'https://picsum.photos/205',
    location: { latitude: 40.7128, longitude: -74.0059 },
    category: 'electronics',
    timestamp: '2024-05-06T20:00:00Z',
    priority: 'low',
    price: 0,
    rarity: 'Uncommon',
  },
];

export const AllTrendingItemsScreen: React.FC<AllTrendingItemsScreenProps> = ({
  navigation,
  route,
}) => {
  const { colors } = useTheme();
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchItems = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data, error } = await supabase
          .from('items')
          .select('*')
          .eq('status', 'lost')
          .order('created_at', { ascending: false });
        if (error) throw error;
        setItems((data && data.length > 0) ? data : mockLostItems);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch items');
      } finally {
        setLoading(false);
      }
    };
    fetchItems();
  }, []);

  // Filter and group items by category
  const filteredItems = items.filter(item =>
    item.title.toLowerCase().includes(search.toLowerCase()) ||
    item.description.toLowerCase().includes(search.toLowerCase())
  );
  const categories = Array.from(new Set(filteredItems.map(item => item.category)));
  const itemsByCategory = categories.map(category => ({
    category,
    items: filteredItems.filter(item => item.category === category),
  }));

  const screenWidth = Dimensions.get('window').width;
  const itemWidth = (screenWidth - 40) / 2; // for horizontal scroll, can be smaller

  const renderItemCard = (item: Item) => (
    <TouchableOpacity
      key={item.id}
      style={[styles.itemCard, { backgroundColor: colors.card, width: itemWidth, marginRight: 12 }]}
      onPress={() => navigation.navigate('ItemDetails', { id: item.id })}
    >
      <Image source={{ uri: item.image }} style={styles.itemImage} resizeMode="cover" />
      <View style={styles.itemContent}>
        <Text style={[styles.itemTitle, { color: colors.text }]} numberOfLines={1}>{item.title}</Text>
        <Text style={[styles.itemDescription, { color: colors.text }]} numberOfLines={2}>{item.description}</Text>
        <View style={styles.itemFooter}>
          <View style={styles.itemLocation}>
            <Ionicons name="location-outline" size={14} color={colors.secondary} />
            <Text style={[styles.itemLocationText, { color: colors.secondary }]} numberOfLines={1}>
              {item.location ? `${item.location.latitude.toFixed(2)}, ${item.location.longitude.toFixed(2)}` : 'Location not specified'}
            </Text>
          </View>
          <Text style={{ color: colors.secondary, fontSize: 12 }}>{new Date(item.timestamp).toLocaleDateString()}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading) return <ActivityIndicator style={{ marginTop: 40 }} />;
  if (error) return <Text style={{ color: colors.error, margin: 20 }}>{error}</Text>;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}> 
      <StatusBar barStyle="light-content" />
      <View style={[styles.header, { backgroundColor: colors.background }]}> 
        <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
          <Ionicons name="storefront-outline" size={28} color={colors.primary} style={{ marginRight: 8 }} />
          <Text style={[styles.title, { color: colors.text }]}>Trending Items</Text>
        </View>
        <View style={styles.headerRight} />
      </View>
      {/* Search Bar */}
      <View style={{ paddingHorizontal: 16, marginBottom: 16 }}>
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: colors.card,
          borderRadius: 24,
          paddingHorizontal: 12,
          paddingVertical: 4,
          shadowColor: '#000',
          shadowOpacity: 0.06,
          shadowRadius: 8,
          shadowOffset: { width: 0, height: 2 },
        }}>
          <Ionicons name="search" size={20} color={colors.secondary} style={{ marginRight: 8 }} />
          <TextInput
            style={{ flex: 1, fontSize: 16, color: colors.text, backgroundColor: 'transparent', paddingVertical: 10, paddingHorizontal: 0 }}
            placeholder="Search lost items..."
            value={search}
            onChangeText={setSearch}
            placeholderTextColor={colors.secondary}
            returnKeyType="search"
          />
        </View>
      </View>
      <ScrollView contentContainerStyle={{ paddingBottom: 32 }} showsVerticalScrollIndicator={false}>
        {itemsByCategory.length === 0 ? (
          <Text style={{ color: colors.text, textAlign: 'center', marginTop: 32 }}>No lost items found.</Text>
        ) : (
          itemsByCategory.map(({ category, items }) => (
            <View key={category} style={{ marginBottom: 28 }}>
              <Text style={{ fontSize: 18, fontWeight: 'bold', color: colors.primary, marginLeft: 16, marginBottom: 10 }}>{category}</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingLeft: 16, paddingRight: 8 }}>
                {items.map(renderItemCard)}
              </ScrollView>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  backButton: {
    borderRadius: 12,
    marginRight: 8,
    padding: 8,
  },
  columnWrapper: {
    gap: 8,
    justifyContent: 'space-between',
  },
  container: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 16,
    paddingHorizontal: 16,
    paddingTop: 60,
  },
  headerRight: {
    width: 40,
  },
  itemCard: {
    borderRadius: 16,
    elevation: 5,
    marginBottom: 8,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  itemContent: {
    gap: 8,
    padding: 12,
  },
  itemDescription: {
    fontSize: 13,
    lineHeight: 18,
    opacity: 0.8,
  },
  itemFooter: {
    gap: 8,
  },
  itemImage: {
    aspectRatio: 1,
    backgroundColor: '#f5f5f5',
    width: '100%',
  },
  itemLocation: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 4,
  },
  itemLocationText: {
    flex: 1,
    fontSize: 11,
  },
  itemPrice: {
    fontSize: 13,
    fontWeight: '600',
  },
  itemTitle: {
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 20,
  },
  listContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  priceTag: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderRadius: 8,
    flexDirection: 'row',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  rarityBadge: {
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    position: 'absolute',
    right: 8,
    top: 8,
  },
  rarityText: {
    fontSize: 11,
    fontWeight: '600',
  },
  title: {
    flex: 1,
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: -0.5,
    textAlign: 'left',
  },
});
