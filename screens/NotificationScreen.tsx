'use client';
import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  RefreshControl,
  SectionList,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MainStackParamList } from '../navigation/types';
import { supabase } from '../config/supabase';
import { useUser } from '@supabase/auth-helpers-react';
import { formatDistanceToNow, isAfter, differenceInHours } from 'date-fns';
import { User } from '@supabase/supabase-js';

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
  data: any;
  related_item_id: string | null;
  related_user_id: string | null;
  created_at: string;
  expire_at: string | null;
  isExpired?: boolean;
  expiresIn?: string;
};

type NotificationSection = {
  title: string;
  data: Notification[];
  type: NotificationType;
};

const NotificationScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<MainStackParamList>>();
  const { colors } = useTheme();
  const user = useUser();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const formatNotification = (notification: any): Notification => {
    const now = new Date();
    const expireDate = notification.expire_at ? new Date(notification.expire_at) : null;
    const isExpired = expireDate ? isAfter(now, expireDate) : false;
    const expiresIn = expireDate && !isExpired
      ? formatDistanceToNow(expireDate, { addSuffix: true })
      : undefined;

    return {
      ...notification,
      read: notification.is_read,
      time: formatDistanceToNow(new Date(notification.created_at), { addSuffix: true }),
      itemId: notification.related_item_id,
      image: notification.data?.image || null,
      isExpired,
      expiresIn,
    };
  };

  const groupedNotifications = useMemo(() => {
    const groups: { [key in NotificationType]: Notification[] } = {
      match: [],
      message: [],
      status: [],
      reminder: [],
    };

    notifications.forEach(notification => {
      groups[notification.type].push(notification);
    });

    const sections: NotificationSection[] = [
      {
        title: 'Matches',
        data: groups.match,
        type: 'match',
      },
      {
        title: 'Messages',
        data: groups.message,
        type: 'message',
      },
      {
        title: 'Status Updates',
        data: groups.status,
        type: 'status',
      },
      {
        title: 'Reminders',
        data: groups.reminder,
        type: 'reminder',
      },
    ];

    return sections.filter(section => section.data.length > 0);
  }, [notifications]);

  const fetchNotifications = useCallback(async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      const now = new Date().toISOString();
      const { data, error: fetchError } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .or(`expire_at.gt.${now},expire_at.is.null`)
        .order('created_at', { ascending: false })
        .limit(50);

      if (fetchError) throw fetchError;

      const formattedNotifications = data.map(formatNotification);
      setNotifications(formattedNotifications);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch notifications');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user?.id]);

  // Set up real-time subscription
  useEffect(() => {
    if (!user?.id) return;

    // Initial fetch
    fetchNotifications();

    // Subscribe to new notifications
    const subscription = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        },
        async (payload) => {
          console.log('Real-time notification update:', payload);

          if (payload.eventType === 'INSERT') {
            const newNotification = formatNotification(payload.new);
            if (!newNotification.isExpired) {
              setNotifications(prev => [newNotification, ...prev]);
            }
          } else if (payload.eventType === 'UPDATE') {
            const updatedNotification = formatNotification(payload.new);
            setNotifications(prev => {
              if (updatedNotification.isExpired) {
                return prev.filter(n => n.id !== updatedNotification.id);
              }
              return prev.map(notification =>
                notification.id === updatedNotification.id
                  ? updatedNotification
                  : notification
              );
            });
          } else if (payload.eventType === 'DELETE') {
            setNotifications(prev =>
              prev.filter(notification => notification.id !== payload.old.id)
            );
          }
        }
      )
      .subscribe();

    // Cleanup subscription
    return () => {
      subscription.unsubscribe();
    };
  }, [user?.id, fetchNotifications]);

  // Check for expired notifications periodically
  useEffect(() => {
    const checkExpiredNotifications = () => {
      setNotifications(prev => {
        const updatedNotifications = prev.map(formatNotification);
        return updatedNotifications.filter(n => !n.isExpired);
      });
    };

    const interval = setInterval(checkExpiredNotifications, 60000); // Check every minute
    return () => clearInterval(interval);
  }, []);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    fetchNotifications();
  }, [fetchNotifications]);

  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      const { error: updateError } = await supabase
        .from('notifications')
        .update({ is_read: true, updated_at: new Date().toISOString() })
        .eq('id', notificationId);

      if (updateError) throw updateError;

      setNotifications(prev =>
        prev.map(notification =>
          notification.id === notificationId
            ? { ...notification, read: true }
            : notification
        )
      );
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    if (!user) return;

    try {
      const { error: updateError } = await supabase
        .from('notifications')
        .update({ is_read: true, updated_at: new Date().toISOString() })
        .eq('user_id', user.id)
        .eq('is_read', false);

      if (updateError) throw updateError;

      setNotifications(prev =>
        prev.map(notification => ({ ...notification, read: true }))
      );
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
    }
  }, [user]);

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

  const handleNavigateToChat = useCallback(
    async (relatedUserId: string) => {
      if (!relatedUserId || !user?.id) {
        console.warn('Invalid relatedUserId or user not logged in');
        return;
      }

      try {
        // Fetch the other user's profile
        const { data: otherUser, error: userError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', relatedUserId)
          .single();

        if (userError) throw userError;

        // Get or create conversation
        const { data: conversation, error: convError } = await supabase
          .from('conversations')
          .select('*')
          .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
          .or(`user1_id.eq.${relatedUserId},user2_id.eq.${relatedUserId}`)
          .single();

        if (convError && convError.code !== 'PGRST116') throw convError;

        let conversationId = conversation?.id;

        // If no conversation exists, create one
        if (!conversationId) {
          const { data: newConversation, error: createError } = await supabase
            .from('conversations')
            .insert([
              {
                user1_id: user.id,
                user2_id: relatedUserId,
                created_at: new Date().toISOString(),
              },
            ])
            .select()
            .single();

          if (createError) throw createError;
          conversationId = newConversation.id;
        }

        navigation.navigate('Chat', {
          conversationId,
          otherUser,
        });
      } catch (err) {
        console.error('Error navigating to chat:', err);
      }
    },
    [navigation, user?.id],
  );

  const handleNotificationPress = useCallback(
    (notification: Notification) => {
      if (!notification.read) {
        markAsRead(notification.id);
      }

      switch (notification.type) {
        case 'match':
          if (notification.itemId) {
            handleNavigateToSearchResults(notification.itemId as string);
          }
          break;
        case 'message':
          if (notification.related_user_id) {
            handleNavigateToChat(notification.related_user_id as string);
          }
          break;
        case 'status':
          if (notification.itemId) {
            handleNavigateToItemDetails(notification.itemId);
          }
          break;
        default:
          console.warn('No navigation action for this notification type');
      }
    },
    [markAsRead, handleNavigateToSearchResults, handleNavigateToItemDetails, handleNavigateToChat],
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

  const renderSectionHeader = ({ section }: { section: NotificationSection }) => (
    <View style={[styles.sectionHeader, { backgroundColor: colors.background }]}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>{section.title}</Text>
      <Text style={[styles.sectionCount, { color: colors.secondary }]}>
        {section.data.length} {section.data.length === 1 ? 'item' : 'items'}
      </Text>
    </View>
  );

  const renderNotificationItem = ({ item }: { item: Notification }) => (
    <TouchableOpacity
      style={[
        styles.notificationItem,
        { backgroundColor: item.read ? colors.background : colors.card },
        item.isExpired && styles.expiredNotification,
      ]}
      onPress={() => handleNotificationPress(item)}
      testID={`notification-${item.id}`}
    >
      <View style={styles.notificationIcon}>{getNotificationIcon(item.type)}</View>
      <View style={styles.notificationContent}>
        <View style={styles.notificationHeader}>
          <Text style={[styles.notificationTitle, { color: colors.text }]}>{item.title}</Text>
          <View style={styles.timeContainer}>
            {item.expiresIn && (
              <Text style={[styles.expiresIn, { color: colors.warning }]}>
                Expires {item.expiresIn}
              </Text>
            )}
            <Text style={[styles.notificationTime, { color: colors.secondary }]}>{item.time}</Text>
          </View>
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
        {item.type === 'message' && item.related_user_id && (
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: colors.primary }]}
              onPress={() => handleNavigateToChat(item.related_user_id as string)}
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
        <TouchableOpacity
          style={[styles.retryButton, { backgroundColor: colors.primary }]}
          onPress={fetchNotifications}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.background }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]} numberOfLines={1}>
          Notifications
        </Text>
        {notifications.some(n => !n.read) && (
          <TouchableOpacity
            style={styles.markAllReadButton}
            onPress={markAllAsRead}
          >
            <Text style={[styles.markAllRead, { color: colors.primary }]}>Mark all read</Text>
          </TouchableOpacity>
        )}
      </View>

      <SectionList
        sections={groupedNotifications}
        renderItem={renderNotificationItem}
        renderSectionHeader={renderSectionHeader}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.notificationsList}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
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
        stickySectionHeadersEnabled={true}
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
  retryButton: {
    alignItems: 'center',
    borderRadius: 24,
    justifyContent: 'center',
    marginTop: 16,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  expiredNotification: {
    opacity: 0.6,
  },
  timeContainer: {
    alignItems: 'flex-end',
  },
  expiresIn: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  sectionCount: {
    fontSize: 14,
    fontWeight: '500',
  },
});

export default NotificationScreen;
