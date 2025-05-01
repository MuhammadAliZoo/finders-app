'use client';

import { useState, useEffect, useRef } from 'react';
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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeContext';
import { adminApi } from '../../api/admin';
import ModerateItemCard from '../../components/admin/ModerateItemCard';
import FilterChip from '../../components/admin/FilterChip';
import AdminChat from '../../components/admin/AdminChat';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList, ModerationItem } from '../../navigation/types';

interface ModerationRule {
  id: number;
  name: string;
  description: string;
  active: boolean;
}

type ContentModerationScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'ContentModeration'>;
};

interface FilterChipProps {
  label: string;
  isSelected: boolean;
  onPress: () => void;
  count?: number;
}

interface ModerateItemCardProps {
  item: ModerationItem;
  isSelected: boolean;
  onSelect: () => void;
  onPress: () => void;
  onChatPress: () => void;
}

const ContentModerationScreen: React.FC<ContentModerationScreenProps> = ({ navigation }) => {
  const { colors } = useTheme();
  const [items, setItems] = useState<ModerationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showChatModal, setShowChatModal] = useState(false);
  const [currentItem, setCurrentItem] = useState<ModerationItem | null>(null);
  const [moderationRules, setModerationRules] = useState<ModerationRule[]>([]);
  const [showRulesModal, setShowRulesModal] = useState(false);

  const chatRef = useRef(null);

  useEffect(() => {
    fetchItems();
    fetchModerationRules();
  }, [filterStatus, sortBy]);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getItemsForModeration(filterStatus, sortBy);
      setItems(data);
    } catch (error) {
      console.error('Failed to fetch items for moderation', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchModerationRules = async () => {
    try {
      const rules = await adminApi.getModerationRules();
      setModerationRules(rules);
    } catch (error) {
      console.error('Failed to fetch moderation rules', error);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchItems();
  };

  const handleSearch = (text: string) => {
    setSearchQuery(text);
    // Implement search functionality here
  };

  const toggleItemSelection = (itemId: string) => {
    setSelectedItems(prev =>
      prev.includes(itemId) ? prev.filter(id => id !== itemId) : [...prev, itemId],
    );
  };

  const selectAllItems = () => {
    setSelectedItems(selectedItems.length === items.length ? [] : items.map(item => item.id));
  };

  const handleBatchAction = async (action: 'approve' | 'reject') => {
    if (selectedItems.length === 0) {
      Alert.alert('No Items Selected', 'Please select at least one item to perform this action.');
      return;
    }

    try {
      setLoading(true);
      await adminApi.batchModerateItems(selectedItems, action);
      fetchItems();
      setSelectedItems([]);
      Alert.alert(
        'Success',
        `${selectedItems.length} items have been ${action === 'approve' ? 'approved' : 'rejected'}.`,
      );
    } catch (error) {
      console.error(`Failed to ${action} items`, error);
      Alert.alert('Error', `Failed to ${action} items. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  const openItemDetails = (item: ModerationItem) => {
    setCurrentItem(item);
    navigation.navigate('ItemModeration', { item });
  };

  const openChat = (item: ModerationItem) => {
    setCurrentItem(item);
    setShowChatModal(true);
  };

  const renderItem = ({ item }: { item: ModerationItem }) => (
    <ModerateItemCard
      moderationItem={item}
      isSelected={selectedItems.includes(item.id)}
      onSelect={() => toggleItemSelection(item.id)}
      onPress={() => openItemDetails(item)}
      onChatPress={() => openChat(item)}
    />
  );

  const renderFilterChip = ({
    label,
    value,
    count = 0,
  }: {
    label: string;
    value: string;
    count?: number;
  }) => (
    <FilterChip
      label={label}
      isSelected={filterStatus === value}
      onPress={() => setFilterStatus(value)}
      count={count}
    />
  );

  const renderFilterModal = () => (
    <Modal
      visible={showFilterModal}
      transparent
      animationType="slide"
      onRequestClose={() => setShowFilterModal(false)}
    >
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
            {renderFilterChip({ label: 'All', value: 'all', count: items.length })}
            {renderFilterChip({
              label: 'Pending',
              value: 'pending',
              count: items.filter(i => i.status === 'pending').length,
            })}
            {renderFilterChip({
              label: 'Flagged',
              value: 'flagged',
              count: items.filter(i => i.status === 'flagged').length,
            })}
            {renderFilterChip({
              label: 'AI Flagged',
              value: 'ai_flagged',
              count: items.filter(i => i.status === 'ai_flagged').length,
            })}
          </View>

          <Text style={[styles.filterSectionTitle, { color: colors.text }]}>Sort By</Text>
          <View style={styles.filterChips}>
            {renderFilterChip({ label: 'Date (Newest)', value: 'date', count: 0 })}
            {renderFilterChip({ label: 'Priority', value: 'priority', count: 0 })}
            {renderFilterChip({ label: 'User Rating', value: 'rating', count: 0 })}
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
  );

  const renderRulesModal = () => (
    <Modal
      visible={showRulesModal}
      transparent
      animationType="slide"
      onRequestClose={() => setShowRulesModal(false)}
    >
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
            keyExtractor={item => item.id.toString()}
            renderItem={({ item }) => (
              <View style={[styles.ruleItem, { borderBottomColor: colors.border }]}>
                <View style={styles.ruleHeader}>
                  <Text style={[styles.ruleName, { color: colors.text }]}>{item.name}</Text>
                  <View
                    style={[
                      styles.ruleStatusBadge,
                      {
                        backgroundColor: item.active ? colors.primary + '20' : colors.error + '20',
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.ruleStatusText,
                        { color: item.active ? colors.primary : colors.error },
                      ]}
                    >
                      {item.active ? 'Active' : 'Inactive'}
                    </Text>
                  </View>
                </View>
                <Text style={[styles.ruleDescription, { color: colors.secondary }]}>
                  {item.description}
                </Text>
                <View style={styles.ruleActions}>
                  <TouchableOpacity
                    style={[styles.ruleActionButton, { borderColor: colors.border }]}
                  >
                    <Text style={[styles.ruleActionText, { color: colors.primary }]}>Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.ruleActionButton, { borderColor: colors.border }]}
                  >
                    <Text
                      style={[
                        styles.ruleActionText,
                        { color: item.active ? colors.error : colors.primary },
                      ]}
                    >
                      {item.active ? 'Disable' : 'Enable'}
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
  );

  const renderChatModal = () => (
    <Modal
      visible={showChatModal}
      transparent
      animationType="slide"
      onRequestClose={() => setShowChatModal(false)}
    >
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
              <Image
                source={{ uri: currentItem.images[0] }}
                style={styles.chatItemImage}
                resizeMode="cover"
              />
              <View style={styles.chatItemInfo}>
                <Text style={[styles.chatItemTitle, { color: colors.text }]} numberOfLines={1}>
                  {currentItem.title}
                </Text>
                <Text style={[styles.chatItemId, { color: colors.secondary }]}>
                  ID: {currentItem.id}
                </Text>
              </View>
              <TouchableOpacity
                style={[styles.viewItemButton, { backgroundColor: colors.primary + '20' }]}
                onPress={() => {
                  setShowChatModal(false);
                  openItemDetails(currentItem);
                }}
              >
                <Text style={[styles.viewItemText, { color: colors.primary }]}>View</Text>
              </TouchableOpacity>
            </View>
          )}

          <AdminChat
            onClose={() => setShowChatModal(false)}
            onSend={message => {
              // Handle sending message
              console.log('Sending message:', message);
            }}
          />
        </View>
      </View>
    </Modal>
  );

  const styles = StyleSheet.create({
    actionBar: {
      alignItems: 'center',
      backgroundColor: colors.card,
      borderBottomColor: colors.border,
      borderBottomWidth: 1,
      flexDirection: 'row',
      justifyContent: 'space-between',
      padding: 16,
    },
    addRuleButton: {
      alignItems: 'center',
      borderRadius: 8,
      flexDirection: 'row',
      justifyContent: 'center',
      marginTop: 16,
      paddingVertical: 12,
    },
    addRuleText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: 'bold',
      marginLeft: 8,
    },
    applyFilterButton: {
      alignItems: 'center',
      borderRadius: 8,
      marginTop: 16,
      paddingVertical: 12,
    },
    applyFilterText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: 'bold',
    },
    approveButton: {
      backgroundColor: colors.success,
      borderRadius: 8,
      paddingHorizontal: 16,
      paddingVertical: 8,
    },
    batchActionBar: {
      alignItems: 'center',
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingVertical: 12,
    },
    batchButton: {
      alignItems: 'center',
      borderRadius: 6,
      flexDirection: 'row',
      marginLeft: 8,
      paddingHorizontal: 12,
      paddingVertical: 6,
    },
    batchButtonText: {
      fontSize: 14,
      fontWeight: '500',
      marginLeft: 4,
    },
    batchButtons: {
      flexDirection: 'row',
    },
    buttonText: {
      color: '#FFFFFF',
      fontWeight: '600',
    },
    chatItemId: {
      fontSize: 12,
    },
    chatItemImage: {
      borderRadius: 4,
      height: 40,
      width: 40,
    },
    chatItemInfo: {
      flex: 1,
      marginLeft: 12,
    },
    chatItemPreview: {
      alignItems: 'center',
      borderRadius: 8,
      flexDirection: 'row',
      marginHorizontal: 16,
      marginVertical: 8,
      padding: 12,
    },
    chatItemTitle: {
      fontSize: 14,
      fontWeight: '500',
    },
    chatModalContent: {
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      flex: 1,
      marginTop: 50,
    },
    chatModalHeader: {
      alignItems: 'center',
      borderBottomColor: 'rgba(0, 0, 0, 0.1)',
      borderBottomWidth: 1,
      flexDirection: 'row',
      justifyContent: 'space-between',
      padding: 16,
    },
    chatModalOverlay: {
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      flex: 1,
    },
    chatModalTitle: {
      fontSize: 18,
      fontWeight: 'bold',
    },
    container: {
      backgroundColor: colors.background,
      flex: 1,
    },
    contentActions: {
      flexDirection: 'row',
      gap: 8,
      justifyContent: 'flex-end',
    },
    contentBody: {
      marginBottom: 12,
    },
    contentHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 12,
    },
    contentItem: {
      backgroundColor: colors.card,
      borderColor: colors.border,
      borderRadius: 12,
      borderWidth: 1,
      marginBottom: 16,
      padding: 16,
    },
    contentList: {
      flex: 1,
      padding: 16,
    },
    contentStatus: {
      color: colors.text,
      fontSize: 14,
    },
    contentText: {
      color: colors.text,
      fontSize: 14,
      lineHeight: 20,
    },
    contentTitle: {
      color: colors.text,
      fontSize: 16,
      fontWeight: '600',
    },
    disabledButton: {
      opacity: 0.5,
    },
    emptyContainer: {
      alignItems: 'center',
      flex: 1,
      justifyContent: 'center',
      padding: 24,
    },
    emptySubtext: {
      color: colors.text,
      fontSize: 14,
      opacity: 0.7,
      textAlign: 'center',
    },
    emptyText: {
      color: colors.text,
      fontSize: 18,
      fontWeight: '600',
      marginBottom: 8,
      textAlign: 'center',
    },
    filterButton: {
      backgroundColor: colors.primary,
      borderRadius: 8,
      paddingHorizontal: 16,
      paddingVertical: 8,
    },
    filterButtonText: {
      color: '#FFFFFF',
      fontWeight: '600',
    },
    filterChips: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
      padding: 10,
    },
    filterSectionTitle: {
      color: colors.text,
      fontSize: 16,
      fontWeight: '600',
      marginBottom: 10,
    },
    listContent: {
      flex: 1,
    },
    loadingContainer: {
      alignItems: 'center',
      flex: 1,
      justifyContent: 'center',
    },
    loadingText: {
      color: colors.text,
      fontSize: 16,
      fontWeight: '500',
      marginTop: 16,
    },
    modalContent: {
      backgroundColor: colors.card,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      minHeight: '50%',
      padding: 20,
    },
    modalHeader: {
      alignItems: 'center',
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 20,
    },
    modalOverlay: {
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      flex: 1,
      justifyContent: 'flex-end',
    },
    modalTitle: {
      color: colors.text,
      fontSize: 20,
      fontWeight: 'bold',
    },
    rejectButton: {
      backgroundColor: colors.error,
      borderRadius: 8,
      paddingHorizontal: 16,
      paddingVertical: 8,
    },
    ruleActionButton: {
      borderRadius: 6,
      borderWidth: 1,
      marginRight: 8,
      paddingHorizontal: 12,
      paddingVertical: 6,
    },
    ruleActionText: {
      fontSize: 14,
      fontWeight: '500',
    },
    ruleActions: {
      flexDirection: 'row',
    },
    ruleDescription: {
      fontSize: 14,
      marginBottom: 8,
      marginTop: 4,
    },
    ruleHeader: {
      alignItems: 'center',
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    ruleItem: {
      borderBottomWidth: 1,
      paddingVertical: 12,
    },
    ruleName: {
      fontSize: 16,
      fontWeight: '600',
    },
    ruleStatusBadge: {
      borderRadius: 4,
      paddingHorizontal: 8,
      paddingVertical: 4,
    },
    ruleStatusText: {
      fontSize: 12,
      fontWeight: '500',
    },
    rulesButton: {
      alignItems: 'center',
      borderRadius: 8,
      height: 44,
      justifyContent: 'center',
      marginLeft: 8,
      width: 44,
    },
    searchContainer: {
      alignItems: 'center',
      backgroundColor: colors.background,
      borderRadius: 8,
      flex: 1,
      flexDirection: 'row',
      marginRight: 16,
      paddingHorizontal: 12,
    },
    searchInput: {
      color: colors.text,
      flex: 1,
      height: 40,
      marginLeft: 8,
    },
    selectAllButton: {
      alignItems: 'center',
      flexDirection: 'row',
    },
    selectAllText: {
      fontSize: 14,
      fontWeight: '500',
      marginLeft: 8,
    },
    viewItemButton: {
      borderRadius: 6,
      paddingHorizontal: 12,
      paddingVertical: 6,
    },
    viewItemText: {
      fontSize: 12,
      fontWeight: '500',
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.actionBar}>
        <View style={styles.searchContainer}>
          <Ionicons name="search-outline" size={20} color={colors.secondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search items..."
            placeholderTextColor={colors.secondary}
            value={searchQuery}
            onChangeText={handleSearch}
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color={colors.secondary} />
            </TouchableOpacity>
          ) : null}
        </View>

        <TouchableOpacity style={styles.filterButton} onPress={() => setShowFilterModal(true)}>
          <Text style={styles.filterButtonText}>Filter</Text>
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
            name={selectedItems.length === items.length ? 'checkbox' : 'square-outline'}
            size={20}
            color={colors.primary}
          />
          <Text style={[styles.selectAllText, { color: colors.text }]}>
            {selectedItems.length === items.length ? 'Deselect All' : 'Select All'}
          </Text>
        </TouchableOpacity>

        <View style={styles.batchButtons}>
          <TouchableOpacity
            style={[
              styles.batchButton,
              { backgroundColor: colors.primary + '20' },
              selectedItems.length === 0 && styles.disabledButton,
            ]}
            onPress={() => handleBatchAction('approve')}
            disabled={selectedItems.length === 0}
          >
            <Ionicons name="checkmark" size={20} color={colors.primary} />
            <Text style={[styles.batchButtonText, { color: colors.primary }]}>
              Approve ({selectedItems.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.batchButton,
              { backgroundColor: colors.error + '20' },
              selectedItems.length === 0 && styles.disabledButton,
            ]}
            onPress={() => handleBatchAction('reject')}
            disabled={selectedItems.length === 0}
          >
            <Ionicons name="close" size={20} color={colors.error} />
            <Text style={[styles.batchButtonText, { color: colors.error }]}>
              Reject ({selectedItems.length})
            </Text>
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
          keyExtractor={item => item.id.toString()}
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
  );
};

export default ContentModerationScreen;
