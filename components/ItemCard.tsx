'use client';
import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { Item } from '../types/item';
import { Ionicons } from '@expo/vector-icons';

interface ItemCardProps extends React.ComponentProps<typeof TouchableOpacity> {
  item: Item;
  onPress?: () => void;
  showRarity?: boolean;
  showReward?: boolean;
}

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.45;

export const ItemCard = React.memo<ItemCardProps>(
  ({ item, onPress, showRarity = false, showReward = false, ...props }) => {
    const { colors } = useTheme();

    return (
      <TouchableOpacity
        style={[styles.container, { backgroundColor: colors.card }]}
        onPress={onPress}
        {...props}
      >
        <Image source={{ uri: item.image }} style={styles.image} resizeMode="cover" />
        <View style={styles.content}>
          <Text style={[styles.title, { color: colors.text }]} numberOfLines={2}>
            {item.title}
          </Text>
          <Text style={[styles.description, { color: colors.text }]} numberOfLines={2}>
            {item.description}
          </Text>
          {showRarity && item.isRare && (
            <View style={[styles.rarityBadge, { backgroundColor: colors.primary + '20' }]}>
              <Ionicons name="star" size={14} color={colors.primary} />
              <Text style={[styles.rarityText, { color: colors.primary }]}>
                {item.rarity || 'Rare'}
              </Text>
            </View>
          )}
          <View style={styles.priceContainer}>
            <Text style={[styles.priceLabel, { color: colors.secondary }]}>
              {showReward ? "Finder's Reward:" : 'Price:'}
            </Text>
            <Text style={[styles.price, { color: colors.primary }]}>${item.price.toFixed(2)}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  },
);

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    elevation: 3,
    marginBottom: 12,
    marginRight: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    width: CARD_WIDTH,
  },
  content: {
    padding: 12,
  },
  description: {
    fontSize: 14,
    lineHeight: 18,
    marginBottom: 6,
    opacity: 0.8,
  },
  image: {
    backgroundColor: '#f5f5f5',
    height: CARD_WIDTH,
    width: '100%',
  },
  location: {
    fontSize: 12,
    marginTop: 4,
    opacity: 0.7,
  },
  price: {
    fontSize: 16,
    fontWeight: '600',
  },
  priceContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    marginTop: 4,
  },
  priceLabel: {
    fontSize: 14,
    marginRight: 4,
  },
  rarityBadge: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderRadius: 4,
    flexDirection: 'row',
    marginTop: 4,
    padding: 4,
  },
  rarityText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 20,
    marginBottom: 4,
  },
});
