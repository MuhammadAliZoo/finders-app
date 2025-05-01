import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';

type TimelineEvent = {
  id: string;
  title: string;
  description: string;
  date: string;
  type: 'message' | 'status_change' | 'action' | 'resolution';
  actor: string;
};

type DisputeTimelineProps = {
  events: TimelineEvent[];
};

const DisputeTimeline: React.FC<DisputeTimelineProps> = ({ events }) => {
  const { colors } = useTheme();

  const getEventIcon = (type: TimelineEvent['type']) => {
    switch (type) {
      case 'message':
        return 'chatbubble-outline';
      case 'status_change':
        return 'refresh-outline';
      case 'action':
        return 'hammer-outline';
      case 'resolution':
        return 'checkmark-circle-outline';
      default:
        return 'ellipse-outline';
    }
  };

  const getEventColor = (type: TimelineEvent['type']) => {
    switch (type) {
      case 'message':
        return '#29B6F6';
      case 'status_change':
        return '#FFA726';
      case 'action':
        return '#AB47BC';
      case 'resolution':
        return '#66BB6A';
      default:
        return colors.secondary;
    }
  };

  return (
    <View style={styles.container}>
      {events.map((event, index) => (
        <View key={event.id} style={styles.eventContainer}>
          <View style={styles.timelineLeft}>
            <View
              style={[styles.iconContainer, { backgroundColor: getEventColor(event.type) + '20' }]}
            >
              <Ionicons
                name={getEventIcon(event.type)}
                size={16}
                color={getEventColor(event.type)}
              />
            </View>
            {index < events.length - 1 && (
              <View style={[styles.timelineLine, { backgroundColor: colors.border }]} />
            )}
          </View>

          <View style={styles.eventContent}>
            <View style={styles.eventHeader}>
              <Text style={[styles.eventTitle, { color: colors.text }]}>{event.title}</Text>
              <Text style={[styles.eventDate, { color: colors.secondary }]}>{event.date}</Text>
            </View>
            <Text style={[styles.eventActor, { color: colors.primary }]}>{event.actor}</Text>
            <Text style={[styles.eventDescription, { color: colors.secondary }]} numberOfLines={2}>
              {event.description}
            </Text>
          </View>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  eventActor: {
    fontSize: 14,
    marginBottom: 4,
  },
  eventContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  eventContent: {
    flex: 1,
    marginLeft: 12,
  },
  eventDate: {
    fontSize: 12,
  },
  eventDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  eventHeader: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  eventTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
  iconContainer: {
    alignItems: 'center',
    borderRadius: 16,
    height: 32,
    justifyContent: 'center',
    width: 32,
  },
  timelineLeft: {
    alignItems: 'center',
    width: 40,
  },
  timelineLine: {
    flex: 1,
    marginTop: 8,
    width: 2,
  },
});

export default DisputeTimeline;
