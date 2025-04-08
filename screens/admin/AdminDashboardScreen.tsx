"use client"

import { useState, useEffect } from "react"
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  RefreshControl,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useTheme } from "../../context/ThemeContext"
import { useAuth } from "../../context/AuthContext"
import { adminApi } from "../../api/admin"
import AdminHeader from "../../components/admin/AdminHeader"
import MetricsCard from "../../components/admin/MetricsCard"
import PerformanceChart from "../../components/admin/PerformanceChart"
import HeatmapView from "../../components/admin/HeatmapView"
import PriorityQueue from "../../components/admin/PriorityQueue"
import InsightsCard from "../../components/admin/InsightsCard"
import AdminWidget from "../../components/admin/AdminWidget"

const { width } = Dimensions.get("window")

const AdminDashboardScreen = ({ navigation }) => {
  const { colors } = useTheme()
  const { user } = useAuth()
  const [dashboardData, setDashboardData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [selectedTimeframe, setSelectedTimeframe] = useState("week")
  const [activeWidgets, setActiveWidgets] = useState([
    "recentActivity",
    "pendingApprovals",
    "criticalIssues",
    "performanceMetrics",
  ])

  useEffect(() => {
    fetchDashboardData()
  }, [selectedTimeframe])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      const data = await adminApi.getDashboardData(selectedTimeframe)
      setDashboardData(data)
    } catch (error) {
      console.error("Failed to fetch dashboard data", error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const onRefresh = () => {
    setRefreshing(true)
    fetchDashboardData()
  }

  const toggleWidget = (widgetId) => {
    if (activeWidgets.includes(widgetId)) {
      setActiveWidgets(activeWidgets.filter((id) => id !== widgetId))
    } else {
      setActiveWidgets([...activeWidgets, widgetId])
    }
  }

  if (loading && !refreshing) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <AdminHeader title="Dashboard" navigation={navigation} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.secondary }]}>Loading dashboard data...</Text>
        </View>
      </View>
    )
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <AdminHeader title="Dashboard" navigation={navigation} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />}
      >
        {/* Welcome Section */}
        <View style={styles.welcomeSection}>
          <View>
            <Text style={[styles.welcomeText, { color: colors.text }]}>Welcome back, {user?.name}</Text>
            <Text style={[styles.dateText, { color: colors.secondary }]}>
              {new Date().toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </Text>
          </View>
          <View style={styles.timeframeSelector}>
            <TouchableOpacity
              style={[
                styles.timeframeButton,
                selectedTimeframe === "day" && { backgroundColor: colors.primary + "20" },
              ]}
              onPress={() => setSelectedTimeframe("day")}
            >
              <Text
                style={[
                  styles.timeframeText,
                  { color: selectedTimeframe === "day" ? colors.primary : colors.secondary },
                ]}
              >
                Day
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.timeframeButton,
                selectedTimeframe === "week" && { backgroundColor: colors.primary + "20" },
              ]}
              onPress={() => setSelectedTimeframe("week")}
            >
              <Text
                style={[
                  styles.timeframeText,
                  { color: selectedTimeframe === "week" ? colors.primary : colors.secondary },
                ]}
              >
                Week
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.timeframeButton,
                selectedTimeframe === "month" && { backgroundColor: colors.primary + "20" },
              ]}
              onPress={() => setSelectedTimeframe("month")}
            >
              <Text
                style={[
                  styles.timeframeText,
                  { color: selectedTimeframe === "month" ? colors.primary : colors.secondary },
                ]}
              >
                Month
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Key Metrics */}
        <View style={styles.metricsContainer}>
          <MetricsCard
            title="Active Users"
            value={dashboardData?.metrics.activeUsers || 0}
            change={dashboardData?.metrics.activeUsersChange || 0}
            icon="people-outline"
            color={colors.primary}
          />
          <MetricsCard
            title="New Items"
            value={dashboardData?.metrics.newItems || 0}
            change={dashboardData?.metrics.newItemsChange || 0}
            icon="add-circle-outline"
            color="#4CAF50"
          />
          <MetricsCard
            title="Matches"
            value={dashboardData?.metrics.matches || 0}
            change={dashboardData?.metrics.matchesChange || 0}
            icon="link-outline"
            color="#FF9800"
          />
          <MetricsCard
            title="Disputes"
            value={dashboardData?.metrics.disputes || 0}
            change={dashboardData?.metrics.disputesChange || 0}
            icon="alert-circle-outline"
            color="#F44336"
          />
        </View>

        {/* AI Insights */}
        <View style={[styles.sectionContainer, { backgroundColor: colors.card }]}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>AI-Driven Insights</Text>
            <TouchableOpacity>
              <Ionicons name="information-circle-outline" size={22} color={colors.secondary} />
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <InsightsCard
              title="Peak Activity Times"
              description="Most items are reported between 4-6 PM on weekdays"
              actionText="View Detailed Analysis"
              icon="time-outline"
              color="#9C27B0"
            />
            <InsightsCard
              title="Common Categories"
              description="Electronics and wallets are the most frequently lost items"
              actionText="View Category Breakdown"
              icon="pricetags-outline"
              color="#2196F3"
            />
            <InsightsCard
              title="Geographic Trends"
              description="Downtown area shows 35% increase in lost items this month"
              actionText="View Heatmap"
              icon="map-outline"
              color="#FF5722"
            />
          </ScrollView>
        </View>

        {/* Performance Metrics */}
        <View style={[styles.sectionContainer, { backgroundColor: colors.card }]}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Performance Metrics</Text>
            <TouchableOpacity>
              <Text style={[styles.viewAllText, { color: colors.primary }]}>View All</Text>
            </TouchableOpacity>
          </View>
          <PerformanceChart data={dashboardData?.performanceData || []} />
        </View>

        {/* Heatmap */}
        <View style={[styles.sectionContainer, { backgroundColor: colors.card }]}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Dynamic Heatmap</Text>
            <TouchableOpacity>
              <Text style={[styles.viewAllText, { color: colors.primary }]}>Full Screen</Text>
            </TouchableOpacity>
          </View>
          <HeatmapView data={dashboardData?.heatmapData || []} />
        </View>

        {/* Priority Cases */}
        <View style={[styles.sectionContainer, { backgroundColor: colors.card }]}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>AI-Prioritized Cases</Text>
            <TouchableOpacity onPress={() => navigation.navigate("ContentModeration")}>
              <Text style={[styles.viewAllText, { color: colors.primary }]}>View All</Text>
            </TouchableOpacity>
          </View>
          <PriorityQueue cases={dashboardData?.priorityCases || []} />
        </View>

        {/* Customizable Widgets */}
        <View style={styles.widgetsContainer}>
          <View style={styles.widgetHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Widgets</Text>
            <TouchableOpacity onPress={() => navigation.navigate("WidgetSettings")}>
              <Ionicons name="settings-outline" size={22} color={colors.secondary} />
            </TouchableOpacity>
          </View>

          <View style={styles.widgetsGrid}>
            {activeWidgets.includes("recentActivity") && (
              <AdminWidget
                title="Recent Activity"
                data={dashboardData?.recentActivity || []}
                type="activity"
                onRemove={() => toggleWidget("recentActivity")}
              />
            )}

            {activeWidgets.includes("pendingApprovals") && (
              <AdminWidget
                title="Pending Approvals"
                data={dashboardData?.pendingApprovals || []}
                type="approvals"
                onRemove={() => toggleWidget("pendingApprovals")}
              />
            )}

            {activeWidgets.includes("criticalIssues") && (
              <AdminWidget
                title="Critical Issues"
                data={dashboardData?.criticalIssues || []}
                type="issues"
                onRemove={() => toggleWidget("criticalIssues")}
              />
            )}

            {activeWidgets.includes("performanceMetrics") && (
              <AdminWidget
                title="Your Performance"
                data={dashboardData?.adminPerformance || {}}
                type="performance"
                onRemove={() => toggleWidget("performanceMetrics")}
              />
            )}
          </View>

          <TouchableOpacity
            style={[styles.addWidgetButton, { borderColor: colors.border }]}
            onPress={() => navigation.navigate("WidgetSettings")}
          >
            <Ionicons name="add-outline" size={24} color={colors.secondary} />
            <Text style={[styles.addWidgetText, { color: colors.secondary }]}>Add Widget</Text>
          </TouchableOpacity>
        </View>

        {/* Cross-Module Reporting */}
        <View style={[styles.sectionContainer, { backgroundColor: colors.card }]}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Cross-Module Reporting</Text>
          </View>
          <View style={styles.reportingOptions}>
            <TouchableOpacity
              style={[styles.reportButton, { backgroundColor: colors.primary + "20" }]}
              onPress={() => navigation.navigate("GenerateReport", { type: "users" })}
            >
              <Ionicons name="people" size={24} color={colors.primary} />
              <Text style={[styles.reportButtonText, { color: colors.text }]}>User Report</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.reportButton, { backgroundColor: colors.success + "20" }]}
              onPress={() => navigation.navigate("GenerateReport", { type: "items" })}
            >
              <Ionicons name="cube" size={24} color={colors.success} />
              <Text style={[styles.reportButtonText, { color: colors.text }]}>Items Report</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.reportButton, { backgroundColor: colors.warning + "20" }]}
              onPress={() => navigation.navigate("GenerateReport", { type: "matches" })}
            >
              <Ionicons name="link" size={24} color={colors.warning} />
              <Text style={[styles.reportButtonText, { color: colors.text }]}>Matches Report</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.reportButton, { backgroundColor: colors.error + "20" }]}
              onPress={() => navigation.navigate("GenerateReport", { type: "disputes" })}
            >
              <Ionicons name="alert-circle" size={24} color={colors.error} />
              <Text style={[styles.reportButtonText, { color: colors.text }]}>Disputes Report</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Collaborative Workspace */}
        <TouchableOpacity
          style={[styles.collaborationButton, { backgroundColor: colors.primary }]}
          onPress={() => navigation.navigate("CollaborativeWorkspace")}
        >
          <Ionicons name="people" size={24} color="#FFFFFF" />
          <Text style={styles.collaborationButtonText}>Enter Collaborative Workspace</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
  },
  welcomeSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  welcomeText: {
    fontSize: 22,
    fontWeight: "bold",
  },
  dateText: {
    fontSize: 14,
    marginTop: 4,
  },
  timeframeSelector: {
    flexDirection: "row",
    borderRadius: 8,
    overflow: "hidden",
  },
  timeframeButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    marginLeft: 4,
  },
  timeframeText: {
    fontSize: 12,
    fontWeight: "500",
  },
  metricsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  sectionContainer: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: "500",
  },
  widgetsContainer: {
    marginBottom: 16,
  },
  widgetHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  widgetsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  addWidgetButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderStyle: "dashed",
    borderRadius: 12,
    padding: 16,
    marginTop: 12,
  },
  addWidgetText: {
    fontSize: 16,
    fontWeight: "500",
    marginLeft: 8,
  },
  reportingOptions: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  reportButton: {
    width: "48%",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    marginBottom: 12,
  },
  reportButtonText: {
    fontSize: 14,
    fontWeight: "500",
    marginTop: 8,
  },
  collaborationButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
  },
  collaborationButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 8,
  },
})

export default AdminDashboardScreen

