"use client"
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image } from "react-native"
import { useNavigation } from "@react-navigation/native"
import { Ionicons } from "@expo/vector-icons"
import { useTheme } from "../context/ThemeContext"

// Mock data
const notifications = [
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
  const navigation = useNavigation()
  const { colors } = useTheme()

  const getNotificationIcon = (type) => {
    switch (type) {
      case "match":
        return <Ionicons name="search" size={24} color={colors.primary} />
      case "message":
        return <Ionicons name="chatbubble" size={24} color={colors.success} />
      case "status":
        return <Ionicons name="checkmark-circle" size={24} color={colors.warning} />
      case "reminder":
        return <Ionicons name="alarm" size={24} color={colors.error} />
      default:
        return <Ionicons name="notifications" size={24} color={colors.primary} />
    }
  }

  const handleNotificationPress = (notification) => {
    if (notification.itemId) {
      if (notification.type === "match") {
        navigation.navigate("SearchResults", { itemId: notification.itemId })
      } else {
        navigation.navigate("ItemDetails", { itemId: notification.itemId })
      }
    }
  }

  const renderNotificationItem = ({ item }) => (
    <TouchableOpacity
      style={[styles.notificationItem, { backgroundColor: item.read ? colors.background : colors.card }]}
      onPress={() => handleNotificationPress(item)}
    >
      <View style={styles.notificationIcon}>{getNotificationIcon(item.type)}</View>
      <View style={styles.notificationContent}>
        <View style={styles.notificationHeader}>
          <Text style={[styles.notificationTitle, { color: colors.text }]}>{item.title}</Text>
          <Text style={[styles.notificationTime, { color: colors.secondary }]}>{item.time}</Text>
        </View>
        <Text style={[styles.notificationMessage, { color: colors.text }]}>{item.message}</Text>
        {item.image && <Image source={{ uri: item.image }} style={styles.notificationImage} />}
        {item.type === "match" && (
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: colors.primary }]}
              onPress={() => navigation.navigate("SearchResults", { itemId: item.itemId })}
            >
              <Text style={styles.actionButtonText}>View Matches</Text>
            </TouchableOpacity>
          </View>
        )}
        {item.type === "message" && (
          <View style={styles.actionButtons}>
            <TouchableOpacity style={[styles.actionButton, { backgroundColor: colors.success }]}>
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
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Notifications</Text>
        <TouchableOpacity>
          <Text style={[styles.markAllRead, { color: colors.primary }]}>Mark all as read</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={notifications}
        renderItem={renderNotificationItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.notificationsList}
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
    padding: 16,
    paddingBottom: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
  },
  markAllRead: {
    fontSize: 14,
  },
  notificationsList: {
    padding: 8,
  },
  notificationItem: {
    flexDirection: "row",
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    position: "relative",
  },
  notificationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  notificationContent: {
    flex: 1,
  },
  notificationHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: "bold",
  },
  notificationTime: {
    fontSize: 12,
  },
  notificationMessage: {
    fontSize: 14,
    marginBottom: 8,
  },
  notificationImage: {
    width: "100%",
    height: 150,
    borderRadius: 8,
    marginBottom: 8,
  },
  unreadIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    position: "absolute",
    top: 16,
    right: 16,
  },
  actionButtons: {
    flexDirection: "row",
  },
  actionButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  actionButtonText: {
    color: "#FFFFFF",
    fontWeight: "500",
    fontSize: 14,
  },
})

export default NotificationScreen

