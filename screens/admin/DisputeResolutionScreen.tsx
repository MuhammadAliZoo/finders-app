"use client"

import { useState, useEffect } from "react"
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Modal,
  ScrollView, // Added ScrollView import
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useTheme } from "../../context/ThemeContext"
import { adminApi } from "../../api/admin"
import AdminHeader from "../../components/admin/AdminHeader"
import DisputeCard from "../../components/admin/DisputeCard"
import FilterChip from "../../components/admin/FilterChip"
import DisputeTimeline from "../../components/admin/DisputeTimeline"
import AIRecommendation from "../../components/admin/AIRecommendation"

const DisputeResolutionScreen = ({ navigation }) => {
  const { colors } = useTheme()
  const [disputes, setDisputes] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [filterStatus, setFilterStatus] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState("date")
  const [showFilterModal, setShowFilterModal] = useState(false)
  const [selectedDispute, setSelectedDispute] = useState(null)
  const [showDisputeModal, setShowDisputeModal] = useState(false)
  const [aiRecommendation, setAiRecommendation] = useState(null)
  const [loadingRecommendation, setLoadingRecommendation] = useState(false)

  useEffect(() => {
    fetchDisputes()
  }, [filterStatus, sortBy])

  const fetchDisputes = async () => {
    try {
      setLoading(true)
      const data = await adminApi.getDisputes(filterStatus, sortBy)
      setDisputes(data)
    } catch (error) {
      console.error("Failed to fetch disputes", error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const onRefresh = () => {
    setRefreshing(true)
    fetchDisputes()
  }

  const handleSearch = (text) => {
    setSearchQuery(text)
    // Implement search functionality here
  }

  const openDisputeDetails = (dispute) => {
    navigation.navigate("DisputeDetails", { dispute })
  }

  const openQuickView = async (dispute) => {
    setSelectedDispute(dispute)
    setShowDisputeModal(true)

    try {
      setLoadingRecommendation(true)
      const recommendation = await adminApi.getAIRecommendation(dispute.id)
      setAiRecommendation(recommendation)
    } catch (error) {
      console.error("Failed to get AI recommendation", error)
      setAiRecommendation(null)
    } finally {
      setLoadingRecommendation(false)
    }
  }

  const initiateCall = (dispute) => {
    // Implement call functionality
    console.log("Initiating call for dispute:", dispute.id)
  }

  const renderItem = ({ item }) => (
    <DisputeCard
      dispute={item}
      onPress={() => openDisputeDetails(item)}
      onQuickView={() => openQuickView(item)}
      onCall={() => initiateCall(item)}
    />
  )

  const renderFilterModal = () => (
    <Modal visible={showFilterModal} transparent animationType="slide" onRequestClose={() => setShowFilterModal(false)}>
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Filter & Sort</Text>
            <TouchableOpacity onPress={() => setShowFilterModal(false)}>
              <Ionicons name="close" size={24} color={colors.secondary} />
            </TouchableOpacity>
          </View>

          <Text style={[styles.filterSectionTitle, { color: colors.text }]}>Status</Text>
          <View style={styles.filterChips}>
            <FilterChip label="All" isSelected={filterStatus === "all"} onPress={() => setFilterStatus("all")} />
            <FilterChip label="Open" isSelected={filterStatus === "open"} onPress={() => setFilterStatus("open")} />
            <FilterChip
              label="In Progress"
              isSelected={filterStatus === "in_progress"}
              onPress={() => setFilterStatus("in_progress")}
            />
            <FilterChip
              label="Escalated"
              isSelected={filterStatus === "escalated"}
              onPress={() => setFilterStatus("escalated")}
            />
            <FilterChip
              label="Resolved"
              isSelected={filterStatus === "resolved"}
              onPress={() => setFilterStatus("resolved")}
            />
          </View>

          <Text style={[styles.filterSectionTitle, { color: colors.text }]}>Sort By</Text>
          <View style={styles.filterChips}>
            <FilterChip label="Date (Newest)" isSelected={sortBy === "date"} onPress={() => setSortBy("date")} />
            <FilterChip label="Priority" isSelected={sortBy === "priority"} onPress={() => setSortBy("priority")} />
            <FilterChip
              label="Response Time"
              isSelected={sortBy === "response_time"}
              onPress={() => setSortBy("response_time")}
            />
          </View>

          <TouchableOpacity
            style={[styles.applyFilterButton, { backgroundColor: colors.primary }]}
            onPress={() => setShowFilterModal(false)}
          >
            <Text style={styles.applyFilterText}>Apply Filters</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  )

  const renderDisputeModal = () => {
    if (!selectedDispute) return null

    return (
      <Modal
        visible={showDisputeModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowDisputeModal(false)}
      >
        <View style={styles.disputeModalOverlay}>
          <View style={[styles.disputeModalContent, { backgroundColor: colors.card }]}>
            <View style={styles.disputeModalHeader}>
              <TouchableOpacity onPress={() => setShowDisputeModal(false)}>
                <Ionicons name="close" size={24} color={colors.secondary} />
              </TouchableOpacity>
              <Text style={[styles.disputeModalTitle, { color: colors.text }]}>Dispute #{selectedDispute.id}</Text>
              <TouchableOpacity onPress={() => openDisputeDetails(selectedDispute)}>
                <Text style={[styles.viewFullButton, { color: colors.primary }]}>Full View</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.disputeModalBody}>
              <View style={[styles.disputeSection, { borderBottomColor: colors.border }]}>
                <Text style={[styles.disputeSectionTitle, { color: colors.text }]}>Dispute Information</Text>
                <View style={styles.disputeInfo}>
                  <View style={styles.disputeInfoRow}>
                    <Text style={[styles.disputeInfoLabel, { color: colors.secondary }]}>Status:</Text>
                    <View
                      style={[styles.statusBadge, { backgroundColor: getStatusColor(selectedDispute.status) + "20" }]}
                    >
                      <Text style={[styles.statusText, { color: getStatusColor(selectedDispute.status) }]}>
                        {selectedDispute.status}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.disputeInfoRow}>
                    <Text style={[styles.disputeInfoLabel, { color: colors.secondary }]}>Created:</Text>
                    <Text style={[styles.disputeInfoValue, { color: colors.text }]}>
                      {new Date(selectedDispute.createdAt).toLocaleString()}
                    </Text>
                  </View>

                  <View style={styles.disputeInfoRow}>
                    <Text style={[styles.disputeInfoLabel, { color: colors.secondary }]}>Item:</Text>
                    <Text style={[styles.disputeInfoValue, { color: colors.text }]}>{selectedDispute.itemTitle}</Text>
                  </View>

                  <View style={styles.disputeInfoRow}>
                    <Text style={[styles.disputeInfoLabel, { color: colors.secondary }]}>Parties:</Text>
                    <Text style={[styles.disputeInfoValue, { color: colors.text }]}>
                      {selectedDispute.requesterName} vs {selectedDispute.finderName}
                    </Text>
                  </View>
                </View>
              </View>

              <View style={[styles.disputeSection, { borderBottomColor: colors.border }]}>
                <Text style={[styles.disputeSectionTitle, { color: colors.text }]}>Timeline</Text>
                <DisputeTimeline events={selectedDispute.timeline} />
              </View>

              <View style={styles.disputeSection}>
                <Text style={[styles.disputeSectionTitle, { color: colors.text }]}>AI Recommendation</Text>
                {loadingRecommendation ? (
                  <View style={styles.loadingRecommendation}>
                    <ActivityIndicator size="small" color={colors.primary} />
                    <Text style={[styles.loadingText, { color: colors.secondary }]}>Analyzing dispute data...</Text>
                  </View>
                ) : aiRecommendation ? (
                  <AIRecommendation recommendation={aiRecommendation} />
                ) : (
                  <Text style={[styles.noRecommendation, { color: colors.secondary }]}>
                    No AI recommendation available.
                  </Text>
                )}
              </View>
            </View>

            <View style={styles.disputeModalActions}>
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: colors.primary + "20" }]}
                onPress={() => initiateCall(selectedDispute)}
              >
                <Ionicons name="call" size={20} color={colors.primary} />
                <Text style={[styles.actionButtonText, { color: colors.primary }]}>Call Parties</Text>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.actionButton, { backgroundColor: colors.warning + "20" }]}>
                <Ionicons name="chatbubbles" size={20} color={colors.warning} />
                <Text style={[styles.actionButtonText, { color: colors.warning }]}>Group Chat</Text>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.actionButton, { backgroundColor: colors.success + "20" }]}>
                <Ionicons name="checkmark-circle" size={20} color={colors.success} />
                <Text style={[styles.actionButtonText, { color: colors.success }]}>Resolve</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    )
  }

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case "open":
        return colors.warning
      case "in_progress":
        return colors.primary
      case "escalated":
        return colors.error
      case "resolved":
        return colors.success
      default:
        return colors.secondary
    }
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <AdminHeader title="Dispute Resolution" navigation={navigation} />

      <View style={styles.actionBar}>
        <View style={[styles.searchContainer, { backgroundColor: colors.card }]}>
          <Ionicons name="search-outline" size={20} color={colors.secondary} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search disputes..."
            placeholderTextColor={colors.secondary}
            value={searchQuery}
            onChangeText={handleSearch}
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <Ionicons name="close-circle" size={20} color={colors.secondary} />
            </TouchableOpacity>
          ) : null}
        </View>

        <TouchableOpacity
          style={[styles.filterButton, { backgroundColor: colors.card }]}
          onPress={() => setShowFilterModal(true)}
        >
          <Ionicons name="options-outline" size={20} color={colors.secondary} />
        </TouchableOpacity>
      </View>

      <View style={styles.statusFilters}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <FilterChip label="All" isSelected={filterStatus === "all"} onPress={() => setFilterStatus("all")} />
          <FilterChip
            label="Open"
            isSelected={filterStatus === "open"}
            onPress={() => setFilterStatus("open")}
            count={disputes.filter((d) => d.status.toLowerCase() === "open").length}
          />
          <FilterChip
            label="In Progress"
            isSelected={filterStatus === "in_progress"}
            onPress={() => setFilterStatus("in_progress")}
            count={disputes.filter((d) => d.status.toLowerCase() === "in_progress").length}
          />
          <FilterChip
            label="Escalated"
            isSelected={filterStatus === "escalated"}
            onPress={() => setFilterStatus("escalated")}
            count={disputes.filter((d) => d.status.toLowerCase() === "escalated").length}
          />
          <FilterChip
            label="Resolved"
            isSelected={filterStatus === "resolved"}
            onPress={() => setFilterStatus("resolved")}
            count={disputes.filter((d) => d.status.toLowerCase() === "resolved").length}
          />
        </ScrollView>
      </View>

      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.secondary }]}>Loading disputes...</Text>
        </View>
      ) : (
        <FlatList
          data={disputes}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          onRefresh={onRefresh}
          refreshing={refreshing}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="shield-checkmark-outline" size={64} color={colors.secondary} />
              <Text style={[styles.emptyText, { color: colors.text }]}>No disputes found</Text>
              <Text style={[styles.emptySubtext, { color: colors.secondary }]}>
                There are no disputes matching your current filters.
              </Text>
            </View>
          }
        />
      )}

      {renderFilterModal()}
      {renderDisputeModal()}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  actionBar: {
    flexDirection: "row",
    padding: 16,
    alignItems: "center",
  },
  searchContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 44,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
  },
  filterButton: {
    width: 44,
    height: 44,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },
  statusFilters: {
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  listContent: {
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: "center",
    marginTop: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  filterSectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
    marginTop: 8,
  },
  filterChips: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 16,
  },
  applyFilterButton: {
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 16,
  },
  applyFilterText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  disputeModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  disputeModalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "90%",
  },
  disputeModalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0, 0, 0, 0.1)",
  },
  disputeModalTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  viewFullButton: {
    fontSize: 14,
    fontWeight: "500",
  },
  disputeModalBody: {
    padding: 16,
    maxHeight: "70%",
  },
  disputeSection: {
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  disputeSectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
  },
  disputeInfo: {
    backgroundColor: "rgba(0, 0, 0, 0.05)",
    borderRadius: 8,
    padding: 12,
  },
  disputeInfoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  disputeInfoLabel: {
    fontSize: 14,
    fontWeight: "500",
  },
  disputeInfoValue: {
    fontSize: 14,
    maxWidth: "60%",
    textAlign: "right",
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "500",
    textTransform: "capitalize",
  },
  loadingRecommendation: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  noRecommendation: {
    textAlign: "center",
    padding: 16,
    fontSize: 14,
  },
  disputeModalActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "rgba(0, 0, 0, 0.1)",
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    flex: 1,
    marginHorizontal: 4,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: "500",
    marginLeft: 6,
  },
})

export default DisputeResolutionScreen

