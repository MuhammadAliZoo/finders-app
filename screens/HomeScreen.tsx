"use client"

import { useState } from "react"
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, FlatList } from "react-native"
import { useNavigation } from "@react-navigation/native"
import { Ionicons } from "@expo/vector-icons"
import { useTheme } from "../context/ThemeContext"
import ItemCard from "../components/ItemCard"
import MapView, { Heatmap, PROVIDER_GOOGLE } from "react-native-maps"

// Mock data
const trendingItems = [
  {
    id: "1",
    title: "Black Wallet",
    location: "Central Park",
    time: "2h ago",
    image: "https://via.placeholder.com/150",
  },
  { id: "2", title: "iPhone 13", location: "Coffee Shop", time: "5h ago", image: "https://via.placeholder.com/150" },
  { id: "3", title: "House Keys", location: "Main Street", time: "1d ago", image: "https://via.placeholder.com/150" },
  { id: "4", title: "Backpack", location: "Library", time: "2d ago", image: "https://via.placeholder.com/150" },
]

// Mock heatmap data
const heatmapPoints = [
  { latitude: 37.78825, longitude: -122.4324, weight: 1 },
  { latitude: 37.78925, longitude: -122.4344, weight: 1 },
  { latitude: 37.78925, longitude: -122.4314, weight: 1 },
  { latitude: 37.78725, longitude: -122.4324, weight: 1 },
  { latitude: 37.78625, longitude: -122.4334, weight: 1 },
]

const HomeScreen = () => {
  const navigation = useNavigation()
  const { colors } = useTheme()
  const [searchQuery, setSearchQuery] = useState("")
  const [activeFilter, setActiveFilter] = useState("Most Recent")

  const filters = ["Most Recent", "Near Me", "High Priority"]

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Search Bar */}
      <View style={[styles.searchContainer, { backgroundColor: colors.card }]}>
        <Ionicons name="search" size={20} color={colors.text} style={styles.searchIcon} />
        <TextInput
          style={[styles.searchInput, { color: colors.text }]}
          placeholder="Search for lost or found items..."
          placeholderTextColor="#888888"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <TouchableOpacity onPress={() => {}}>
          <Ionicons name="mic-outline" size={20} color={colors.primary} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => {}}>
          <Ionicons name="camera-outline" size={20} color={colors.primary} style={styles.cameraIcon} />
        </TouchableOpacity>
      </View>

      {/* Quick Filters */}
      <View style={styles.filtersContainer}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={filters}
          keyExtractor={(item) => item}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.filterButton,
                activeFilter === item && { backgroundColor: colors.primary },
                { borderColor: colors.primary },
              ]}
              onPress={() => setActiveFilter(item)}
            >
              <Text
                style={[styles.filterText, activeFilter === item ? { color: "#121212" } : { color: colors.primary }]}
              >
                {item}
              </Text>
            </TouchableOpacity>
          )}
          contentContainerStyle={styles.filtersList}
        />
      </View>

      {/* AI Suggestions */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>AI Image Search</Text>
        <TouchableOpacity style={[styles.aiSearchBox, { backgroundColor: colors.card }]} onPress={() => {}}>
          <Ionicons name="camera" size={24} color={colors.primary} />
          <Text style={[styles.aiSearchText, { color: colors.text }]}>Upload an image to find similar items</Text>
        </TouchableOpacity>
      </View>

      {/* Trending Items */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Trending Items</Text>
          <TouchableOpacity>
            <Text style={[styles.seeAllText, { color: colors.primary }]}>See All</Text>
          </TouchableOpacity>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.trendingScroll}>
          {trendingItems.map((item) => (
            <ItemCard
              key={item.id}
              item={item}
              onPress={() => navigation.navigate("ItemDetails", { itemId: item.id })}
            />
          ))}
        </ScrollView>
      </View>

      {/* Lost Item Heatmap */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Lost Item Heatmap</Text>
        <View style={styles.mapContainer}>
          <MapView
            provider={PROVIDER_GOOGLE}
            style={styles.map}
            initialRegion={{
              latitude: 37.78825,
              longitude: -122.4324,
              latitudeDelta: 0.0922,
              longitudeDelta: 0.0421,
            }}
            customMapStyle={[
              {
                elementType: "geometry",
                stylers: [{ color: "#242f3e" }],
              },
              {
                elementType: "labels.text.fill",
                stylers: [{ color: "#746855" }],
              },
              {
                elementType: "labels.text.stroke",
                stylers: [{ color: "#242f3e" }],
              },
            ]}
          >
            <Heatmap
              points={heatmapPoints}
              radius={20}
              opacity={0.8}
              gradient={{
                colors: ["#00BFFF", "#FF4500"],
                startPoints: [0.2, 1],
                colorMapSize: 256,
              }}
            />
          </MapView>
        </View>
      </View>

      {/* Community Tips */}
      <View style={[styles.section, styles.tipsSection, { backgroundColor: colors.card }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Community Tips</Text>
        <Text style={[styles.tipText, { color: colors.text }]}>
          💡 Check nearby cafes for lost wallets and phones - they're often turned in to staff!
        </Text>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderRadius: 12,
    marginBottom: 16,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  cameraIcon: {
    marginLeft: 10,
  },
  filtersContainer: {
    marginBottom: 20,
  },
  filtersList: {
    paddingVertical: 5,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 1,
  },
  filterText: {
    fontSize: 14,
    fontWeight: "500",
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
  },
  seeAllText: {
    fontSize: 14,
  },
  trendingScroll: {
    flexDirection: "row",
  },
  aiSearchBox: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    borderRadius: 12,
    gap: 10,
  },
  aiSearchText: {
    fontSize: 16,
  },
  mapContainer: {
    height: 200,
    borderRadius: 12,
    overflow: "hidden",
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  tipsSection: {
    padding: 16,
    borderRadius: 12,
  },
  tipText: {
    fontSize: 16,
    lineHeight: 22,
  },
})

export default HomeScreen

