import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { Dispute } from '../../screens/admin/DisputeResolutionScreen';

type DisputeCardProps = {
  dispute: Dispute;
  onPress: () => void;
  onQuickView: () => void;
  onCall: () => void;
};

const DisputeCard: React.FC<DisputeCardProps> = ({
  dispute,
  onPress,
  onQuickView,
  onCall,
}) => {
  const { colors } = useTheme();

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'open':
        return '#FFA726';
      case 'in_progress':
        return '#29B6F6';
      case 'resolved':
        return '#66BB6A';
      case 'escalated':
        return '#EF5350';
      default:
        return colors.secondary;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status.toLowerCase()) {
      case 'open':
        return 'Open';
      case 'in_progress':
        return 'In Progress';
      case 'resolved':
        return 'Resolved';
      case 'escalated':
        return 'Escalated';
      default:
        return status;
    }
  };

  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor: colors.card }]}
      onPress={onPress}
    >
      <View style={styles.header}>
        <View style={styles.idContainer}>
          <Text style={[styles.id, { color: colors.secondary }]}>#{dispute.id}</Text>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: getStatusColor(dispute.status) + '20' },
            ]}
          >
            <Text style={[styles.statusText, { color: getStatusColor(dispute.status) }]}>
              {getStatusLabel(dispute.status)}
            </Text>
          </View>
        </View>
        <Text style={[styles.date, { color: colors.secondary }]}>{new Date(dispute.createdAt).toLocaleDateString()}</Text>
      </View>

      <Text style={[styles.title, { color: colors.text }]}>{dispute.itemTitle}</Text>
      <Text
        style={[styles.description, { color: colors.secondary }]}
        numberOfLines={2}
      >
        {`${dispute.requesterName} vs ${dispute.finderName}`}
      </Text>

      <View style={styles.footer}>
        <View style={styles.actions}>
          <TouchableOpacity style={styles.actionButton} onPress={onQuickView}>
            <Ionicons name="eye-outline" size={16} color={colors.primary} />
            <Text style={[styles.actionText, { color: colors.primary }]}>Quick View</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={onCall}>
            <Ionicons name="call-outline" size={16} color={colors.primary} />
            <Text style={[styles.actionText, { color: colors.primary }]}>Call</Text>
          </TouchableOpacity>
        </View>
        <Ionicons name="chevron-forward" size={20} color={colors.secondary} />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  idContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  id: {
    fontSize: 14,
    marginRight: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  date: {
    fontSize: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actionText: {
    fontSize: 12,
    fontWeight: '500',
  },
});

export default DisputeCard; 