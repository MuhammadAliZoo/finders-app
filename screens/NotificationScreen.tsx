'use client';
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MainStackParamList } from '../navigation/types';
import { useCallback } from 'react';
import { supabase } from '../config/supabase';

type NotificationType = 'match' | 'message' | 'status' | 'reminder';

type Notification = {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  time: string;
  read: boolean;
  itemId: string | null;
  image: string | null;
};

// Mock data
const notifications: Notification[] = [
  {
    id: '1',
    type: 'match',
    title: 'Potential Match Found',
    message: 'We found a potential match for your lost Gold Watch',
    time: '2 hours ago',
    read: false,
    itemId: '1',
    image: 'https://via.placeholder.com/100',
  },
  {
    id: '2',
    type: 'message',
    title: 'New Message',
    message: 'Michael Rodriguez: Is the watch still available?',
    time: '5 hours ago',
    read: true,
    itemId: '2',
    image: 'https://via.placeholder.com/100',
  },
  {
    id: '3',
    type: 'status',
    title: 'Status Update',
    message: 'Your claim for Black Wallet has been approved',
    time: '1 day ago',
    read: true,
    itemId: '3',
    image: 'https://via.placeholder.com/100',
  },
  {
    id: '4',
    type: 'reminder',
    title: 'Reminder',
    message: "Don't forget to update your lost item description",
    time: '2 days ago',
    read: true,
    itemId: null,
    image: null,
  },
];

const NotificationScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<MainStackParamList>>();
  const { colors } = useTheme();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNotifications = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data, error } = await supabase
          .from('notifications')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        setNotifications(data || []);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch notifications');
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  const handleNavigateToSearchResults = useCallback(
    (itemId: string) => {
      if (!itemId) {
        console.warn('Invalid itemId for SearchResults navigation');
        return;
      }
      navigation.navigate('SearchResults', { searchQuery: itemId });
    },
    [navigation],
  );

  const handleNavigateToItemDetails = useCallback(
    (itemId: string) => {
      if (!itemId) {
        console.warn('Invalid itemId for ItemDetails navigation');
        return;
      }
      navigation.navigate('ItemDetails', { id: itemId });
    },
    [navigation],
  );

  const handleNotificationPress = useCallback(
    (notification: Notification) => {
      if (!notification.itemId) {
        console.warn('No itemId associated with this notification');
        return;
      }

      switch (notification.type) {
        case 'match':
          handleNavigateToSearchResults(notification.itemId as string);
          break;
        case 'message':
        case 'status':
          handleNavigateToItemDetails(notification.itemId as string);
          break;
        default:
          console.warn('No navigation action for this notification type');
      }
    },
    [handleNavigateToSearchResults, handleNavigateToItemDetails],
  );

  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case 'match':
        return <Ionicons name="search" size={24} color={colors.primary} />;
      case 'message':
        return <Ionicons name="chatbubble" size={24} color={colors.primary} />;
      case 'status':
        return <Ionicons name="checkmark-circle" size={24} color={colors.warning} />;
      case 'reminder':
        return <Ionicons name="alarm" size={24} color={colors.error} />;
      default:
        return <Ionicons name="notifications" size={24} color={colors.primary} />;
    }
  };

  const renderNotificationItem = ({ item }: { item: Notification }) => (
    <TouchableOpacity
      style={[
        styles.notificationItem,
        { backgroundColor: item.read ? colors.background : colors.card },
      ]}
      onPress={() => handleNotificationPress(item)}
      testID={`notification-${item.id}`}
    >
      <View style={styles.notificationIcon}>{getNotificationIcon(item.type)}</View>
      <View style={styles.notificationContent}>
        <View style={styles.notificationHeader}>
          <Text style={[styles.notificationTitle, { color: colors.text }]}>{item.title}</Text>
          <Text style={[styles.notificationTime, { color: colors.secondary }]}>{item.time}</Text>
        </View>
        <Text style={[styles.notificationMessage, { color: colors.text }]}>{item.message}</Text>
        {item.image && <Image source={{ uri: item.image }} style={styles.notificationImage} />}
        {item.type === 'match' && item.itemId && (
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: colors.primary }]}
              onPress={() => handleNavigateToSearchResults(item.itemId as string)}
              testID={`view-matches-${item.id}`}
            >
              <Text style={styles.actionButtonText}>View Matches</Text>
            </TouchableOpacity>
          </View>
        )}
        {item.type === 'message' && item.itemId && (
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: colors.primary }]}
              onPress={() => handleNavigateToItemDetails(item.itemId as string)}
              testID={`reply-${item.id}`}
            >
              <Text style={styles.actionButtonText}>Reply</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
      {!item.read && <View style={[styles.unreadIndicator, { backgroundColor: colors.primary }]} />}
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.background }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]} numberOfLines={1}>
          Notifications
        </Text>
        <TouchableOpacity style={styles.markAllReadButton}>
          <Text style={[styles.markAllRead, { color: colors.primary }]}>Mark all read</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={notifications}
        renderItem={renderNotificationItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.notificationsList}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="notifications-off-outline" size={48} color={colors.secondary} />
            <Text style={[styles.emptyStateText, { color: colors.text }]}>
              No notifications yet
            </Text>
            <Text style={[styles.emptyStateSubtext, { color: colors.secondary }]}>
              We'll notify you when something important happens
            </Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  actionButton: {
    alignItems: 'center',
    borderRadius: 24,
    justifyContent: 'center',
    marginRight: 12,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: -0.2,
  },
  actionButtons: {
    flexDirection: 'row',
    marginTop: 4,
  },
  container: {
    flex: 1,
  },
  emptyState: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  emptyStateSubtext: {
    fontSize: 14,
    marginTop: 8,
    opacity: 0.8,
    textAlign: 'center',
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 16,
    margin: 20,
    textAlign: 'center',
  },
  header: {
    alignItems: 'center',
    borderBottomColor: 'rgba(0,0,0,0.05)',
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 20,
    paddingHorizontal: 20,
    paddingTop: 60,
  },
  headerTitle: {
    flex: 1,
    fontSize: 34,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  markAllRead: {
    fontSize: 14,
    fontWeight: '600',
  },
  markAllReadButton: {
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  notificationContent: {
    flex: 1,
  },
  notificationHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  notificationIcon: {
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 22,
    height: 44,
    justifyContent: 'center',
    marginRight: 16,
    width: 44,
  },
  notificationImage: {
    borderRadius: 12,
    height: 180,
    marginBottom: 12,
    width: '100%',
  },
  notificationItem: {
    borderRadius: 16,
    elevation: 3,
    flexDirection: 'row',
    marginBottom: 12,
    padding: 16,
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  notificationMessage: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
    opacity: 0.8,
  },
  notificationTime: {
    fontSize: 12,
    fontWeight: '500',
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  notificationsList: {
    padding: 16,
  },
  unreadIndicator: {
    borderRadius: 5,
    height: 10,
    position: 'absolute',
    right: 18,
    top: 18,
    width: 10,
  },
});

export default NotificationScreen;
