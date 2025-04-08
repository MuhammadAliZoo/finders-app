"use client"

import { useState } from "react"
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, ScrollView } from "react-native"
import { useRoute, useNavigation } from "@react-navigation/native"
import { Ionicons } from "@expo/vector-icons"
import { useTheme } from "../context/ThemeContext"

// Mock data
const searchResults = [
  {
    id: "1",
    title: "Gold Watch",
    description: "Found at Central Park entrance",
    location: "Central Park, NY",
    date: "June 15, 2023",
    image: "https://via.placeholder.com/300",
    confidence: 92,
    finder: {
      name: "Michael Rodriguez",
      rating: 4.8,
    },
  },
  {
    id: "2",
    title: "Gold Watch with Leather Strap",
    description: "Found near the lake in Central Park",
    location: "Central Park, NY",
    date: "June 16, 2023",
    image: "https://via.placeholder.com/300",
    confidence: 78,
    finder: {
      name: "Emma Johnson",
      rating: 4.5,
    },
  },
]

const SearchResultsScreen = () => {
  const route = useRoute()
  const navigation = useNavigation()
  const { colors } = useTheme()
  const [activeFilters, setActiveFilters] = useState(["High Confidence"])

  const filters = ["High Confidence", "Recent", "Nearby", "All"]

  const toggleFilter = (filter) => {
    if (activeFilters.includes(filter)) {
      setActiveFilters(activeFilters.filter((f) => f !== filter))
    } else {
      setActiveFilters([...activeFilters, filter])
    }
  }

  const renderResultItem = ({ item }) => (
    <TouchableOpacity
      style={[styles.resultCard, { backgroundColor: colors.card }]}
      onPress={() => navigation.navigate("ItemDetails", { itemId: item.id })}
    >
      <View style={styles.resultHeader}>
        <View style={styles.confidenceContainer}>
          <Text style={[styles.confidenceLabel, { color: colors.secondary }]}>AI Confidence</Text>
          <View style={styles.confidenceScore}>
            <Text style={[styles.confidenceValue, { color: colors.text }]}>{item.confidence}%</Text>
            <View style={[styles.confidenceMeter, { backgroundColor: colors.card }]}>
              <View
                style={[
                  styles.confidenceFill,
                  {
                    width: `${item.confidence}%`,
                    backgroundColor: item.confidence > 85 ? colors.success : colors.warning,
                  },
                ]}
              />
            </View>
          </View>
        </View>
      </View>

      <View style={styles.resultContent}>
        <Image source={{ uri: item.image }} style={styles.resultImage} />

        <View style={styles.resultDetails}>
          <Text style={[styles.resultTitle, { color: colors.text }]}>{item.title}</Text>
          <Text style={[styles.resultDescription, { color: colors.secondary }]} numberOfLines={2}>
            {item.description}
          </Text>

          <View style={styles.resultMeta}>
            <View style={styles.metaItem}>
              <Ionicons name="location-outline" size={14} color={colors.secondary} />
              <Text style={[styles.metaText, { color: colors.secondary }]}>{item.location}</Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="calendar-outline" size={14} color={colors.secondary} />
              <Text style={[styles.metaText, { color: colors.secondary }]}>{item.date}</Text>
            </View>
          </View>

          <View style={styles.finderInfo}>
            <Text style={[styles.finderLabel, { color: colors.secondary }]}>Reported by:</Text>
            <Text style={[styles.finderName, { color: colors.text }]}>{item.finder.name}</Text>
            <View style={styles.ratingContainer}>
              <Ionicons name="star" size={14} color={colors.warning} />
              <Text style={[styles.ratingText, { color: colors.secondary }]}>{item.finder.rating}</Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.resultActions}>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: colors.primary }]}
          onPress={() => navigation.navigate("ClaimTracking", { itemId: item.id })}
        >
          <Text style={styles.actionButtonText}>Claim This Item</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1 }]}
        >
          <Text style={[styles.actionButtonText, { color: colors.text }]}>Contact Finder</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  )

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Potential Matches</Text>
        <Text style={[styles.headerSubtitle, { color: colors.secondary }]}>
          We found {searchResults.length} items that might match your lost item.
        </Text>
      </View>

      {/* Filters */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filtersContainer}
        contentContainerStyle={styles.filtersContent}
      >
        {filters.map((filter) => (
          <TouchableOpacity
            key={filter}
            style={[
              styles.filterButton,
              activeFilters.includes(filter)
                ? { backgroundColor: colors.primary }
                : { backgroundColor: "transparent", borderColor: colors.border, borderWidth: 1 },
            ]}
            onPress={() => toggleFilter(filter)}
          >
            <Text style={[styles.filterText, { color: activeFilters.includes(filter) ? "#FFFFFF" : colors.text }]}>
              {filter}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Results */}
      <FlatList
        data={searchResults}
        renderItem={renderResultItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.resultsContainer}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 14,
  },
  filtersContainer: {
    maxHeight: 50,
  },
  filtersContent: {
    paddingHorizontal: 16,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  filterText: {
    fontSize: 14,
    fontWeight: "500",
  },
  resultsContainer: {
    padding: 16,
  },
  resultCard: {
    borderRadius: 12,
    marginBottom: 16,
    overflow: "hidden",
  },
  resultHeader: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#333333",
  },
  confidenceContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  confidenceLabel: {
    fontSize: 14,
  },
  confidenceScore: {
    flexDirection: "row",
    alignItems: "center",
  },
  confidenceValue: {
    fontSize: 14,
    fontWeight: "bold",
    marginRight: 8,
  },
  confidenceMeter: {
    width: 100,
    height: 6,
    borderRadius: 3,
  },
  confidenceFill: {
    height: 6,
    borderRadius: 3,
  },
  resultContent: {
    flexDirection: "row",
    padding: 12,
  },
  resultImage: {
    width: 120,
    height: 120,
    borderRadius: 8,
  },
  resultDetails: {
    flex: 1,
    marginLeft: 12,
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 4,
  },
  resultDescription: {
    fontSize: 14,
    marginBottom: 8,
  },
  resultMeta: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 8,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 12,
    marginBottom: 4,
  },
  metaText: {
    fontSize: 12,
    marginLeft: 4,
  },
  finderInfo: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
  },
  finderLabel: {
    fontSize: 12,
    marginRight: 4,
  },
  finderName: {
    fontSize: 12,
    fontWeight: "500",
    marginRight: 8,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  ratingText: {
    fontSize: 12,
    marginLeft: 2,
  },
  resultActions: {
    flexDirection: "row",
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: "#333333",
  },
  actionButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 4,
  },
  actionButtonText: {
    color: "#FFFFFF",
    fontWeight: "500",
    fontSize: 14,
  },
})

export default SearchResultsScreen

