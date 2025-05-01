import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  TextInput,
  ScrollView,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';
import { MainStackParamList } from '../navigation/types';
import { Item } from '../types/item';
import { debounce } from 'lodash';
import { supabase } from '../config/supabase';

type Props = NativeStackScreenProps<MainStackParamList, 'RareItemsMarketplace'>;

const SORT_OPTIONS = [
  { id: 'price_high', label: 'Highest Reward', icon: 'trending-up' },
  { id: 'price_low', label: 'Lowest Reward', icon: 'trending-down' },
  { id: 'recent', label: 'Most Recent', icon: 'time' },
  { id: 'oldest', label: 'Oldest', icon: 'time-outline' },
];

const CATEGORIES = [
  { id: 'all', label: 'All Items', icon: 'grid' },
  { id: 'jewelry', label: 'Jewelry', icon: 'diamond' },
  { id: 'electronics', label: 'Electronics', icon: 'phone-portrait' },
  { id: 'documents', label: 'Documents', icon: 'document-text' },
  { id: 'accessories', label: 'Accessories', icon: 'bag' },
  { id: 'vehicle', label: 'Vehicle', icon: 'car' },
  { id: 'others', label: 'Others', icon: 'ellipsis-horizontal' },
];

export const RareItemsMarketplaceScreen: React.FC<Props> = ({ navigation, route }) => {
  const { colors } = useTheme();
  const { items } = route.params;
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSort, setSelectedSort] = useState('recent');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isLoading, setIsLoading] = useState(false);
  const [localItems, setLocalItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const debouncedSearch = useCallback(
    debounce((query: string) => {
      setIsLoading(false);
    }, 300),
    [],
  );

  const handleSearch = (text: string) => {
    setSearchQuery(text);
    setIsLoading(true);
    debouncedSearch(text);
  };

  useEffect(() => {
    const fetchItems = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data, error } = await supabase
          .from('items')
          .select('*')
          .order('created_at', { ascending: false });
        if (error) throw error;
        setLocalItems(data || []);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch items');
      } finally {
        setLoading(false);
      }
    };
    fetchItems();
  }, []);

  const filteredItems = localItems
    .filter((item: Item) => {
      // First filter by search query
      const searchLower = searchQuery.toLowerCase().trim();
      if (searchLower !== '') {
        const titleMatch = item.title.toLowerCase().includes(searchLower);
        const descriptionMatch = item.description.toLowerCase().includes(searchLower);
        if (!titleMatch && !descriptionMatch) return false;
      }

      // Then filter by category
      if (selectedCategory === 'all') return true;
      return item.category === selectedCategory;
    })
    .sort((a: Item, b: Item) => {
      const timestampA = a.timestamp ? new Date(a.timestamp).getTime() : 0;
      const timestampB = b.timestamp ? new Date(b.timestamp).getTime() : 0;

      switch (selectedSort) {
        case 'price_high':
          return b.price - a.price;
        case 'price_low':
          return a.price - b.price;
        case 'recent':
          return timestampB - timestampA;
        case 'oldest':
          return timestampA - timestampB;
        default:
          return 0;
      }
    });

  const renderItem = ({ item }: { item: Item }) => (
    <TouchableOpacity
      style={[styles.itemCard, { backgroundColor: colors.card }]}
      onPress={() => navigation.navigate('ItemDetails', { id: item.id })}
    >
      <Image source={{ uri: item.image }} style={styles.itemImage} resizeMode="cover" />
      <View style={styles.itemContent}>
        <View style={styles.itemHeader}>
          <Text style={[styles.itemTitle, { color: colors.text }]} numberOfLines={1}>
            {item.title}
          </Text>
          <View style={[styles.rarityBadge, { backgroundColor: colors.primary + '20' }]}>
            <Text style={[styles.rarityText, { color: colors.primary }]}>{item.rarity}</Text>
          </View>
        </View>
        <Text style={[styles.itemDescription, { color: colors.text }]} numberOfLines={2}>
          {item.description}
        </Text>
        <View style={styles.itemFooter}>
          <View style={styles.itemLocation}>
            <Ionicons name="location-outline" size={14} color={colors.secondary} />
            <Text style={[styles.locationText, { color: colors.secondary }]}>
              {item.location
                ? `${item.location.latitude.toFixed(2)}, ${item.location.longitude.toFixed(2)}`
                : 'Location not specified'}
            </Text>
          </View>
          <View style={styles.rewardContainer}>
            <Ionicons name="gift-outline" size={14} color={colors.primary} />
            <Text style={[styles.rewardText, { color: colors.primary }]}>
              ${item.price.toLocaleString()} Reward
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading) return <ActivityIndicator style={{ marginTop: 40 }} />;
  if (error) return <Text style={{ color: colors.error, margin: 20 }}>{error}</Text>;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.background }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]} numberOfLines={1}>
          Rare Items Marketplace
        </Text>
        <View style={styles.headerRight} />
      </View>

      <View style={styles.content}>
        <View style={[styles.searchContainer, { backgroundColor: colors.card }]}>
          <Ionicons name="search" size={20} color={colors.secondary} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search rare items..."
            placeholderTextColor={colors.secondary}
            value={searchQuery}
            onChangeText={handleSearch}
          />
          {isLoading && <ActivityIndicator size="small" color={colors.primary} />}
        </View>

        <View style={styles.filtersWrapper}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.categoriesContainer}
            contentContainerStyle={{ flexDirection: 'row', gap: 8 }}
          >
            {CATEGORIES.map(category => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryButton,
                  {
                    backgroundColor: selectedCategory === category.id ? colors.primary : '#F5F5F5',
                  },
                ]}
                onPress={() => setSelectedCategory(category.id)}
              >
                <Ionicons
                  name={category.icon as any}
                  size={16}
                  color={selectedCategory === category.id ? colors.background : colors.text}
                />
                <Text
                  style={[
                    styles.categoryText,
                    { color: selectedCategory === category.id ? colors.background : colors.text },
                  ]}
                  numberOfLines={1}
                >
                  {category.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.sortOptionsContainer}
            contentContainerStyle={{ flexDirection: 'row', gap: 8 }}
          >
            {SORT_OPTIONS.map(option => (
              <TouchableOpacity
                key={option.id}
                style={[
                  styles.sortButton,
                  {
                    backgroundColor: selectedSort === option.id ? colors.primary : '#F5F5F5',
                  },
                ]}
                onPress={() => setSelectedSort(option.id)}
              >
                <Ionicons
                  name={option.icon as any}
                  size={16}
                  color={selectedSort === option.id ? colors.background : colors.text}
                />
                <Text
                  style={[
                    styles.sortText,
                    { color: selectedSort === option.id ? colors.background : colors.text },
                  ]}
                  numberOfLines={1}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.listWrapper}>
          {filteredItems.length === 0 ? (
            <View style={styles.emptyStateContainer}>
              <Ionicons name="search-outline" size={48} color={colors.secondary} />
              <Text style={[styles.emptyStateText, { color: colors.text }]}>
                No items found in this category
              </Text>
              <Text style={[styles.emptyStateSubtext, { color: colors.secondary }]}>
                Try selecting a different category or adjusting your search
              </Text>
            </View>
          ) : (
            <FlatList
              data={filteredItems}
              renderItem={renderItem}
              keyExtractor={item => item.id}
              numColumns={2}
              contentContainerStyle={styles.listContainer}
              showsVerticalScrollIndicator={false}
              columnWrapperStyle={styles.columnWrapper}
            />
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  backButton: {
    marginRight: 8,
    padding: 8,
  },
  categoriesContainer: {
    height: 36,
  },
  categoryButton: {
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 20,
    flexDirection: 'row',
    gap: 4,
    height: 36,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  categoryText: {
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 18,
  },
  columnWrapper: {
    gap: 12,
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  emptyStateContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  emptyStateSubtext: {
    fontSize: 14,
    marginTop: 8,
    opacity: 0.8,
    textAlign: 'center',
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    textAlign: 'center',
  },
  filtersWrapper: {
    gap: 8,
    marginBottom: 16,
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
  headerTitle: {
    flex: 1,
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: -0.5,
    textAlign: 'left',
  },
  itemCard: {
    borderRadius: 16,
    elevation: 3,
    flex: 1,
    maxWidth: '48%',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  itemContent: {
    padding: 12,
  },
  itemDescription: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 8,
    opacity: 0.8,
  },
  itemFooter: {
    gap: 8,
  },
  itemHeader: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'space-between',
    marginBottom: 8,
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
  itemTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 20,
  },
  listContainer: {
    paddingVertical: 16,
  },
  listWrapper: {
    flex: 1,
  },
  locationText: {
    flex: 1,
    fontSize: 11,
  },
  rarityBadge: {
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  rarityText: {
    fontSize: 11,
    fontWeight: '600',
  },
  rewardContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 4,
  },
  rewardText: {
    fontSize: 13,
    fontWeight: '600',
  },
  searchContainer: {
    alignItems: 'center',
    borderRadius: 16,
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 4,
  },
  sortButton: {
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 20,
    flexDirection: 'row',
    flexShrink: 0,
    gap: 4,
    height: 36,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  sortOptionsContainer: {
    height: 36,
  },
  sortText: {
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 18,
  },
});
