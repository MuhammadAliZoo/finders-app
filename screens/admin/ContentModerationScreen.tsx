"use client"

import { useState, useEffect, useRef } from "react"
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Image,
  Modal,
  Alert,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useTheme } from "../../context/ThemeContext"
import { adminApi } from "../../api/admin"
import AdminHeader from "../../components/admin/AdminHeader"
import ModerateItemCard from "../../components/admin/ModerateItemCard"
import FilterChip from "../../components/admin/FilterChip"
import AdminChat from "../../components/admin/AdminChat"

const ContentModerationScreen = ({ navigation }) => {
  const { colors } = useTheme()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [selectedItems, setSelectedItems] = useState([])
  const [filterStatus, setFilterStatus] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState("date")
  const [showFilterModal, setShowFilterModal] = useState(false)
  const [showChatModal, setShowChatModal] = useState(false)
  const [currentItem, setCurrentItem] = useState(null)
  const [moderationRules, setModerationRules] = useState([])
  const [showRulesModal, setShowRulesModal] = useState(false)

  const chatRef = useRef(null)

  useEffect(() => {
    fetchItems()
    fetchModerationRules()
  }, [filterStatus, sortBy])

  const fetchItems = async () => {
    try {
      setLoading(true)
      const data = await adminApi.getItemsForModeration(filterStatus, sortBy)
      setItems(data)
    } catch (error) {
      console.error("Failed to fetch items for moderation", error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const fetchModerationRules = async () => {
    try {
      const rules = await adminApi.getModerationRules()
      setModerationRules(rules)
    } catch (error) {
      console.error("Failed to fetch moderation rules", error)
    }
  }

  const onRefresh = () => {
    setRefreshing(true)
    fetchItems()
  }

  const handleSearch = (text) => {
    setSearchQuery(text)
    // Implement search functionality here
  }

  const toggleItemSelection = (itemId) => {
    if (selectedItems.includes(itemId)) {
      setSelectedItems(selectedItems.filter((id) => id !== itemId))
    } else {
      setSelectedItems([...selectedItems, itemId])
    }
  }

  const selectAllItems = () => {
    if (selectedItems.length === items.length) {
      setSelectedItems([])
    } else {
      setSelectedItems(items.map((item) => item.id))
    }
  }

  const handleBatchAction = async (action) => {
    if (selectedItems.length === 0) {
      Alert.alert("No Items Selected", "Please select at least one item to perform this action.")
      return
    }

    try {
      setLoading(true)
      await adminApi.batchModerateItems(selectedItems, action)
      fetchItems()
      setSelectedItems([])
      Alert.alert(
        "Success",
        `${selectedItems.length} items have been ${action === "approve" ? "approved" : "rejected"}.`,
      )
    } catch (error) {
      console.error(`Failed to ${action} items`, error)
      Alert.alert("Error", `Failed to ${action} items. Please try again.`)
    } finally {
      setLoading(false)
    }
  }

  const openItemDetails = (item) => {
    setCurrentItem(item)
    navigation.navigate("ItemModeration", { item })
  }

  const openChat = (item) => {
    setCurrentItem(item)
    setShowChatModal(true)
  }

  const renderItem = ({ item }) => (
    <ModerateItemCard
      item={item}
      isSelected={selectedItems.includes(item.id)}
      onSelect={() => toggleItemSelection(item.id)}
      onPress={() => openItemDetails(item)}
      onChatPress={() => openChat(item)}
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
            <FilterChip
              label="Pending"
              isSelected={filterStatus === "pending"}
              onPress={() => setFilterStatus("pending")}
            />
            <FilterChip
              label="Flagged"
              isSelected={filterStatus === "flagged"}
              onPress={() => setFilterStatus("flagged")}
            />
            <FilterChip
              label="AI Flagged"
              isSelected={filterStatus === "ai_flagged"}
              onPress={() => setFilterStatus("ai_flagged")}
            />
          </View>

          <Text style={[styles.filterSectionTitle, { color: colors.text }]}>Sort By</Text>
          <View style={styles.filterChips}>
            <FilterChip label="Date (Newest)" isSelected={sortBy === "date"} onPress={() => setSortBy("date")} />
            <FilterChip label="Priority" isSelected={sortBy === "priority"} onPress={() => setSortBy("priority")} />
            <FilterChip label="User Rating" isSelected={sortBy === "rating"} onPress={() => setSortBy("rating")} />
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

  const renderRulesModal = () => (
    <Modal visible={showRulesModal} transparent animationType="slide" onRequestClose={() => setShowRulesModal(false)}>
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Moderation Rules</Text>
            <TouchableOpacity onPress={() => setShowRulesModal(false)}>
              <Ionicons name="close" size={24} color={colors.secondary} />
            </TouchableOpacity>
          </View>

          <FlatList
            data={moderationRules}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <View style={[styles.ruleItem, { borderBottomColor: colors.border }]}>
                <View style={styles.ruleHeader}>
                  <Text style={[styles.ruleName, { color: colors.text }]}>{item.name}</Text>
                  <View
                    style={[
                      styles.ruleStatusBadge,
                      { backgroundColor: item.active ? colors.success + "20" : colors.error + "20" },
                    ]}
                  >
                    <Text style={[styles.ruleStatusText, { color: item.active ? colors.success : colors.error }]}>
                      {item.active ? "Active" : "Inactive"}
                    </Text>
                  </View>
                </View>
                <Text style={[styles.ruleDescription, { color: colors.secondary }]}>{item.description}</Text>
                <View style={styles.ruleActions}>
                  <TouchableOpacity style={[styles.ruleActionButton, { borderColor: colors.border }]}>
                    <Text style={[styles.ruleActionText, { color: colors.primary }]}>Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.ruleActionButton, { borderColor: colors.border }]}>
                    <Text style={[styles.ruleActionText, { color: item.active ? colors.error : colors.success }]}>
                      {item.active ? "Disable" : "Enable"}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          />

          <TouchableOpacity style={[styles.addRuleButton, { backgroundColor: colors.primary }]}>
            <Ionicons name="add" size={20} color="#FFFFFF" />
            <Text style={styles.addRuleText}>Add New Rule</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  )

  const renderChatModal = () => (
    <Modal visible={showChatModal} transparent animationType="slide" onRequestClose={() => setShowChatModal(false)}>
      <View style={styles.chatModalOverlay}>
        <View style={[styles.chatModalContent, { backgroundColor: colors.card }]}>
          <View style={styles.chatModalHeader}>
            <TouchableOpacity onPress={() => setShowChatModal(false)}>
              <Ionicons name="arrow-back" size={24} color={colors.text} />
            </TouchableOpacity>
            <Text style={[styles.chatModalTitle, { color: colors.text }]}>Collaboration Chat</Text>
            <TouchableOpacity>
              <Ionicons name="ellipsis-vertical" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          {currentItem && (
            <View style={[styles.chatItemPreview, { backgroundColor: colors.background }]}>
              <Image source={{ uri: currentItem.images[0] }} style={styles.chatItemImage} resizeMode="cover" />
              <View style={styles.chatItemInfo}>
                <Text style={[styles.chatItemTitle, { color: colors.text }]} numberOfLines={1}>
                  {currentItem.title}
                </Text>
                <Text style={[styles.chatItemId, { color: colors.secondary }]}>ID: {currentItem.id}</Text>
              </View>
              <TouchableOpacity
                style={[styles.viewItemButton, { backgroundColor: colors.primary + "20" }]}
                onPress={() => {
                  setShowChatModal(false)
                  openItemDetails(currentItem)
                }}
              >
                <Text style={[styles.viewItemText, { color: colors.primary }]}>View</Text>
              </TouchableOpacity>
            </View>
          )}

          <AdminChat ref={chatRef} itemId={currentItem?.id} onClose={() => setShowChatModal(false)} />
        </View>
      </View>
    </Modal>
  )

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <AdminHeader title="Content Moderation" navigation={navigation} />

      <View style={styles.actionBar}>
        <View style={[styles.searchContainer, { backgroundColor: colors.card }]}>
          <Ionicons name="search-outline" size={20} color={colors.secondary} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search items..."
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

        <TouchableOpacity
          style={[styles.rulesButton, { backgroundColor: colors.card }]}
          onPress={() => setShowRulesModal(true)}
        >
          <Ionicons name="list-outline" size={20} color={colors.secondary} />
        </TouchableOpacity>
      </View>

      <View style={styles.batchActionBar}>
        <TouchableOpacity style={styles.selectAllButton} onPress={selectAllItems}>
          <Ionicons
            name={selectedItems.length === items.length ? "checkbox" : "square-outline"}
            size={20}
            color={colors.primary}
          />
          <Text style={[styles.selectAllText, { color: colors.text }]}>
            {selectedItems.length === items.length ? "Deselect All" : "Select All"}
          </Text>
        </TouchableOpacity>

        <View style={styles.batchButtons}>
          <TouchableOpacity
            style={[
              styles.batchButton,
              { backgroundColor: colors.success + "20" },
              selectedItems.length === 0 && styles.disabledButton,
            ]}
            onPress={() => handleBatchAction("approve")}
            disabled={selectedItems.length === 0}
          >
            <Ionicons name="checkmark" size={20} color={colors.success} />
            <Text style={[styles.batchButtonText, { color: colors.success }]}>Approve ({selectedItems.length})</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.batchButton,
              { backgroundColor: colors.error + "20" },
              selectedItems.length === 0 && styles.disabledButton,
            ]}
            onPress={() => handleBatchAction("reject")}
            disabled={selectedItems.length === 0}
          >
            <Ionicons name="close" size={20} color={colors.error} />
            <Text style={[styles.batchButtonText, { color: colors.error }]}>Reject ({selectedItems.length})</Text>
          </TouchableOpacity>
        </View>
      </View>

      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.secondary }]}>Loading items...</Text>
        </View>
      ) : (
        <FlatList
          data={items}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          onRefresh={onRefresh}
          refreshing={refreshing}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="document-text-outline" size={64} color={colors.secondary} />
              <Text style={[styles.emptyText, { color: colors.text }]}>No items to moderate</Text>
              <Text style={[styles.emptySubtext, { color: colors.secondary }]}>
                All caught up! Check back later for new items.
              </Text>
            </View>
          }
        />
      )}

      {renderFilterModal()}
      {renderRulesModal()}
      {renderChatModal()}
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
  rulesButton: {
    width: 44,
    height: 44,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },
  batchActionBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  selectAllButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  selectAllText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: "500",
  },
  batchButtons: {
    flexDirection: "row",
  },
  batchButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    marginLeft: 8,
  },
  batchButtonText: {
    marginLeft: 4,
    fontSize: 14,
    fontWeight: "500",
  },
  disabledButton: {
    opacity: 0.5,
  },
  listContent: {
    padding: 16,
    paddingTop: 0,
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
  ruleItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  ruleHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  ruleName: {
    fontSize: 16,
    fontWeight: "600",
  },
  ruleStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  ruleStatusText: {
    fontSize: 12,
    fontWeight: "500",
  },
  ruleDescription: {
    fontSize: 14,
    marginTop: 4,
    marginBottom: 8,
  },
  ruleActions: {
    flexDirection: "row",
  },
  ruleActionButton: {
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
  },
  ruleActionText: {
    fontSize: 14,
    fontWeight: "500",
  },
  addRuleButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
    paddingVertical: 12,
    marginTop: 16,
  },
  addRuleText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 8,
  },
  chatModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  chatModalContent: {
    flex: 1,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    marginTop: 50,
  },
  chatModalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0, 0, 0, 0.1)",
  },
  chatModalTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  chatItemPreview: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 8,
  },
  chatItemImage: {
    width: 40,
    height: 40,
    borderRadius: 4,
  },
  chatItemInfo: {
    flex: 1,
    marginLeft: 12,
  },
  chatItemTitle: {
    fontSize: 14,
    fontWeight: "500",
  },
  chatItemId: {
    fontSize: 12,
  },
  viewItemButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  viewItemText: {
    fontSize: 12,
    fontWeight: "500",
  },
})

export default ContentModerationScreen

