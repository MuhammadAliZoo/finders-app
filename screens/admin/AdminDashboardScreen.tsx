'use client';

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  RefreshControl,
  ViewProps,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { adminApi } from '../../api/admin';
import AdminHeader from '../../components/admin/AdminHeader';
import MetricsCard, { MetricsCardProps } from '../../components/admin/MetricsCard';
import PerformanceChart from '../../components/admin/PerformanceChart';
import HeatmapView from '../../components/admin/HeatmapView';
import PriorityQueue from '../../components/admin/PriorityQueue';
import InsightsCard from '../../components/admin/InsightsCard';
import AdminWidget from '../../components/admin/AdminWidget';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import { RootStackParamList } from '../../navigation/types';
import { DashboardData, AdminMetrics, MetricData } from '../../types/admin';

const { width } = Dimensions.get('window');

type WidgetType = 'recentActivity' | 'pendingApprovals' | 'criticalIssues' | 'performanceMetrics';

type AdminDashboardScreenProps = {
  navigation: DrawerNavigationProp<RootStackParamList, 'AdminHome'>;
};

interface AdminWidgetProps {
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  children: React.ReactNode;
}

interface MetricCardProps {
  metric: MetricData;
  key?: string;
}

const metricsData: MetricData[] = [
  {
    title: 'Total Users',
    value: 2478,
    change: 12.5,
    icon: 'people-outline',
    color: '#4CAF50',
  },
  {
    title: 'Active Items',
    value: 1234,
    change: 8.2,
    icon: 'cube-outline',
    color: '#2196F3',
  },
  {
    title: 'Matches Made',
    value: 567,
    change: -2.4,
    icon: 'git-network-outline',
    color: '#9C27B0',
  },
  {
    title: 'Open Disputes',
    value: 23,
    change: 5.6,
    icon: 'warning-outline',
    color: '#FF9800',
  },
];

