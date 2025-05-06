import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';

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

const mockDisputeData: DisputeDetails = {
  id: "DSP-2024-001",
  title: "Item Condition Misrepresentation",
  status: "in_progress",
  priority: "high",
  description: "Buyer claims the item received was not in the condition described in the listing. Significant scratches and wear not shown in original photos.",
  createdAt: "2024-03-15T10:30:00Z",
  updatedAt: "2024-03-16T14:20:00Z",
  reporter: {
    id: "USR001",
    name: "John Smith",
    email: "john.smith@example.com",
    avatar: "https://ui-avatars.com/api/?name=John+Smith"
  },
  defendant: {
    id: "USR002",
    name: "Sarah Johnson",
    email: "sarah.j@example.com",
    avatar: "https://ui-avatars.com/api/?name=Sarah+Johnson"
  },
  category: "Product Condition",
  evidence: [
    {
      id: "EV001",
      type: "image",
      url: "https://picsum.photos/400/300",
      description: "Product received showing scratches"
    },
    {
      id: "EV002",
      type: "image",
      url: "https://picsum.photos/400/300",
      description: "Original listing photos"
    }
  ],
  timeline: [
    {
      id: "TL001",
      action: "Dispute Created",
      timestamp: "2024-03-15T10:30:00Z",
      actor: "John Smith",
      details: "Initial dispute filed"
    },
    {
      id: "TL002",
      action: "Evidence Submitted",
      timestamp: "2024-03-15T11:45:00Z",
      actor: "John Smith",
      details: "Photos of received item uploaded"
    },
    {
      id: "TL003",
      action: "Seller Response",
      timestamp: "2024-03-16T09:15:00Z",
      actor: "Sarah Johnson",
      details: "Seller provided explanation and original photos"
    }
  ]
};

const DisputeDetailsScreen = () => {
  const { colors } = useTheme();
  const [dispute] = useState<DisputeDetails>(mockDisputeData);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return colors.warning;
      case 'in_progress':
        return colors.primary;
      case 'resolved':
        return colors.success;
      case 'closed':
        return colors.error;
      default:
        return colors.secondary;
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'alert-circle';
      case 'medium':
        return 'warning';
      case 'low':
        return 'information-circle';
      default:
        return 'help-circle';
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header Section */}
      <View style={[styles.header, { backgroundColor: colors.card }]}>
        <Text style={[styles.disputeId, { color: colors.secondary }]}>{dispute.id}</Text>
        <Text style={[styles.title, { color: colors.text }]}>{dispute.title}</Text>
        <View style={styles.statusContainer}>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(dispute.status) + '20' }]}>
            <Text style={[styles.statusText, { color: getStatusColor(dispute.status) }]}>
              {dispute.status.toUpperCase()}
            </Text>
          </View>
          <View style={[styles.priorityBadge, { backgroundColor: colors.error + '20' }]}>
            <Ionicons name={getPriorityIcon(dispute.priority)} size={16} color={colors.error} />
            <Text style={[styles.priorityText, { color: colors.error }]}>
              {dispute.priority.toUpperCase()} PRIORITY
            </Text>
          </View>
        </View>
      </View>

      {/* Description Section */}
      <View style={[styles.section, { backgroundColor: colors.card }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Description</Text>
        <Text style={[styles.description, { color: colors.secondary }]}>{dispute.description}</Text>
      </View>

      {/* Parties Section */}
      <View style={[styles.section, { backgroundColor: colors.card }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Involved Parties</Text>
        <View style={styles.partiesContainer}>
          <View style={styles.partyInfo}>
            <Image source={{ uri: dispute.reporter.avatar }} style={styles.avatar} />
            <View>
              <Text style={[styles.partyName, { color: colors.text }]}>{dispute.reporter.name}</Text>
              <Text style={[styles.partyRole, { color: colors.primary }]}>Reporter</Text>
              <Text style={[styles.partyEmail, { color: colors.secondary }]}>{dispute.reporter.email}</Text>
            </View>
          </View>
          <View style={styles.partyInfo}>
            <Image source={{ uri: dispute.defendant.avatar }} style={styles.avatar} />
            <View>
              <Text style={[styles.partyName, { color: colors.text }]}>{dispute.defendant.name}</Text>
              <Text style={[styles.partyRole, { color: colors.error }]}>Defendant</Text>
              <Text style={[styles.partyEmail, { color: colors.secondary }]}>{dispute.defendant.email}</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Evidence Section */}
      <View style={[styles.section, { backgroundColor: colors.card }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Evidence</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.evidenceList}>
          {dispute.evidence.map((item) => (
            <View key={item.id} style={styles.evidenceItem}>
              <Image source={{ uri: item.url }} style={styles.evidenceImage} />
              <Text style={[styles.evidenceDescription, { color: colors.secondary }]}>
                {item.description}
              </Text>
            </View>
          ))}
        </ScrollView>
      </View>

      {/* Timeline Section */}
      <View style={[styles.section, { backgroundColor: colors.card }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Timeline</Text>
        {dispute.timeline.map((event, index) => (
          <View key={event.id} style={styles.timelineItem}>
            <View style={[styles.timelineLine, { backgroundColor: colors.border }]} />
            <View style={styles.timelineContent}>
              <Text style={[styles.timelineAction, { color: colors.text }]}>{event.action}</Text>
              <Text style={[styles.timelineActor, { color: colors.primary }]}>{event.actor}</Text>
              <Text style={[styles.timelineDetails, { color: colors.secondary }]}>{event.details}</Text>
              <Text style={[styles.timelineTimestamp, { color: colors.secondary }]}>
                {new Date(event.timestamp).toLocaleString()}
              </Text>
            </View>
          </View>
        ))}
      </View>

      {/* Action Buttons */}
      <View style={[styles.actionButtons, { backgroundColor: colors.card }]}>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: colors.primary }]}
          onPress={() => console.log('Resolve pressed')}
        >
          <Text style={styles.actionButtonText}>Resolve Dispute</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: colors.error }]}
          onPress={() => console.log('Escalate pressed')}
        >
          <Text style={styles.actionButtonText}>Escalate</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
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
});

export default DisputeDetailsScreen;
