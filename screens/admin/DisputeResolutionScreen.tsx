'use client';

import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Modal,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { adminApi } from '../../api/admin';
import DisputeCard from '../../components/admin/DisputeCard';
import FilterChip from '../../components/admin/FilterChip';
import DisputeTimeline from '../../components/admin/DisputeTimeline';
import AIRecommendation from '../../components/admin/AIRecommendation';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import AdminHeader from '../../components/admin/AdminHeader';

type DisputeStatus = 'all' | 'open' | 'in_progress' | 'escalated' | 'resolved';
type SortBy = 'date' | 'priority' | 'response_time';

const mockDisputes: Dispute[] = [
  {
    id: "DSP-2024-001",
    status: "open",
    createdAt: "2024-03-15T10:30:00Z",
    itemTitle: "Lost iPhone 14 Pro - Central Park",
    requesterName: "John Smith",
    finderName: "Sarah Johnson",
    priority: "high",
    description: "Dispute regarding the condition of the found item and reward amount",
    timeline: [
      {
        id: "TL001",
        type: "message",
        timestamp: "2024-03-15T10:30:00Z",
        actor: "John Smith",
        action: "Dispute Created",
        details: "Initial dispute filed regarding item condition"
      },
      {
        id: "TL002",
        type: "action",
        timestamp: "2024-03-15T11:45:00Z",
        actor: "Sarah Johnson",
        action: "Response Received",
        details: "Finder provided evidence of item condition at time of discovery"
      },
      {
        id: "TL003",
        type: "status_change",
        timestamp: "2024-03-15T14:20:00Z",
        actor: "Admin System",
        action: "Auto-Assignment",
        details: "Dispute assigned to resolution team"
      }
    ]
  },
  {
    id: "DSP-2024-002",
    status: "in_progress",
    createdAt: "2024-03-14T15:45:00Z",
    itemTitle: "Designer Handbag - Shopping Mall",
    requesterName: "Emma Davis",
    finderName: "Michael Wilson",
    priority: "medium",
    description: "Disagreement over reward payment method",
    timeline: [
      {
        id: "TL001",
        type: "message",
        timestamp: "2024-03-14T15:45:00Z",
        actor: "Emma Davis",
        action: "Dispute Created",
        details: "Dispute filed regarding reward payment"
      },
      {
        id: "TL002",
        type: "status_change",
        timestamp: "2024-03-14T16:30:00Z",
        actor: "Support Team",
        action: "Mediation Started",
        details: "Initial contact made with both parties"
      }
    ]
  },
  {
    id: "DSP-2024-003",
    status: "escalated",
    createdAt: "2024-03-13T09:15:00Z",
    itemTitle: "Laptop - Coffee Shop",
    requesterName: "David Brown",
    finderName: "Lisa Anderson",
    priority: "high",
    description: "Dispute over item authenticity and ownership verification",
    timeline: [
      {
        id: "TL001",
        type: "message",
        timestamp: "2024-03-13T09:15:00Z",
        actor: "David Brown",
        action: "Dispute Created",
        details: "Ownership verification dispute initiated"
      },
      {
        id: "TL002",
        type: "status_change",
        timestamp: "2024-03-13T11:30:00Z",
        actor: "Support Team",
        action: "Case Escalated",
        details: "Escalated to senior resolution team due to complexity"
      }
    ]
  },
  {
    id: "DSP-2024-004",
    status: "resolved",
    createdAt: "2024-03-12T13:20:00Z",
    itemTitle: "Gold Watch - Gym",
    requesterName: "Patricia Lee",
    finderName: "Robert Taylor",
    priority: "medium",
    description: "Successfully resolved dispute about meeting location",
    timeline: [
      {
        id: "TL001",
        type: "message",
        timestamp: "2024-03-12T13:20:00Z",
        actor: "Patricia Lee",
        action: "Dispute Created",
        details: "Meeting location dispute filed"
      },
      {
        id: "TL002",
        type: "status_change",
        timestamp: "2024-03-12T15:45:00Z",
        actor: "Support Team",
        action: "Resolution Reached",
        details: "Agreed on neutral meeting location with security presence"
      },
      {
        id: "TL003",
        type: "resolution",
        timestamp: "2024-03-12T18:00:00Z",
        actor: "System",
        action: "Case Closed",
        details: "Successful item handover confirmed by both parties"
      }
    ]
  }
];

