import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';

type AIRecommendationProps = {
  recommendation: {
    title: string;
    description: string;
    confidence: number;
    action: string;
  };
  onAccept: () => void;
  onReject: () => void;
};

const AIRecommendation: React.FC<AIRecommendationProps> = ({
  recommendation,
  onAccept,
  onReject,
}) => {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.card }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>{recommendation.title}</Text>
        <View style={[styles.confidenceBadge, { backgroundColor: colors.primary + '20' }]}>
          <Text style={[styles.confidenceText, { color: colors.primary }]}>
            {Math.round(recommendation.confidence * 100)}% Confidence
          </Text>
        </View>
      </View>

      <Text style={[styles.description, { color: colors.secondary }]}>
        {recommendation.description}
      </Text>

      <Text style={[styles.action, { color: colors.text }]}>
        <Text style={{ fontWeight: '600' }}>Recommended Action: </Text>
        {recommendation.action}
      </Text>

      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: colors.primary }]}
          onPress={onAccept}
        >
          <Ionicons name="checkmark" size={20} color="#fff" />
          <Text style={styles.buttonText}>Accept</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: colors.error }]}
          onPress={onReject}
        >
          <Ionicons name="close" size={20} color="#fff" />
          <Text style={styles.buttonText}>Reject</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  action: {
    fontSize: 14,
    marginBottom: 16,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    alignItems: 'center',
    borderRadius: 8,
    flex: 1,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    padding: 12,
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  confidenceBadge: {
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  confidenceText: {
    fontSize: 12,
    fontWeight: '600',
  },
  container: {
    borderRadius: 12,
    marginBottom: 12,
    padding: 16,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default AIRecommendation;
