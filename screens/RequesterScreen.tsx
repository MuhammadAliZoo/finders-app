"use client"

import { useState } from "react"
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Image, TextInput } from "react-native"
import { useNavigation } from "@react-navigation/native"
import { Ionicons } from "@expo/vector-icons"
import { useTheme } from "../context/ThemeContext"

// Mock data
const lostItems = [
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
  const navigation = useNavigation()
  const { colors } = useTheme()
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("active")

  const renderLostItem = ({ item }) => (
    <TouchableOpacity
      style={[styles.itemCard, { backgroundColor: colors.card }]}
      onPress={() => {
        if (item.matches > 0) {
          navigation.navigate("SearchResults", { itemId: item.id })
        } else {
          navigation.navigate("ItemDetails", { itemId: item.id })
        }
      }}
    >
      <Image source={{ uri: item.image }} style={styles.itemImage} />
      <View style={styles.itemContent}>
        <View style={styles.itemHeader}>
          <Text style={[styles.itemTitle, { color: colors.text }]}>{item.title}</Text>
          <View
            style={[
              styles.statusBadge,
              {
                backgroundColor: item.status === "Searching" ? colors.warning : colors.success,
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
  )

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Requester</Text>
      </View>

      {/* Search Bar */}
      <View style={[styles.searchContainer, { backgroundColor: colors.card }]}>
        <Ionicons name="search" size={20} color={colors.text} style={styles.searchIcon} />
        <TextInput
          style={[styles.searchInput, { color: colors.text }]}
          placeholder="Search lost items..."
          placeholderTextColor="#888888"
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
        </Touchable  : colors.text }
            ]}
          >
            Resolved
          </Text>
        </TouchableOpacity>
  </View>
  activeTab === "active" ? (
    <FlatList
      data={lostItems}
      renderItem={renderLostItem}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.listContent}
    />
  ) : (
    <View style={styles.resolvedContainer}>
      <Text style={[styles.resolvedText, { color: colors.secondary }]}>Your resolved requests will appear here.</Text>
    </View>
  )
  ;<TouchableOpacity
    style={[styles.addButton, { backgroundColor: colors.primary }]}
    onPress={() => navigation.navigate("Submission", { type: "lost" })}
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
    padding: 16,
    paddingBottom: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
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
  itemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 4,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: "bold",
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  itemDescription: {
    fontSize: 14,
    marginBottom: 8,
  },
  itemMeta: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 8,
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
  matchesBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: "flex-start",
  },
  matchesText: {
    fontSize: 12,
    fontWeight: "500",
    marginLeft: 4,
  },
  resolvedContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  resolvedText: {
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

export default RequesterScreen