export interface Dispute {
  id: string;
  status: string;
  createdAt: string;
  itemTitle: string;
  requesterName: string;
  finderName: string;
  priority: 'low' | 'medium' | 'high';
  description: string;
  timeline: Array<{
    id: string;
    type: 'message' | 'status_change' | 'action' | 'resolution';
    timestamp: string;
    actor: string;
    action: string;
    details: string;
  }>;
}

interface AIRecommendationData {
  title: string;
  description: string;
  confidence: number;
  action: string;
}

type DisputeResolutionScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'DisputeResolution'>;
};

const DisputeResolutionScreen = ({ navigation }: DisputeResolutionScreenProps) => {
  const { colors } = useTheme();
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filterStatus, setFilterStatus] = useState<DisputeStatus>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortBy>('date');
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [selectedDispute, setSelectedDispute] = useState<Dispute | null>(null);
  const [showDisputeModal, setShowDisputeModal] = useState(false);
  const [aiRecommendation, setAiRecommendation] = useState<AIRecommendationData | null>(null);
  const [loadingRecommendation, setLoadingRecommendation] = useState(false);

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      let filteredDisputes = [...mockDisputes];
      
      if (filterStatus !== 'all') {
        filteredDisputes = filteredDisputes.filter(
          d => d.status.toLowerCase() === filterStatus
        );
      }

      filteredDisputes.sort((a, b) => {
        switch (sortBy) {
          case 'date':
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          case 'priority':
            const priorityOrder = { high: 3, medium: 2, low: 1 };
            return priorityOrder[b.priority] - priorityOrder[a.priority];
          case 'response_time':
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          default:
            return 0;
        }
      });

      setDisputes(filteredDisputes);
      setLoading(false);
      setRefreshing(false);
    }, 1000);
  }, [filterStatus, sortBy]);

  const onRefresh = () => {
    setRefreshing(true);
    setFilterStatus(filterStatus);
  };

  const handleSearch = (text: string) => {
    setSearchQuery(text);
    // Implement search functionality here
  };

  const openDisputeDetails = (dispute: Dispute) => {
    navigation.navigate('DisputeDetails', { dispute });
  };

  const openQuickView = async (dispute: Dispute) => {
    setSelectedDispute(dispute);
    setShowDisputeModal(true);

    try {
      setLoadingRecommendation(true);
      const recommendation = await adminApi.getAIRecommendation(dispute.id);
      setAiRecommendation({
        title: 'AI Analysis',
        description: recommendation.recommendation,
        confidence: 0.85,
        action: 'Review and take action',
      });
    } catch (error) {
      console.error('Failed to get AI recommendation', error);
      setAiRecommendation(null);
    } finally {
      setLoadingRecommendation(false);
    }
  };

  const initiateCall = (dispute: Dispute) => {
    // Implement call functionality
    console.log('Initiating call for dispute:', dispute.id);
  };

  const renderItem = ({ item }: { item: Dispute }) => (
    <DisputeCard
      dispute={item}
      onPress={() => openDisputeDetails(item)}
      onQuickView={() => openQuickView(item)}
      onCall={() => initiateCall(item)}
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
            <FilterChip
              label="All"
              isSelected={filterStatus === 'all'}
              onPress={() => setFilterStatus('all')}
              count={0}
            />
            <FilterChip
              label="Open"
              isSelected={filterStatus === 'open'}
              onPress={() => setFilterStatus('open')}
              count={0}
            />
            <FilterChip
              label="In Progress"
              isSelected={filterStatus === 'in_progress'}
              onPress={() => setFilterStatus('in_progress')}
              count={0}
            />
            <FilterChip
              label="Escalated"
              isSelected={filterStatus === 'escalated'}
              onPress={() => setFilterStatus('escalated')}
              count={0}
            />
            <FilterChip
              label="Resolved"
              isSelected={filterStatus === 'resolved'}
              onPress={() => setFilterStatus('resolved')}
              count={0}
            />
          </View>

          <Text style={[styles.filterSectionTitle, { color: colors.text }]}>Sort By</Text>
          <View style={styles.filterChips}>
            <FilterChip
              label="Date (Newest)"
              isSelected={sortBy === 'date'}
              onPress={() => setSortBy('date')}
              count={0}
            />
            <FilterChip
              label="Priority"
              isSelected={sortBy === 'priority'}
              onPress={() => setSortBy('priority')}
              count={0}
            />
            <FilterChip
              label="Response Time"
              isSelected={sortBy === 'response_time'}
              onPress={() => setSortBy('response_time')}
              count={0}
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
  );

  const renderDisputeModal = () => {
    if (!selectedDispute) return null;

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
              <Text style={[styles.disputeModalTitle, { color: colors.text }]}>
                Dispute #{selectedDispute.id}
              </Text>
              <TouchableOpacity onPress={() => openDisputeDetails(selectedDispute)}>
                <Text style={[styles.viewFullButton, { color: colors.primary }]}>Full View</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.disputeModalBody}>
              <View style={[styles.disputeSection, { borderBottomColor: colors.border }]}>
                <Text style={[styles.disputeSectionTitle, { color: colors.text }]}>
                  Dispute Information
                </Text>
                <View style={styles.disputeInfo}>
                  <View style={styles.disputeInfoRow}>
                    <Text style={[styles.disputeInfoLabel, { color: colors.secondary }]}>
                      Status:
                    </Text>
                    <View
                      style={[
                        styles.statusBadge,
                        { backgroundColor: getStatusColor(selectedDispute.status) + '20' },
                      ]}
                    >
                      <Text
                        style={[
                          styles.statusText,
                          { color: getStatusColor(selectedDispute.status) },
                        ]}
                      >
                        {selectedDispute.status}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.disputeInfoRow}>
                    <Text style={[styles.disputeInfoLabel, { color: colors.secondary }]}>
                      Created:
                    </Text>
                    <Text style={[styles.disputeInfoValue, { color: colors.text }]}>
                      {new Date(selectedDispute.createdAt).toLocaleString()}
                    </Text>
                  </View>

                  <View style={styles.disputeInfoRow}>
                    <Text style={[styles.disputeInfoLabel, { color: colors.secondary }]}>
                      Item:
                    </Text>
                    <Text style={[styles.disputeInfoValue, { color: colors.text }]}>
                      {selectedDispute.itemTitle}
                    </Text>
                  </View>

                  <View style={styles.disputeInfoRow}>
                    <Text style={[styles.disputeInfoLabel, { color: colors.secondary }]}>
                      Parties:
                    </Text>
                    <Text style={[styles.disputeInfoValue, { color: colors.text }]}>
                      {selectedDispute.requesterName} vs {selectedDispute.finderName}
                    </Text>
                  </View>
                </View>
              </View>

              <View style={[styles.disputeSection, { borderBottomColor: colors.border }]}>
                <Text style={[styles.disputeSectionTitle, { color: colors.text }]}>Timeline</Text>
                <DisputeTimeline events={transformTimelineEvents(selectedDispute.timeline)} />
              </View>

              <View style={styles.disputeSection}>
                <Text style={[styles.disputeSectionTitle, { color: colors.text }]}>
                  AI Recommendation
                </Text>
                {loadingRecommendation ? (
                  <View style={styles.loadingRecommendation}>
                    <ActivityIndicator size="small" color={colors.primary} />
                    <Text style={[styles.loadingText, { color: colors.secondary }]}>
                      Analyzing dispute data...
                    </Text>
                  </View>
                ) : aiRecommendation ? (
                  <AIRecommendation
                    recommendation={aiRecommendation}
                    onAccept={() => {
                      setShowDisputeModal(false);
                    }}
                    onReject={() => {
                      setShowDisputeModal(false);
                    }}
                  />
                ) : (
                  <Text style={[styles.noRecommendation, { color: colors.secondary }]}>
                    No AI recommendation available.
                  </Text>
                )}
              </View>
            </View>

            <View style={styles.disputeModalActions}>
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: colors.primary + '20' }]}
                onPress={() => initiateCall(selectedDispute)}
              >
                <Ionicons name="call" size={20} color={colors.primary} />
                <Text style={[styles.actionButtonText, { color: colors.primary }]}>
                  Call Parties
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: colors.warning + '20' }]}
              >
                <Ionicons name="chatbubbles" size={20} color={colors.warning} />
                <Text style={[styles.actionButtonText, { color: colors.warning }]}>Group Chat</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: colors.primary + '20' }]}
              >
                <Ionicons name="checkmark-circle" size={20} color={colors.primary} />
                <Text style={[styles.actionButtonText, { color: colors.primary }]}>Resolve</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'open':
        return colors.warning;
      case 'in_progress':
        return colors.primary;
      case 'escalated':
        return colors.error;
      case 'resolved':
        return colors.primary;
      default:
        return colors.secondary;
    }
  };

  const transformTimelineEvents = (events: Dispute['timeline']) => {
    return events.map(event => ({
      id: event.id,
      title: event.action,
      description: event.details,
      date: event.timestamp,
      type: event.type as 'message' | 'status_change' | 'action' | 'resolution',
      actor: event.actor
    }));
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
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
              <TouchableOpacity onPress={() => setSearchQuery('')}>
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
            <FilterChip
              label="All"
              isSelected={filterStatus === 'all'}
              onPress={() => setFilterStatus('all')}
              count={0}
            />
            <FilterChip
              label="Open"
              isSelected={filterStatus === 'open'}
              onPress={() => setFilterStatus('open')}
              count={disputes.filter(d => d.status.toLowerCase() === 'open').length}
            />
            <FilterChip
              label="In Progress"
              isSelected={filterStatus === 'in_progress'}
              onPress={() => setFilterStatus('in_progress')}
              count={disputes.filter(d => d.status.toLowerCase() === 'in_progress').length}
            />
            <FilterChip
              label="Escalated"
              isSelected={filterStatus === 'escalated'}
              onPress={() => setFilterStatus('escalated')}
              count={disputes.filter(d => d.status.toLowerCase() === 'escalated').length}
            />
            <FilterChip
              label="Resolved"
              isSelected={filterStatus === 'resolved'}
              onPress={() => setFilterStatus('resolved')}
              count={disputes.filter(d => d.status.toLowerCase() === 'resolved').length}
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
            keyExtractor={item => item.id.toString()}
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
    </View>
  );
};

