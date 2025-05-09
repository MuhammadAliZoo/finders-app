import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../navigation/types';
import { adminApi } from '../../api/admin';

interface DisputeDetails {
  id: string;
  title: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high';
  description: string;
  createdAt: string;
  updatedAt: string;
  reporter: {
    id: string;
    name: string;
    email: string;
    avatar: string;
  };
  defendant: {
    id: string;
    name: string;
    email: string;
    avatar: string;
  };
  category: string;
  evidence: Array<{
    id: string;
    type: 'image' | 'text' | 'document';
    url: string;
    description: string;
  }>;
  timeline: Array<{
    id: string;
    action: string;
    timestamp: string;
    actor: string;
    details: string;
  }>;
}

type DisputeDetailsScreenProps = {
  route: RouteProp<RootStackParamList, 'DisputeDetails'>;
};

const DisputeDetailsScreen = ({ route }: DisputeDetailsScreenProps) => {
  const { colors } = useTheme();
  const [dispute, setDispute] = useState<DisputeDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDisputeDetails = async () => {
    try {
      setError(null);
      setLoading(true);
      const response = await adminApi.getDisputeById(route.params.dispute.id);
      
      // Transform the response data to match our DisputeDetails interface
      const transformedDispute: DisputeDetails = {
        id: response._id,
        title: response.item?.title || 'Unknown Item',
        status: response.status,
        priority: response.priority,
        description: response.reason,
        createdAt: response.createdAt,
        updatedAt: response.updatedAt,
        reporter: {
          id: response.requester?._id || '',
          name: response.requester?.name || 'Unknown User',
          email: response.requester?.email || '',
          avatar: response.requester?.profileImage || `https://ui-avatars.com/api/?name=${response.requester?.name || 'Unknown'}`
        },
        defendant: {
          id: response.finder?._id || '',
          name: response.finder?.name || 'Unknown User',
          email: response.finder?.email || '',
          avatar: response.finder?.profileImage || `https://ui-avatars.com/api/?name=${response.finder?.name || 'Unknown'}`
        },
        category: response.item?.category || 'Uncategorized',
        evidence: response.documents?.map((doc: any) => ({
          id: doc._id,
          type: doc.url.match(/\.(jpg|jpeg|png|gif)$/i) ? 'image' : 'document',
          url: doc.url,
          description: doc.title
        })) || [],
        timeline: response.timeline?.map((event: any) => ({
          id: event._id,
          action: event.action,
          timestamp: event.timestamp,
          actor: event.performedBy?.name || 'System',
          details: event.notes || ''
        })) || []
      };

      setDispute(transformedDispute);
    } catch (err) {
      console.error('Error fetching dispute details:', err);
      setError('Failed to fetch dispute details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDisputeDetails();
  }, [route.params.dispute.id]);

  if (loading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.secondary }]}>
          Loading dispute details...
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.errorContainer]}>
        <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
        <TouchableOpacity
          style={[styles.retryButton, { backgroundColor: colors.primary }]}
          onPress={fetchDisputeDetails}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!dispute) {
    return (
      <View style={[styles.container, styles.errorContainer]}>
        <Text style={[styles.errorText, { color: colors.error }]}>
          Dispute not found
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header Section */}
      <View style={[styles.header, { backgroundColor: colors.card }]}>
        <Text style={[styles.disputeId, { color: colors.secondary }]}>#{dispute.id}</Text>
        <Text style={[styles.title, { color: colors.text }]}>{dispute.title}</Text>
        <View style={styles.statusContainer}>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: getStatusColor(dispute.status, colors) + '20' },
            ]}
          >
            <Text
              style={[styles.statusText, { color: getStatusColor(dispute.status, colors) }]}
            >
              {dispute.status.replace('_', ' ').toUpperCase()}
            </Text>
          </View>
          <View
            style={[
              styles.priorityBadge,
              { backgroundColor: getPriorityColor(dispute.priority, colors) + '20' },
            ]}
          >
            <Ionicons
              name="flag"
              size={12}
              color={getPriorityColor(dispute.priority, colors)}
            />
            <Text
              style={[
                styles.priorityText,
                { color: getPriorityColor(dispute.priority, colors) },
              ]}
            >
              {dispute.priority.toUpperCase()}
            </Text>
          </View>
        </View>
      </View>

      {/* Description Section */}
      <View style={[styles.section, { backgroundColor: colors.card }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Description</Text>
        <Text style={[styles.description, { color: colors.secondary }]}>
          {dispute.description}
        </Text>
      </View>

      {/* Parties Section */}
      <View style={[styles.section, { backgroundColor: colors.card }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Involved Parties</Text>
        <View style={styles.partiesContainer}>
          <View style={styles.partyInfo}>
            <Image source={{ uri: dispute.reporter.avatar }} style={styles.avatar} />
            <View>
              <Text style={[styles.partyName, { color: colors.text }]}>
                {dispute.reporter.name}
              </Text>
              <Text style={[styles.partyRole, { color: colors.primary }]}>Reporter</Text>
              <Text style={[styles.partyEmail, { color: colors.secondary }]}>
                {dispute.reporter.email}
              </Text>
            </View>
          </View>
          <View style={styles.partyInfo}>
            <Image source={{ uri: dispute.defendant.avatar }} style={styles.avatar} />
            <View>
              <Text style={[styles.partyName, { color: colors.text }]}>
                {dispute.defendant.name}
              </Text>
              <Text style={[styles.partyRole, { color: colors.error }]}>Defendant</Text>
              <Text style={[styles.partyEmail, { color: colors.secondary }]}>
                {dispute.defendant.email}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Evidence Section */}
      {dispute.evidence.length > 0 && (
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Evidence</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.evidenceList}>
            {dispute.evidence.map((item) => (
              <View key={item.id} style={styles.evidenceItem}>
                {item.type === 'image' ? (
                  <Image source={{ uri: item.url }} style={styles.evidenceImage} />
                ) : (
                  <View style={[styles.documentPreview, { backgroundColor: colors.border }]}>
                    <Ionicons name="document-outline" size={32} color={colors.secondary} />
                  </View>
                )}
                <Text style={[styles.evidenceDescription, { color: colors.secondary }]}>
                  {item.description}
                </Text>
              </View>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Timeline Section */}
      <View style={[styles.section, { backgroundColor: colors.card }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Timeline</Text>
        {dispute.timeline.map((event, index) => (
          <View key={event.id} style={styles.timelineItem}>
            <View style={[styles.timelineLine, { backgroundColor: colors.border }]} />
            <View style={styles.timelineContent}>
              <Text style={[styles.timelineAction, { color: colors.text }]}>
                {event.action}
              </Text>
              <Text style={[styles.timelineActor, { color: colors.primary }]}>
                {event.actor}
              </Text>
              <Text style={[styles.timelineDetails, { color: colors.secondary }]}>
                {event.details}
              </Text>
              <Text style={[styles.timelineTimestamp, { color: colors.secondary }]}>
                {new Date(event.timestamp).toLocaleString()}
              </Text>
            </View>
          </View>
        ))}
      </View>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: colors.primary }]}
          onPress={() => {/* Implement resolve action */}}
        >
          <Text style={styles.actionButtonText}>Resolve Dispute</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: colors.error }]}
          onPress={() => {/* Implement escalate action */}}
        >
          <Text style={styles.actionButtonText}>Escalate</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const getStatusColor = (status: string, colors: any) => {
  switch (status) {
    case 'open':
      return colors.warning;
    case 'in_progress':
      return colors.primary;
    case 'resolved':
      return colors.success;
    case 'closed':
      return colors.secondary;
    default:
      return colors.secondary;
  }
};

const getPriorityColor = (priority: string, colors: any) => {
  switch (priority) {
    case 'high':
      return colors.error;
    case 'medium':
      return colors.warning;
    case 'low':
      return colors.success;
    default:
      return colors.secondary;
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
    marginBottom: 8,
  },
  disputeId: {
    fontSize: 14,
    marginBottom: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  priorityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    gap: 4,
  },
  priorityText: {
    fontSize: 12,
    fontWeight: '600',
  },
  section: {
    padding: 16,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
  },
  partiesContainer: {
    gap: 16,
  },
  partyInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  partyName: {
    fontSize: 16,
    fontWeight: '500',
  },
  partyRole: {
    fontSize: 12,
    fontWeight: '600',
  },
  partyEmail: {
    fontSize: 12,
  },
  evidenceList: {
    flexDirection: 'row',
  },
  evidenceItem: {
    marginRight: 12,
    width: 200,
  },
  evidenceImage: {
    width: 200,
    height: 150,
    borderRadius: 8,
    marginBottom: 8,
  },
  evidenceDescription: {
    fontSize: 12,
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 16,
    position: 'relative',
  },
  timelineLine: {
    width: 2,
    height: '100%',
    position: 'absolute',
    left: 4,
  },
  timelineContent: {
    marginLeft: 20,
  },
  timelineAction: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  timelineActor: {
    fontSize: 12,
    marginBottom: 2,
  },
  timelineDetails: {
    fontSize: 12,
    marginBottom: 2,
  },
  timelineTimestamp: {
    fontSize: 10,
  },
  actionButtons: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  loadingContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 16,
    marginTop: 16,
  },
  errorContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    marginBottom: 16,
    textAlign: 'center',
  },
  retryButton: {
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  documentPreview: {
    alignItems: 'center',
    borderRadius: 8,
    height: 150,
    justifyContent: 'center',
    width: 200,
  },
});

export default DisputeDetailsScreen;
