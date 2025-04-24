"use client"
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useTheme } from "../../theme/ThemeContext"
import { useNavigation } from "@react-navigation/native"
import type { NativeStackNavigationProp } from "@react-navigation/native-stack"
import type { RootStackParamList } from "../../navigation/types"

type PriorityCase = {
  id: string;
  title: string;
  type: 'dispute' | 'moderation' | 'support';
  priority: 'high' | 'medium' | 'low';
  timeAgo: string;
  aiReason: string;
};

type PriorityQueueProps = {
  cases?: PriorityCase[];
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const PriorityQueue: React.FC<PriorityQueueProps> = ({ cases }) => {
  const { colors } = useTheme()
  const navigation = useNavigation<NavigationProp>()

  // Default data if none provided
  const queueData = cases || [
    {
      id: "1",
      title: "Disputed iPhone 13 claim",
      type: "dispute",
      priority: "high",
      timeAgo: "2h ago",
      aiReason: "High-value item with conflicting evidence",
    },
    {
      id: "2",
      title: "Potentially fraudulent submission",
      type: "moderation",
      priority: "high",
      timeAgo: "4h ago",
      aiReason: "Multiple red flags in user history",
    },
    {
      id: "3",
      title: "Escalated customer complaint",
      type: "support",
      priority: "medium",
      timeAgo: "1d ago",
      aiReason: "Multiple follow-ups without resolution",
    },
  ]

  const getIconName = (type: PriorityCase['type']) => {
    switch (type) {
      case "dispute":
        return "alert-circle"
      case "moderation":
        return "shield"
      case "support":
        return "chatbubbles"
      default:
        return "document-text"
    }
  }

  const getPriorityColor = (priority: PriorityCase['priority']) => {
    switch (priority) {
      case "high":
        return colors.error
      case "medium":
        return colors.warning
      case "low":
        return colors.primary
      default:
        return colors.secondary
    }
  }

  const handleCasePress = (item: PriorityCase) => {
    switch (item.type) {
      case "dispute":
        navigation.navigate("DisputeResolution")
        break
      case "moderation":
        navigation.navigate("ContentModeration")
        break
      case "support":
        navigation.navigate("AdminDashboard")
        break
      default:
        break
    }
  }

  const renderItem = ({ item }: { item: PriorityCase }) => (
    <TouchableOpacity
      style={[styles.caseItem, { backgroundColor: colors.background }]}
      onPress={() => handleCasePress(item)}
    >
      <View style={[styles.priorityIndicator, { backgroundColor: getPriorityColor(item.priority) }]} />

      <View style={[styles.iconContainer, { backgroundColor: colors.card }]}>
        <Ionicons name={getIconName(item.type)} size={20} color={getPriorityColor(item.priority)} />
      </View>

      <View style={styles.caseInfo}>
        <Text style={[styles.caseTitle, { color: colors.text }]} numberOfLines={1}>
          {item.title}
        </Text>
        <Text style={[styles.caseReason, { color: colors.secondary }]} numberOfLines={1}>
          AI: {item.aiReason}
        </Text>
      </View>

      <View style={styles.caseMetadata}>
        <Text style={[styles.caseTime, { color: colors.secondary }]}>{item.timeAgo}</Text>
        <Ionicons name="chevron-forward" size={16} color={colors.secondary} />
      </View>
    </TouchableOpacity>
  )

  return (
    <View style={styles.container}>
      <FlatList
        data={queueData}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        scrollEnabled={false}
      />

      <TouchableOpacity
        style={[styles.viewAllButton, { borderColor: colors.border }]}
        onPress={() => navigation.navigate("ContentModeration")}
      >
        <Text style={[styles.viewAllText, { color: colors.primary }]}>View All Priority Cases</Text>
        <Ionicons name="arrow-forward" size={16} color={colors.primary} />
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  caseItem: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    position: "relative",
    overflow: "hidden",
  },
  priorityIndicator: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  caseInfo: {
    flex: 1,
  },
  caseTitle: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 4,
  },
  caseReason: {
    fontSize: 12,
  },
  caseMetadata: {
    flexDirection: "row",
    alignItems: "center",
  },
  caseTime: {
    fontSize: 12,
    marginRight: 4,
  },
  viewAllButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 8,
    marginTop: 8,
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: "500",
    marginRight: 4,
  },
})

export default PriorityQueue