const styles = StyleSheet.create({
  actionBar: {
    alignItems: 'center',
    flexDirection: 'row',
    padding: 16,
  },
  actionButton: {
    alignItems: 'center',
    borderRadius: 8,
    flexDirection: 'row',
    flex: 1,
    justifyContent: 'center',
    marginHorizontal: 4,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 6,
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
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  disputeInfo: {
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderRadius: 8,
    padding: 12,
  },
  disputeInfoLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  disputeInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  disputeInfoValue: {
    fontSize: 14,
    maxWidth: '60%',
    textAlign: 'right',
  },
  disputeModalActions: {
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
    borderTopWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
  },
  disputeModalBody: {
    maxHeight: '70%',
    padding: 16,
  },
  disputeModalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
  },
  disputeModalHeader: {
    alignItems: 'center',
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
  },
  disputeModalOverlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    flex: 1,
    justifyContent: 'flex-end',
  },
  disputeModalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  disputeSection: {
    borderBottomWidth: 1,
    marginBottom: 20,
    paddingBottom: 16,
  },
  disputeSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  emptyContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    padding: 32,
  },
  emptySubtext: {
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
  },
  filterButton: {
    alignItems: 'center',
    borderRadius: 8,
    height: 44,
    justifyContent: 'center',
    marginLeft: 8,
    width: 44,
  },
  filterChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  filterSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    marginTop: 8,
  },
  listContent: {
    padding: 16,
  },
  loadingContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  loadingRecommendation: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    padding: 16,
  },
  loadingText: {
    fontSize: 16,
    marginTop: 12,
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
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
    fontSize: 20,
    fontWeight: 'bold',
  },
  noRecommendation: {
    fontSize: 14,
    padding: 16,
    textAlign: 'center',
  },
  searchContainer: {
    alignItems: 'center',
    borderRadius: 8,
    flex: 1,
    flexDirection: 'row',
    height: 44,
    paddingHorizontal: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    marginLeft: 8,
  },
  statusBadge: {
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  statusFilters: {
    marginBottom: 8,
    paddingHorizontal: 16,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  viewFullButton: {
    fontSize: 14,
    fontWeight: '500',
  },
});

export default DisputeResolutionScreen;
