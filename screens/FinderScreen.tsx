"use client"

import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Image, TextInput } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MainStackParamList } from '../navigation/types';
import { Item } from '../types/item';

type FoundItem = Item & {
  status: "Pending" | "Claimed";
};

// Mock data
const foundItems: FoundItem[] = [
  {
    id: "1",
    title: "Black Wallet",
    description: "Found near Central Park entrance",
    location: {
      latitude: 40.7829,
      longitude: -73.9654
    },
    image: "https://via.placeholder.com/150",
    status: "Pending",
    price: 0,
    timestamp: "2024-03-20T10:30:00Z",
    priority: "high",
    category: "accessories",
    rarity: "Common"
  },
  {
    id: "2",
    title: "iPhone 13",
    description: "Found at Coffee Shop on Main St",
    location: {
      latitude: 40.7831,
      longitude: -73.9652
    },
    image: "https://via.placeholder.com/150",
    status: "Claimed",
    price: 0,
    timestamp: "2024-03-19T15:45:00Z",
    priority: "medium",
    category: "electronics",
    rarity: "Common"
  },
  {
    id: "3",
    title: "House Keys",
    description: "Set of keys with red keychain",
    location: {
      latitude: 40.7833,
      longitude: -73.9650
    },
    image: "https://via.placeholder.com/150",
    status: "Pending",
    price: 0,
    timestamp: "2024-03-18T09:15:00Z",
    priority: "low",
    category: "accessories",
    rarity: "Common"
  }
];

const FinderScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<MainStackParamList>>();
  const { colors } = useTheme();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("found");

  // Memoized navigation handlers
  const handleItemPress = useCallback((item: FoundItem) => {
    if (!item.id) {
      console.warn('Invalid item ID for navigation');
      return;
    }
    navigation.navigate("ItemDetails", { itemId: item.id });
  }, [navigation]);

  const handleAddNewItem = useCallback(() => {
    navigation.navigate("Submission");
  }, [navigation]);

  const renderItem = ({ item }: { item: FoundItem }) => (
    <TouchableOpacity
      style={[styles.itemCard, { backgroundColor: colors.card }]}
      onPress={() => handleItemPress(item)}
    >
      <Image source={{ uri: item.image }} style={styles.itemImage} />
      <View style={styles.itemContent}>
        <Text style={[styles.itemTitle, { color: colors.text }]}>{item.title}</Text>
        <Text style={[styles.itemDescription, { color: colors.secondary }]}>{item.description}</Text>
        <View style={styles.metaContainer}>
          <View style={styles.metaItem}>
            <Ionicons name="location-outline" size={14} color={colors.secondary} />
            <Text style={[styles.metaText, { color: colors.secondary }]}>
              {item.location ? `${item.location.latitude}, ${item.location.longitude}` : 'Location not specified'}
            </Text>
          </View>
          <View style={styles.metaItem}>
            <Ionicons name="time-outline" size={14} color={colors.secondary} />
            <Text style={[styles.metaText, { color: colors.secondary }]}>
              {item.timestamp ? new Date(item.timestamp).toLocaleDateString() : 'Date not specified'}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  // Filter items based on search query
  const filteredItems = useCallback(() => {
    if (!searchQuery.trim()) return foundItems;
    return foundItems.filter(
      item =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.background }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Finder</Text>
      </View>

      {/* Search Bar */}
      <View style={[styles.searchContainer, { backgroundColor: colors.card }]}>
        <Ionicons name="search" size={20} color={colors.text} style={styles.searchIcon} />
        <TextInput
          style={[styles.searchInput, { color: colors.text }]}
          placeholder="Search found items..."
          placeholderTextColor="#888888"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "found" && { backgroundColor: colors.primary }]}
          onPress={() => setActiveTab("found")}
        >
          <Text style={[styles.tabText, { color: activeTab === "found" ? "#FFFFFF" : colors.text }]}>Found Items</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === "history" && { backgroundColor: colors.primary }]}
          onPress={() => setActiveTab("history")}
        >
          <Text style={[styles.tabText, { color: activeTab === "history" ? "#FFFFFF" : colors.text }]}>History</Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      {activeTab === "found" ? (
        <FlatList
          data={filteredItems()}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          testID="found-items-list"
        />
      ) : (
        <View style={styles.historyContainer}>
          <Text style={[styles.historyText, { color: colors.secondary }]}>
            Your history of found items will appear here.
          </Text>
        </View>
      )}

      {/* Add Button */}
      <TouchableOpacity
        style={[styles.addButton, { backgroundColor: colors.primary }]}
        onPress={handleAddNewItem}
        testID="add-found-item-button"
      >
        <Ionicons name="add" size={24} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 34,
    fontWeight: "bold",
    flex: 1,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    margin: 16,
    padding: 10,
    borderRadius: 12,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  tabsContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 8,
    marginHorizontal: 4,
  },
  tabText: {
    fontWeight: "500",
  },
  listContent: {
    padding: 16,
  },
  itemCard: {
    flexDirection: "row",
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 16,
  },
  itemImage: {
    width: 100,
    height: 100,
  },
  itemContent: {
    flex: 1,
    padding: 12,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: "bold",
    flex: 1,
  },
  itemDescription: {
    fontSize: 14,
    marginBottom: 8,
  },
  metaContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 12,
  },
  metaText: {
    fontSize: 12,
    marginLeft: 4,
  },
  historyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  historyText: {
    textAlign: "center",
    fontSize: 16,
  },
  addButton: {
    position: "absolute",
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
})

export default FinderScreen

