"use client"

import React, { useState, useCallback, useEffect } from "react"
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, ScrollView, Alert } from "react-native"
import { useRoute, useNavigation, RouteProp } from "@react-navigation/native"
import { Ionicons } from "@expo/vector-icons"
import { useTheme } from "../theme/ThemeContext"
import type { NativeStackNavigationProp } from "@react-navigation/native-stack"
import { MainStackParamList } from "../navigation/types"

interface SearchResult {
  id: string
  title: string
  description: string
  location: string
  date: string
  image: string
  confidence: number
  finder: {
    name: string
    rating: number
  }
}

type SearchResultsScreenNavigationProp = NativeStackNavigationProp<MainStackParamList, 'ItemDetails'>;
type SearchResultsRouteProp = RouteProp<MainStackParamList, 'ItemDetails'>;

// Mock data (in a real app, this would come from an API)
const searchResults: SearchResult[] = [
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
  const route = useRoute<SearchResultsRouteProp>()
  const navigation = useNavigation<SearchResultsScreenNavigationProp>()
  const { theme, colors } = useTheme()
  const [activeFilters, setActiveFilters] = useState<string[]>(["High Confidence"])
  const [filteredResults, setFilteredResults] = useState<SearchResult[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const filters = ["High Confidence", "Recent", "Nearby", "All"]

  // Filter results based on active filters
  const applyFilters = useCallback(() => {
    let results = [...searchResults]
    
    if (activeFilters.includes("High Confidence")) {
      results = results.filter(item => item.confidence >= 85)
    }
    if (activeFilters.includes("Recent")) {
      results = results.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    }
    if (activeFilters.includes("Nearby")) {
      // In a real app, this would use geolocation to sort by distance
      results = results.sort((a, b) => a.location.localeCompare(b.location))
    }
    
    setFilteredResults(results)
  }, [activeFilters])

  // Initialize filtered results
  useEffect(() => {
    // In a real app, this would fetch results based on route.params.searchQuery
    setFilteredResults(searchResults)
    setIsLoading(false)
  }, [])

  // Apply filters whenever activeFilters change
  useEffect(() => {
    applyFilters()
  }, [activeFilters, applyFilters])

  // Update filters when toggled
  const toggleFilter = (filter: string) => {
    let newFilters: string[]
    if (filter === "All") {
      newFilters = activeFilters.includes("All") ? [] : ["All"]
    } else {
      if (activeFilters.includes(filter)) {
        newFilters = activeFilters.filter(f => f !== filter && f !== "All")
      } else {
        newFilters = [...activeFilters.filter(f => f !== "All"), filter]
      }
    }
    setActiveFilters(newFilters)
  }

  // Handle item details navigation
  const handleItemPress = (itemId: string) => {
    navigation.navigate("ItemDetails", { itemId })
  }

  // Handle claim button press
  const handleClaimPress = (itemId: string) => {
    navigation.navigate("ItemDetails", { itemId })
  }

  // Handle contact finder button press
  const handleContactPress = (finder: { name: string; rating: number }) => {
    Alert.alert(
      "Contact Finder",
      `Would you like to contact ${finder.name}?`,
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Contact", 
          onPress: () => {
            // In a real app, this would open a chat or messaging interface
            Alert.alert("Feature Coming Soon", "The messaging feature will be available in the next update.")
          }
        }
      ]
    )
  }

  const renderResultItem = ({ item }: { item: SearchResult }) => (
    <TouchableOpacity
      style={[styles.resultCard, { backgroundColor: colors.card }]}
      onPress={() => handleItemPress(item.id)}
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
                    width: (item.confidence / 100) * 100,
                    backgroundColor: item.confidence > 85 ? colors.primary : colors.warning,
                  },
                ]}
              />
            </View>
          </View>
        </View>
      </View>

      <View style={styles.resultContent}>
        <Image 
          source={item.image ? { uri: item.image } : { uri: 'https://via.placeholder.com/120x120?text=No+Image' }}
          style={styles.resultImage}
          onError={(error) => console.log('Image loading error:', error)}
        />

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

      <View style={[styles.resultActions, { borderTopColor: colors.border }]}>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: colors.primary }]}
          onPress={() => handleClaimPress(item.id)}
        >
          <Text style={styles.actionButtonText}>Claim This Item</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1 }]}
          onPress={() => handleContactPress(item.finder)}
        >
          <Text style={[styles.actionButtonText, { color: colors.text }]}>Contact Finder</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  )

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Potential Matches</Text>
        <Text style={[styles.headerSubtitle, { color: colors.secondary }]}>
          {isLoading 
            ? "Loading results..." 
            : `We found ${filteredResults.length} items that might match your lost item.`
          }
        </Text>
      </View>

      {!isLoading && (
        <>
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

          <FlatList
            data={filteredResults}
            renderItem={renderResultItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.resultsContainer}
            showsVerticalScrollIndicator={false}
          />
        </>
      )}
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
    backgroundColor: '#E0E0E0',
  },
  confidenceFill: {
    height: '100%',
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

