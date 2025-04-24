import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Dimensions,
  StatusBar,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';
import { MainStackParamList } from '../navigation/types';
import { Item } from '../types/item';

type AllTrendingItemsScreenProps = {
  navigation: NativeStackNavigationProp<MainStackParamList>;
  route: {
    params: {
      items: Item[];
    };
  };
};

export const AllTrendingItemsScreen: React.FC<AllTrendingItemsScreenProps> = ({ navigation, route }) => {
  const { colors } = useTheme();
  const { items } = route.params;
  const numColumns = 2;
  const screenWidth = Dimensions.get('window').width;
  const itemWidth = (screenWidth - 40) / numColumns; // 40 = padding (16 + 16) + gap (8)

  const renderItem = ({ item }: { item: Item }) => (
    <TouchableOpacity
      style={[styles.itemCard, { backgroundColor: colors.card, width: itemWidth }]}
      onPress={() => navigation.navigate('ItemDetails', { itemId: item.id })}
    >
      <Image 
        source={{ uri: item.image }} 
        style={styles.itemImage}
        resizeMode="cover"
      />
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
              {item.location ? `${item.location.latitude.toFixed(2)}, ${item.location.longitude.toFixed(2)}` : 'Location not specified'}
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
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
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
  headerRight: {
    width: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    flex: 1,
    textAlign: 'left',
    letterSpacing: -0.5,
  },
  listContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  columnWrapper: {
    gap: 8,
    justifyContent: 'space-between',
  },
  itemCard: {
    marginBottom: 8,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  itemImage: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: '#f5f5f5',
  },
  rarityBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  rarityText: {
    fontSize: 11,
    fontWeight: '600',
  },
  itemContent: {
    padding: 12,
    gap: 8,
  },
  itemTitle: {
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 20,
  },
  itemDescription: {
    fontSize: 13,
    opacity: 0.8,
    lineHeight: 18,
  },
  itemFooter: {
    gap: 8,
  },
  itemLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  itemLocationText: {
    fontSize: 11,
    flex: 1,
  },
  priceTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  itemPrice: {
    fontSize: 13,
    fontWeight: '600',
  },
}); 