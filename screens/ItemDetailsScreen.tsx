"use client"

import { useState } from "react"
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, Dimensions } from "react-native"
import { useRoute } from "@react-navigation/native"
import { Ionicons } from "@expo/vector-icons"
import { useTheme } from "../context/ThemeContext"

// Mock data
const itemDetails = {
  id: "1",
  title: "Black Leather Wallet",
  description:
    'Found a black leather wallet with initials "JD" near Central Park entrance. Contains ID and credit cards.',
  location: "Central Park, New York",
  date: "June 15, 2023",
  time: "2:30 PM",
  status: "Found",
  images: ["https://via.placeholder.com/400", "https://via.placeholder.com/400"],
  finder: {
    name: "Michael Rodriguez",
    rating: 4.8,
    image: "https://via.placeholder.com/100",
  },
  similarItems: [
    { id: "s1", title: "Brown Wallet", image: "https://via.placeholder.com/150" },
    { id: "s2", title: "Black Purse", image: "https://via.placeholder.com/150" },
  ],
  timeline: [
    { id: "t1", event: "Item reported found", date: "June 15, 2023", time: "2:30 PM" },
    { id: "t2", event: "Verification in progress", date: "June 15, 2023", time: "3:45 PM" },
  ],
}

const ItemDetailsScreen = () => {
  const route = useRoute()
  const { colors } = useTheme()
  const [activeTab, setActiveTab] = useState("details")
  const [confidenceScore, setConfidenceScore] = useState(85)

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Image Gallery */}
      <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false} style={styles.imageGallery}>
        {itemDetails.images.map((image, index) => (
          <Image key={index} source={{ uri: image }} style={styles.itemImage} resizeMode="cover" />
        ))}
      </ScrollView>

      {/* Status Badge */}
      <View
        style={[
          styles.statusBadge,
          { backgroundColor: itemDetails.status === "Found" ? colors.success : colors.primary },
        ]}
      >
        <Text style={styles.statusText}>{itemDetails.status}</Text>
      </View>

      {/* Item Info */}
      <View style={styles.infoSection}>
        <Text style={[styles.itemTitle, { color: colors.text }]}>{itemDetails.title}</Text>

        <View style={styles.metaInfo}>
          <View style={styles.metaItem}>
            <Ionicons name="location-outline" size={16} color={colors.secondary} />
            <Text style={[styles.metaText, { color: colors.secondary }]}>{itemDetails.location}</Text>
          </View>
          <View style={styles.metaItem}>
            <Ionicons name="calendar-outline" size={16} color={colors.secondary} />
            <Text style={[styles.metaText, { color: colors.secondary }]}>{itemDetails.date}</Text>
          </View>
          <View style={styles.metaItem}>
            <Ionicons name="time-outline" size={16} color={colors.secondary} />
            <Text style={[styles.metaText, { color: colors.secondary }]}>{itemDetails.time}</Text>
          </View>
        </View>

        {/* AI Confidence Meter */}
        <View style={[styles.confidenceMeter, { backgroundColor: colors.card }]}>
          <View style={styles.confidenceHeader}>
            <Text style={[styles.confidenceTitle, { color: colors.text }]}>AI Confidence Score</Text>
            <Text style={[styles.confidenceScore, { color: colors.primary }]}>{confidenceScore}%</Text>
          </View>
          <View style={styles.progressBarContainer}>
            <View
              style={[
                styles.progressBar,
                {
                  width: `${confidenceScore}%`,
                  backgroundColor: confidenceScore > 70 ? colors.success : colors.warning,
                },
              ]}
            />
          </View>
          <Text style={[styles.confidenceDescription, { color: colors.secondary }]}>
            This item has a high match probability based on visual and descriptive analysis.
          </Text>
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "details" && { borderBottomColor: colors.primary, borderBottomWidth: 2 }]}
          onPress={() => setActiveTab("details")}
        >
          <Text style={[styles.tabText, { color: activeTab === "details" ? colors.primary : colors.secondary }]}>
            Details
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === "timeline" && { borderBottomColor: colors.primary, borderBottomWidth: 2 }]}
          onPress={() => setActiveTab("timeline")}
        >
          <Text style={[styles.tabText, { color: activeTab === "timeline" ? colors.primary : colors.secondary }]}>
            Timeline
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === "similar" && { borderBottomColor: colors.primary, borderBottomWidth: 2 }]}
          onPress={() => setActiveTab("similar")}
        >
          <Text style={[styles.tabText, { color: activeTab === "similar" ? colors.primary : colors.secondary }]}>
            Similar Items
          </Text>
        </TouchableOpacity>
      </View>

      {/* Tab Content */}
      <View style={styles.tabContent}>
        {activeTab === "details" && (
          <View>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Description</Text>
            <Text style={[styles.description, { color: colors.text }]}>{itemDetails.description}</Text>

            <Text style={[styles.sectionTitle, { color: colors.text }]}>Finder</Text>
            <View style={[styles.finderCard, { backgroundColor: colors.card }]}>
              <Image source={{ uri: itemDetails.finder.image }} style={styles.finderImage} />
              <View style={styles.finderInfo}>
                <Text style={[styles.finderName, { color: colors.text }]}>{itemDetails.finder.name}</Text>
                <View style={styles.ratingContainer}>
                  <Ionicons name="star" size={16} color={colors.warning} />
                  <Text style={[styles.ratingText, { color: colors.secondary }]}>{itemDetails.finder.rating}</Text>
                </View>
              </View>
              <TouchableOpacity style={[styles.contactButton, { backgroundColor: colors.primary }]}>
                <Text style={styles.contactButtonText}>Contact</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {activeTab === "timeline" && (
          <View style={styles.timelineContainer}>
            {itemDetails.timeline.map((event, index) => (
              <View key={event.id} style={styles.timelineItem}>
                <View style={[styles.timelineDot, { backgroundColor: colors.primary }]} />
                {index < itemDetails.timeline.length - 1 && (
                  <View style={[styles.timelineLine, { backgroundColor: colors.border }]} />
                )}
                <View style={styles.timelineContent}>
                  <Text style={[styles.timelineEvent, { color: colors.text }]}>{event.event}</Text>
                  <Text style={[styles.timelineDate, { color: colors.secondary }]}>
                    {event.date} at {event.time}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {activeTab === "similar" && (
          <View style={styles.similarItemsContainer}>
            <Text style={[styles.similarItemsText, { color: colors.secondary }]}>
              AI has found these similar items that might match what you're looking for:
            </Text>
            <View style={styles.similarItemsGrid}>
              {itemDetails.similarItems.map((item) => (
                <TouchableOpacity key={item.id} style={[styles.similarItemCard, { backgroundColor: colors.card }]}>
                  <Image source={{ uri: item.image }} style={styles.similarItemImage} />
                  <Text style={[styles.similarItemTitle, { color: colors.text }]} numberOfLines={1}>
                    {item.title}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
      </View>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity style={[styles.actionButton, { backgroundColor: colors.card }]}>
          <Ionicons name="bookmark-outline" size={20} color={colors.primary} />
          <Text style={[styles.actionButtonText, { color: colors.text }]}>Save</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionButton, { backgroundColor: colors.card }]}>
          <Ionicons name="share-social-outline" size={20} color={colors.primary} />
          <Text style={[styles.actionButtonText, { color: colors.text }]}>Share</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.claimButton, { backgroundColor: colors.primary }]}>
          <Text style={styles.claimButtonText}>Claim This Item</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  )
}

const { width } = Dimensions.get("window")

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  imageGallery: {
    height: 300,
  },
  itemImage: {
    width,
    height: 300,
  },
  statusBadge: {
    position: "absolute",
    top: 16,
    right: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 12,
  },
  infoSection: {
    padding: 16,
  },
  itemTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
  },
  metaInfo: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 16,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 16,
    marginBottom: 8,
  },
  metaText: {
    fontSize: 14,
    marginLeft: 4,
  },
  confidenceMeter: {
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
  },
  confidenceHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  confidenceTitle: {
    fontSize: 16,
    fontWeight: "500",
  },
  confidenceScore: {
    fontSize: 18,
    fontWeight: "bold",
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: "#333333",
    borderRadius: 4,
    marginBottom: 8,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
  },
  confidenceDescription: {
    fontSize: 12,
    lineHeight: 18,
  },
  tabsContainer: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#333333",
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
  },
  tabText: {
    fontSize: 14,
    fontWeight: "500",
  },
  tabContent: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
    marginTop: 16,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 16,
  },
  finderCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 12,
    marginTop: 8,
  },
  finderImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  finderInfo: {
    flex: 1,
    marginLeft: 12,
  },
  finderName: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  ratingText: {
    marginLeft: 4,
    fontSize: 14,
  },
  contactButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  contactButtonText: {
    color: "#FFFFFF",
    fontWeight: "500",
  },
  timelineContainer: {
    marginTop: 8,
  },
  timelineItem: {
    flexDirection: "row",
    marginBottom: 16,
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginTop: 4,
  },
  timelineLine: {
    width: 2,
    height: "100%",
    position: "absolute",
    left: 5,
    top: 12,
  },
  timelineContent: {
    marginLeft: 16,
    flex: 1,
  },
  timelineEvent: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 4,
  },
  timelineDate: {
    fontSize: 14,
  },
  similarItemsContainer: {
    marginTop: 8,
  },
  similarItemsText: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  similarItemsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  similarItemCard: {
    width: "48%",
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 16,
  },
  similarItemImage: {
    width: "100%",
    height: 120,
  },
  similarItemTitle: {
    padding: 8,
    fontSize: 14,
    fontWeight: "500",
  },
  actionButtons: {
    flexDirection: "row",
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#333333",
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginRight: 8,
  },
  actionButtonText: {
    marginLeft: 8,
    fontWeight: "500",
  },
  claimButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 8,
  },
  claimButtonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },
})

export default ItemDetailsScreen

