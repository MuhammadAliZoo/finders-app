"use client"
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image } from "react-native"
import { useNavigation } from "@react-navigation/native"
import { Ionicons } from "@expo/vector-icons"
import { useTheme } from "../theme/ThemeContext"
import { NativeStackNavigationProp } from "@react-navigation/native-stack"
import { MainStackParamList } from "../navigation/types"
import { useCallback } from "react"

type NotificationType = "match" | "message" | "status" | "reminder";

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
    id: "1",
    type: "match",
    title: "Potential Match Found",
    message: "We found a potential match for your lost Gold Watch",
    time: "2 hours ago",
    read: false,
    itemId: "1",
    image: "https://via.placeholder.com/100",
  },
  {
    id: "2",
    type: "message",
    title: "New Message",
    message: "Michael Rodriguez: Is the watch still available?",
    time: "5 hours ago",
    read: true,
    itemId: "2",
    image: "https://via.placeholder.com/100",
  },
  {
    id: "3",
    type: "status",
    title: "Status Update",
    message: "Your claim for Black Wallet has been approved",
    time: "1 day ago",
    read: true,
    itemId: "3",
    image: "https://via.placeholder.com/100",
  },
  {
    id: "4",
    type: "reminder",
    title: "Reminder",
    message: "Don't forget to update your lost item description",
    time: "2 days ago",
    read: true,
    itemId: null,
    image: null,
  },
]

const NotificationScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<MainStackParamList>>()
  const { colors } = useTheme()

  const handleNavigateToSearchResults = useCallback((itemId: string) => {
    if (!itemId) {
      console.warn('Invalid itemId for SearchResults navigation');
      return;
    }
    navigation.navigate("SearchResults", { searchQuery: itemId });
  }, [navigation]);

  const handleNavigateToItemDetails = useCallback((itemId: string) => {
    if (!itemId) {
      console.warn('Invalid itemId for ItemDetails navigation');
      return;
    }
    navigation.navigate("ItemDetails", { itemId });
  }, [navigation]);

  const handleNotificationPress = useCallback((notification: Notification) => {
    if (!notification.itemId) {
      console.warn('No itemId associated with this notification');
      return;
    }

    switch (notification.type) {
      case "match":
        handleNavigateToSearchResults(notification.itemId);
        break;
      case "message":
      case "status":
        handleNavigateToItemDetails(notification.itemId);
        break;
      default:
        console.warn('No navigation action for this notification type');
    }
  }, [handleNavigateToSearchResults, handleNavigateToItemDetails]);

  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case "match":
        return <Ionicons name="search" size={24} color={colors.primary} />
      case "message":
        return <Ionicons name="chatbubble" size={24} color={colors.primary} />
      case "status":
        return <Ionicons name="checkmark-circle" size={24} color={colors.warning} />
      case "reminder":
        return <Ionicons name="alarm" size={24} color={colors.error} />
      default:
        return <Ionicons name="notifications" size={24} color={colors.primary} />
    }
  }

  const renderNotificationItem = ({ item }: { item: Notification }) => (
    <TouchableOpacity
      style={[styles.notificationItem, { backgroundColor: item.read ? colors.background : colors.card }]}
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
        {item.type === "match" && item.itemId && (
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
        {item.type === "message" && item.itemId && (
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
  )

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.background }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]} numberOfLines={1}>Notifications</Text>
        <TouchableOpacity style={styles.markAllReadButton}>
          <Text style={[styles.markAllRead, { color: colors.primary }]}>Mark all read</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={notifications}
        renderItem={renderNotificationItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.notificationsList}
        showsVerticalScrollIndicator={false}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  headerTitle: {
    fontSize: 34,
    fontWeight: "800",
    flex: 1,
    letterSpacing: -0.5,
  },
  markAllReadButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  markAllRead: {
    fontSize: 14,
    fontWeight: "600",
  },
  notificationsList: {
    padding: 16,
  },
  notificationItem: {
    flexDirection: "row",
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    position: "relative",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  notificationIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  notificationContent: {
    flex: 1,
  },
  notificationHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: -0.3,
  },
  notificationTime: {
    fontSize: 12,
    fontWeight: "500",
  },
  notificationMessage: {
    fontSize: 14,
    marginBottom: 12,
    lineHeight: 20,
    opacity: 0.8,
  },
  notificationImage: {
    width: "100%",
    height: 180,
    borderRadius: 12,
    marginBottom: 12,
  },
  unreadIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    position: "absolute",
    top: 18,
    right: 18,
  },
  actionButtons: {
    flexDirection: "row",
    marginTop: 4,
  },
  actionButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  actionButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 14,
    letterSpacing: -0.2,
  },
})

export default NotificationScreen

