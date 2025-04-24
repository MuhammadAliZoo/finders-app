"use client"

import { useState, useCallback } from "react"
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Image, TextInput } from "react-native"
import { useNavigation } from "@react-navigation/native"
import { Ionicons } from "@expo/vector-icons"
import { useTheme } from "../theme/ThemeContext"
import { NativeStackNavigationProp } from "@react-navigation/native-stack"
import { MainStackParamList } from "../navigation/types"

type LostItem = {
  id: string;
  title: string;
  description: string;
  location: string;
  date: string;
  image: string;
  status: "Searching" | "Found";
  matches: number;
};

// Mock data
const lostItems: LostItem[] = [
  {
    id: "1",
    title: "Gold Watch",
    description: "Lost at Central Park yesterday",
    location: "Central Park, NY",
    date: "June 15, 2023",
    image: "https://via.placeholder.com/150",
    status: "Searching",
    matches: 2,
  },
  {
    id: "2",
    title: "MacBook Pro",
    description: "Left at coffee shop on Main St",
    location: "Downtown, NY",
    date: "June 14, 2023",
    image: "https://via.placeholder.com/150",
    status: "Found",
    matches: 1,
  },
  {
    id: "3",
    title: "Prescription Glasses",
    description: "Black frame with case",
    location: "Library, NY",
    date: "June 13, 2023",
    image: "https://via.placeholder.com/150",
    status: "Searching",
    matches: 0,
  },
]

const RequesterScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<MainStackParamList>>()
  const { colors } = useTheme()
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("active")

  // Memoized navigation handlers
  const handleItemPress = useCallback((item: LostItem) => {
    if (!item.id) {
      console.warn('Invalid item ID for navigation');
      return;
    }
    if (item.matches > 0) {
      // For items with matches, navigate to the Finder tab with search query
      navigation.navigate('Tabs', {
        screen: 'Finder',
        params: { searchQuery: item.title }
      } as const);
    } else {
      navigation.navigate('ItemDetails', { itemId: item.id });
    }
  }, [navigation]);

  const handleAddNewRequest = useCallback(() => {
    navigation.navigate('Submission');
  }, [navigation]);

  // Filter items based on search query
  const filteredItems = useCallback(() => {
    if (!searchQuery.trim()) return lostItems;
    return lostItems.filter(
      item =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  const renderLostItem = useCallback(({ item }: { item: LostItem }) => (
    <TouchableOpacity
      style={[styles.itemCard, { backgroundColor: colors.card }]}
      onPress={() => handleItemPress(item)}
      testID={`lost-item-${item.id}`}
    >
      <Image source={{ uri: item.image }} style={styles.itemImage} />
      <View style={styles.itemContent}>
        <View style={styles.itemHeader}>
          <Text style={[styles.itemTitle, { color: colors.text }]}>{item.title}</Text>
          <View
            style={[
              styles.statusBadge,
              {
                backgroundColor: item.status === "Searching" ? colors.warning : colors.primary,
              },
            ]}
          >
            <Text style={styles.statusText}>{item.status}</Text>
          </View>
        </View>
        <Text style={[styles.itemDescription, { color: colors.secondary }]} numberOfLines={2}>
          {item.description}
        </Text>
        <View style={styles.itemMeta}>
          <View style={styles.metaItem}>
            <Ionicons name="location-outline" size={14} color={colors.secondary} />
            <Text style={[styles.metaText, { color: colors.secondary }]}>{item.location}</Text>
          </View>
          <View style={styles.metaItem}>
            <Ionicons name="calendar-outline" size={14} color={colors.secondary} />
            <Text style={[styles.metaText, { color: colors.secondary }]}>{item.date}</Text>
          </View>
        </View>
        {item.matches > 0 && (
          <View style={[styles.matchesBadge, { backgroundColor: colors.primary + "20" }]}>
            <Ionicons name="search" size={14} color={colors.primary} />
            <Text style={[styles.matchesText, { color: colors.primary }]}>
              {item.matches} potential {item.matches === 1 ? "match" : "matches"}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  ), [colors, handleItemPress]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.background }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]} numberOfLines={1}>Requester</Text>
      </View>

      <View style={styles.content}>
        {/* Search Bar */}
        <View style={[styles.searchContainer, { backgroundColor: colors.card }]}>
          <Ionicons name="search" size={20} color={colors.secondary} style={styles.searchIcon} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search lost items..."
            placeholderTextColor={colors.secondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity 
            style={[
              styles.tab, 
              activeTab === 'active' && { backgroundColor: colors.primary }
            ]}
            onPress={() => setActiveTab('active')}
          >
            <Text 
              style={[
                styles.tabText, 
                { color: activeTab === 'active' ? '#FFFFFF' : colors.text }
              ]}
            >
              Active Requests
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[
              styles.tab, 
              activeTab === 'resolved' && { backgroundColor: colors.primary }
            ]}
            onPress={() => setActiveTab('resolved')}
          >
            <Text 
              style={[
                styles.tabText, 
                { color: activeTab === 'resolved' ? '#FFFFFF' : colors.text }
              ]}
            >
              Resolved
            </Text>
          </TouchableOpacity>
        </View>

        {activeTab === "active" ? (
          <FlatList
            data={filteredItems()}
            renderItem={renderLostItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            testID="lost-items-list"
          />
        ) : (
          <View style={styles.resolvedContainer}>
            <Text style={[styles.resolvedText, { color: colors.secondary }]}>
              Your resolved requests will appear here.
            </Text>
          </View>
        )}

        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: colors.primary }]}
          onPress={handleAddNewRequest}
          testID="add-lost-item-button"
        >
          <Ionicons name="add" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
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
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 16,
    marginBottom: 20,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 4,
  },
  tabsContainer: {
    flexDirection: "row",
    marginBottom: 20,
    gap: 12,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  tabText: {
    fontSize: 15,
    fontWeight: "600",
  },
  listContent: {
    paddingTop: 8,
    paddingBottom: 100,
  },
  itemCard: {
    flexDirection: "row",
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  itemImage: {
    width: 100,
    height: 100,
  },
  itemContent: {
    flex: 1,
    padding: 16,
  },
  itemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: "700",
    flex: 1,
    marginRight: 8,
    letterSpacing: -0.3,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  itemDescription: {
    fontSize: 14,
    marginBottom: 12,
    lineHeight: 20,
    opacity: 0.8,
  },
  itemMeta: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  metaText: {
    fontSize: 13,
  },
  matchesBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    alignSelf: "flex-start",
    marginTop: 8,
  },
  matchesText: {
    fontSize: 13,
    fontWeight: "600",
    marginLeft: 4,
  },
  resolvedContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  resolvedText: {
    textAlign: "center",
    fontSize: 16,
    lineHeight: 24,
    opacity: 0.8,
  },
  addButton: {
    position: "absolute",
    bottom: 32,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
})

export default RequesterScreen