const AdminDashboardScreen: React.FC<AdminDashboardScreenProps> = ({ navigation }) => {
  const { colors } = useTheme();
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTimeframe, setSelectedTimeframe] = useState('week');
  const [activeWidgets, setActiveWidgets] = useState<WidgetType[]>([
    'recentActivity',
    'pendingApprovals',
    'criticalIssues',
    'performanceMetrics',
  ]);

  const styles = StyleSheet.create({
    avatar: {
      alignItems: 'center',
      backgroundColor: '#F5F5F5',
      borderRadius: 18,
      height: 36,
      justifyContent: 'center',
      width: 36,
    },
    avatarText: {
      color: '#0066FF',
      fontSize: 16,
      fontWeight: 'bold',
    },
    badge: {
      alignItems: 'center',
      backgroundColor: '#0066FF',
      borderRadius: 9,
      height: 18,
      justifyContent: 'center',
      minWidth: 18,
      paddingHorizontal: 4,
      position: 'absolute',
      right: -6,
      top: -6,
    },
    badgeText: {
      color: '#FFFFFF',
      fontSize: 12,
      fontWeight: 'bold',
    },
    collaborationButton: {
      alignItems: 'center',
      backgroundColor: colors.primary,
      borderRadius: 20,
      elevation: 2,
      flexDirection: 'row',
      justifyContent: 'center',
      marginTop: 24,
      padding: 16,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 8,
    },
    collaborationButtonText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '600',
      marginLeft: 12,
    },
    container: {
      backgroundColor: colors.background,
      flex: 1,
    },
    dateText: {
      color: '#666',
      fontSize: 16,
      marginBottom: 16,
    },
    header: {
      alignItems: 'center',
      backgroundColor: colors.background,
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingBottom: 16,
      paddingHorizontal: 16,
      paddingTop: 60,
    },
    headerLeft: {
      alignItems: 'center',
      flexDirection: 'row',
    },
    headerRight: {
      alignItems: 'center',
      flexDirection: 'row',
      gap: 16,
    },
    headerTitle: {
      color: colors.text,
      fontSize: 24,
      fontWeight: 'bold',
    },
    loadingContainer: {
      alignItems: 'center',
      flex: 1,
      justifyContent: 'center',
      paddingVertical: 40,
    },
    loadingText: {
      fontSize: 16,
      marginTop: 16,
    },
    menuButton: {
      marginRight: 16,
    },
    metricCard: {
      backgroundColor: colors.card,
      borderRadius: 20,
      elevation: 2,
      flex: 1,
      minWidth: width / 2 - 24,
      padding: 20,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 8,
    },
    metricChange: {
      alignItems: 'center',
      alignSelf: 'flex-start',
      backgroundColor: '#F5F5F5',
      borderRadius: 8,
      flexDirection: 'row',
      paddingHorizontal: 8,
      paddingVertical: 4,
    },
    metricChangeText: {
      color: '#666',
      fontSize: 14,
      marginLeft: 4,
    },
    metricIcon: {
      alignItems: 'center',
      borderRadius: 12,
      height: 40,
      justifyContent: 'center',
      marginBottom: 16,
      width: 40,
    },
    metricTitle: {
      color: '#666',
      fontSize: 16,
      marginBottom: 8,
    },
    metricValue: {
      color: colors.text,
      fontSize: 32,
      fontWeight: 'bold',
      marginBottom: 8,
    },
    metricsContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 16,
      marginBottom: 24,
    },
    notificationButton: {
      position: 'relative',
    },
    reportButton: {
      alignItems: 'center',
      aspectRatio: 1,
      backgroundColor: colors.card,
      borderRadius: 20,
      elevation: 2,
      justifyContent: 'center',
      padding: 20,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 8,
      width: width / 2 - 24,
    },
    reportButtonText: {
      color: colors.text,
      fontSize: 16,
      fontWeight: '600',
      marginTop: 12,
      textAlign: 'center',
    },
    reportingOptions: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 16,
      marginTop: 12,
      paddingHorizontal: 4,
    },
    scrollContent: {
      paddingHorizontal: 16,
      paddingTop: 16,
    },
    sectionContainer: {
      backgroundColor: colors.card,
      borderRadius: 20,
      elevation: 2,
      marginBottom: 24,
      padding: 24,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 8,
    },
    sectionHeader: {
      alignItems: 'center',
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 20,
    },
    sectionTitle: {
      color: colors.text,
      fontSize: 24,
      fontWeight: 'bold',
    },
    timeframeButton: {
      alignItems: 'center',
      borderRadius: 8,
      flex: 1,
      paddingHorizontal: 16,
      paddingVertical: 8,
    },
    timeframeSelector: {
      backgroundColor: '#F5F5F5',
      borderRadius: 12,
      flexDirection: 'row',
      marginTop: 8,
      padding: 4,
    },
    timeframeText: {
      fontSize: 14,
      fontWeight: '600',
    },
    viewAllText: {
      color: '#0066FF',
      fontSize: 16,
      fontWeight: '600',
    },
    welcomeSection: {
      backgroundColor: colors.card,
      borderRadius: 20,
      elevation: 2,
      marginBottom: 24,
      padding: 24,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 8,
    },
    welcomeText: {
      color: colors.text,
      fontSize: 28,
      fontWeight: 'bold',
      marginBottom: 8,
    },
    widget: {
      backgroundColor: colors.card,
      borderRadius: 20,
      elevation: 2,
      padding: 20,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 8,
      width: width / 2 - 24,
    },
    widgetGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 16,
    },
    widgetIcon: {
      alignItems: 'center',
      borderRadius: 12,
      height: 40,
      justifyContent: 'center',
      marginBottom: 12,
      width: 40,
    },
    widgetTitle: {
      color: colors.text,
      fontSize: 18,
      fontWeight: '600',
      marginBottom: 8,
    },
    widgetValue: {
      color: '#666',
      fontSize: 14,
    },
    widgetsContainer: {
      marginBottom: 24,
    },
  });

  const MetricCard: React.FC<MetricCardProps> = ({ metric }) => (
    <View style={styles.metricCard}>
      <View style={[styles.metricIcon, { backgroundColor: `${metric.color}20` }]}>
        <Ionicons name={metric.icon} size={24} color={metric.color} />
      </View>
      <Text style={styles.metricTitle}>{metric.title}</Text>
      <Text style={styles.metricValue}>{metric.value}</Text>
      <View style={styles.metricChange}>
        <Ionicons
          name={metric.change >= 0 ? 'arrow-up' : 'arrow-down'}
          size={14}
          color={metric.change >= 0 ? '#4CAF50' : '#F44336'}
        />
        <Text style={styles.metricChangeText}>{Math.abs(metric.change)}% vs last period</Text>
      </View>
    </View>
  );

  useEffect(() => {
    fetchDashboardData();
  }, [selectedTimeframe]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getDashboardData(selectedTimeframe);
      setDashboardData(data);
    } catch (error) {
      console.error('Failed to fetch dashboard data', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
  };

  const toggleWidget = (widgetId: WidgetType) => {
    if (activeWidgets.includes(widgetId)) {
      setActiveWidgets(activeWidgets.filter(id => id !== widgetId));
    } else {
      setActiveWidgets([...activeWidgets, widgetId]);
    }
  };

  if (loading && !refreshing) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <AdminHeader title="Dashboard" navigation={navigation} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.secondary }]}>
            Loading dashboard data...
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity style={styles.menuButton} onPress={() => navigation.openDrawer()}>
            <Ionicons name="menu" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Dashboard</Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.notificationButton}>
            <Ionicons name="notifications-outline" size={24} color={colors.text} />
            {(dashboardData?.notifications?.length ?? 0) > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{dashboardData?.notifications?.length ?? 0}</Text>
              </View>
            )}
          </TouchableOpacity>
          <TouchableOpacity style={styles.avatar}>
            <Text style={styles.avatarText}>{user?.email?.[0]?.toUpperCase() || 'A'}</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeText}>
            Welcome back,{'\n'}
            {user?.email || 'Admin'}
          </Text>
          <Text style={styles.dateText}>
            {new Date().toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
              year: 'numeric',
            })}
          </Text>
          <View style={styles.timeframeSelector}>
            {['Day', 'Week', 'Month'].map(period => (
              <TouchableOpacity
                key={period}
                style={[
                  styles.timeframeButton,
                  selectedTimeframe.toLowerCase() === period.toLowerCase() && {
                    backgroundColor: '#0066FF20',
                  },
                ]}
                onPress={() => setSelectedTimeframe(period.toLowerCase())}
              >
                <Text
                  style={[
                    styles.timeframeText,
                    {
                      color:
                        selectedTimeframe.toLowerCase() === period.toLowerCase()
                          ? '#0066FF'
                          : '#666',
                    },
                  ]}
                >
                  {period}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.metricsContainer}>
          {metricsData.map((metric, index) => (
            <MetricCard key={`metric-${index}`} metric={metric} />
          ))}
        </View>

        {/* AI Insights */}
        <View style={[styles.sectionContainer, { backgroundColor: colors.card }]}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>AI-Driven Insights</Text>
            <TouchableOpacity>
              <Ionicons name="information-circle-outline" size={22} color={colors.secondary} />
            </TouchableOpacity>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 4, gap: 16 }}
          >
            <InsightsCard
              title="Peak Activity Times"
              description="Most items are reported between 4-6 PM on weekdays"
            />
            <InsightsCard
              title="Common Categories"
              description="Electronics and wallets are the most frequently lost items"
            />
            <InsightsCard
              title="Geographic Trends"
              description="Downtown area shows 35% increase in lost items this month"
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
          <PerformanceChart
            data={dashboardData?.performanceData || { labels: [], datasets: [{ data: [] }] }}
          />
        </View>

        {/* Heatmap */}
        <View style={[styles.sectionContainer, { backgroundColor: colors.card }]}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Dynamic Heatmap</Text>
            <TouchableOpacity>
              <Text style={[styles.viewAllText, { color: colors.primary }]}>Full Screen</Text>
            </TouchableOpacity>
          </View>
          <HeatmapView
            data={
              dashboardData?.heatmapData?.map(point => ({
                latitude: Number(point.latitude) || 37.7749,
                longitude: Number(point.longitude) || -122.4194,
                weight: Number(point.weight) || 1,
              })) || [
                // Default data points centered around San Francisco
                { latitude: 37.7749, longitude: -122.4194, weight: 1 },
                { latitude: 37.7748, longitude: -122.4193, weight: 0.8 },
                { latitude: 37.7747, longitude: -122.4195, weight: 0.6 },
              ]
            }
          />
        </View>

        {/* Priority Cases */}
        <View style={[styles.sectionContainer, { backgroundColor: colors.card }]}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>AI-Prioritized Cases</Text>
            <TouchableOpacity onPress={() => navigation.navigate('ContentModeration')}>
              <Text style={[styles.viewAllText, { color: colors.primary }]}>View All</Text>
            </TouchableOpacity>
          </View>
          <PriorityQueue cases={dashboardData?.priorityCases || []} />
        </View>

        {/* Customizable Widgets */}
        <View style={styles.widgetsContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Widgets</Text>
            <TouchableOpacity onPress={() => navigation.navigate('WidgetSettings')}>
              <Ionicons name="settings-outline" size={24} color={colors.secondary} />
            </TouchableOpacity>
          </View>

          <View style={styles.widgetGrid}>
            {activeWidgets.includes('recentActivity') && (
              <TouchableOpacity
                style={[styles.widget, { backgroundColor: colors.primary + '10' }]}
                onPress={() => navigation.navigate('ContentModeration')}
              >
                <View style={[styles.widgetIcon, { backgroundColor: colors.primary + '20' }]}>
                  <Ionicons name="time-outline" size={24} color={colors.primary} />
                </View>
                <Text style={styles.widgetTitle}>Recent Activity</Text>
                <Text style={styles.widgetValue}>
                  {dashboardData?.recentActivity?.length || 0} new activities
                </Text>
              </TouchableOpacity>
            )}

            {activeWidgets.includes('pendingApprovals') && (
              <TouchableOpacity
                style={[styles.widget, { backgroundColor: colors.primary + '10' }]}
                onPress={() => navigation.navigate('ContentModeration')}
              >
                <View style={[styles.widgetIcon, { backgroundColor: colors.primary + '20' }]}>
                  <Ionicons name="checkmark-circle-outline" size={24} color={colors.primary} />
                </View>
                <Text style={styles.widgetTitle}>Pending Approvals</Text>
                <Text style={styles.widgetValue}>
                  {dashboardData?.pendingApprovals?.length || 0} items pending
                </Text>
              </TouchableOpacity>
            )}

            {activeWidgets.includes('criticalIssues') && (
              <TouchableOpacity
                style={[styles.widget, { backgroundColor: colors.error + '10' }]}
                onPress={() => navigation.navigate('DisputeResolution')}
              >
                <View style={[styles.widgetIcon, { backgroundColor: colors.error + '20' }]}>
                  <Ionicons name="alert-circle-outline" size={24} color={colors.error} />
                </View>
                <Text style={styles.widgetTitle}>Critical Issues</Text>
                <Text style={styles.widgetValue}>
                  {dashboardData?.criticalIssues?.length || 0} issues
                </Text>
              </TouchableOpacity>
            )}

            {activeWidgets.includes('performanceMetrics') && (
              <TouchableOpacity
                style={[styles.widget, { backgroundColor: colors.warning + '10' }]}
                onPress={() => navigation.navigate('GenerateReport', { type: 'performance' })}
              >
                <View style={[styles.widgetIcon, { backgroundColor: colors.warning + '20' }]}>
                  <Ionicons name="bar-chart-outline" size={24} color={colors.warning} />
                </View>
                <Text style={styles.widgetTitle}>Your Performance</Text>
                <Text style={styles.widgetValue}>View your performance metrics</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Cross-Module Reporting */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Cross-Module Reporting</Text>
          </View>

          <View style={styles.reportingOptions}>
            <TouchableOpacity
              style={[styles.reportButton, { backgroundColor: colors.primary + '10' }]}
              onPress={() => navigation.navigate('GenerateReport', { type: 'users' })}
            >
              <View style={[styles.widgetIcon, { backgroundColor: colors.primary + '20' }]}>
                <Ionicons name="people" size={24} color={colors.primary} />
              </View>
              <Text style={styles.reportButtonText}>User Report</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.reportButton, { backgroundColor: colors.primary + '10' }]}
              onPress={() => navigation.navigate('GenerateReport', { type: 'items' })}
            >
              <View style={[styles.widgetIcon, { backgroundColor: colors.primary + '20' }]}>
                <Ionicons name="cube" size={24} color={colors.primary} />
              </View>
              <Text style={styles.reportButtonText}>Items Report</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.reportButton, { backgroundColor: colors.warning + '10' }]}
              onPress={() => navigation.navigate('GenerateReport', { type: 'matches' })}
            >
              <View style={[styles.widgetIcon, { backgroundColor: colors.warning + '20' }]}>
                <Ionicons name="link" size={24} color={colors.warning} />
              </View>
              <Text style={styles.reportButtonText}>Matches Report</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.reportButton, { backgroundColor: colors.error + '10' }]}
              onPress={() => navigation.navigate('GenerateReport', { type: 'disputes' })}
            >
              <View style={[styles.widgetIcon, { backgroundColor: colors.error + '20' }]}>
                <Ionicons name="alert-circle" size={24} color={colors.error} />
              </View>
              <Text style={styles.reportButtonText}>Disputes Report</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Collaborative Workspace */}
        <TouchableOpacity
          style={[styles.collaborationButton, { backgroundColor: colors.primary }]}
          onPress={() => navigation.navigate('CollaborativeWorkspace')}
        >
          <Ionicons name="people" size={24} color="#FFFFFF" />
          <Text style={styles.collaborationButtonText}>Enter Collaborative Workspace</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

export default AdminDashboardScreen;
