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

export const AllTrendingItemsScreen: React.FC<AllTrendingItemsScreenProps> = ({
  navigation,
  route,
}) => {
  const { colors } = useTheme();
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
        setItems(data || []);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch items');
      } finally {
        setLoading(false);
      }
    };
    fetchItems();
  }, []);

  if (loading) return <ActivityIndicator style={{ marginTop: 40 }} />;
  if (error) return <Text style={{ color: colors.error, margin: 20 }}>{error}</Text>;

  const numColumns = 2;
  const screenWidth = Dimensions.get('window').width;
  const itemWidth = (screenWidth - 40) / numColumns; // 40 = padding (16 + 16) + gap (8)

  const renderItem = ({ item }: { item: Item }) => (
    <TouchableOpacity
      style={[styles.itemCard, { backgroundColor: colors.card, width: itemWidth }]}
      onPress={() => navigation.navigate('ItemDetails', { id: item.id })}
    >
      <Image source={{ uri: item.image }} style={styles.itemImage} resizeMode="cover" />
      <View style={[styles.rarityBadge, { backgroundColor: colors.primary + '20' }]}>
        <Text style={[styles.rarityText, { color: colors.primary }]}>
          {item.rarity || 'Common'}
        </Text>
      </View>
      <View style={styles.itemContent}>
        <Text style={[styles.itemTitle, { color: colors.text }]} numberOfLines={1}>
          {item.title}
        </Text>
        <Text style={[styles.itemDescription, { color: colors.text }]} numberOfLines={2}>
          {item.description}
        </Text>
        <View style={styles.itemFooter}>
          <View style={styles.itemLocation}>
            <Ionicons name="location-outline" size={14} color={colors.secondary} />
            <Text style={[styles.itemLocationText, { color: colors.secondary }]} numberOfLines={1}>
              {item.location
                ? `${item.location.latitude.toFixed(2)}, ${item.location.longitude.toFixed(2)}`
                : 'Location not specified'}
            </Text>
          </View>
          <View style={[styles.priceTag, { backgroundColor: colors.primary + '15' }]}>
            <Ionicons name="gift-outline" size={14} color={colors.primary} />
            <Text style={[styles.itemPrice, { color: colors.primary }]}>
              ${item.price.toLocaleString()}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="light-content" />
      <View style={[styles.header, { backgroundColor: colors.background }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>Trending Items</Text>
        <View style={styles.headerRight} />
      </View>
      <FlatList
        data={items}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        numColumns={numColumns}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        columnWrapperStyle={styles.columnWrapper}
      />
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
