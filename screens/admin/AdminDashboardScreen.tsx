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
import { useTheme } from '../../context/ThemeContext';
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
import { supabase } from '../../config/supabase';

const { width } = Dimensions.get('window');

type WidgetType = 'recentActivity' | 'pendingApprovals' | 'criticalIssues' | 'performanceMetrics';

type AdminDashboardScreenProps = {
  navigation: DrawerNavigationProp<RootStackParamList, 'AdminDashboard'>;
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

// Add an interface for performance data 
interface PerformanceDataPoint {
  date: string;
  responseTime: number;
  requestCount: number;
  successRate: number;
}

const AdminDashboardScreen: React.FC<AdminDashboardScreenProps> = ({ navigation }) => {
  const { colors } = useTheme();
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTimeframe, setSelectedTimeframe] = useState('week');
  const [performanceData, setPerformanceData] = useState<PerformanceDataPoint[]>([]);
  const [selectedMetricType, setSelectedMetricType] = useState<'responseTime' | 'requestCount' | 'successRate'>('responseTime');
  const [metrics, setMetrics] = useState({
    activeUsers: 0,
    activeUsersChange: 0,
    newItems: 0,
    newItemsChange: 0,
    matches: 0,
    matchesChange: 0,
    disputes: 0,
    disputesChange: 0,
  });
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
    // Disable JWT expiry popup
    supabase.auth.onAuthStateChange((event, session) => {
      // Only handle events silently, don't show popups
      console.log('Auth state changed:', event);
    });
    
    fetchDashboardData();
    fetchMetricsFromSupabase();
    fetchPerformanceDataFromSupabase();
  }, [selectedTimeframe]);

  // New function to fetch metrics directly from Supabase
  const fetchMetricsFromSupabase = async () => {
    try {
      // Get date ranges for current and previous periods
      const now = new Date();
      let currentStart: Date, previousStart: Date;
      
      // Calculate period based on selected timeframe
      if (selectedTimeframe === 'day') {
        currentStart = new Date(now.setHours(0, 0, 0, 0));
        previousStart = new Date(currentStart);
        previousStart.setDate(previousStart.getDate() - 1);
      } else if (selectedTimeframe === 'week') {
        currentStart = new Date(now);
        currentStart.setDate(currentStart.getDate() - 7);
        previousStart = new Date(currentStart);
        previousStart.setDate(previousStart.getDate() - 7);
      } else { // month
        currentStart = new Date(now);
        currentStart.setDate(currentStart.getDate() - 30);
        previousStart = new Date(currentStart);
        previousStart.setDate(previousStart.getDate() - 30);
      }

      // Format dates for Supabase queries
      const currentStartStr = currentStart.toISOString();
      const previousStartStr = previousStart.toISOString();
      const previousEndStr = currentStart.toISOString();
      const nowStr = now.toISOString();

      // Fetch metrics in parallel
      const [
        { count: currentUsers },
        { count: previousUsers },
        { count: currentItems },
        { count: previousItems },
        { count: currentMatches },
        { count: previousMatches },
        { count: currentDisputes },
        { count: previousDisputes }
      ] = await Promise.all([
        // Current users
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        // Previous users (using created_at if available)
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        
        // Current active items
        supabase.from('items')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'available')
          .gte('created_at', currentStartStr),
        // Previous active items
        supabase.from('items')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'available')
          .gte('created_at', previousStartStr)
          .lt('created_at', previousEndStr),
          
        // Current matches (using a joined request table, if available)
        supabase.from('items')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'matched')
          .gte('created_at', currentStartStr),
        // Previous matches
        supabase.from('items')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'matched')
          .gte('created_at', previousStartStr)
          .lt('created_at', previousEndStr),
          
        // Current disputes (adjust table name as needed)
        supabase.from('disputes')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'open')
          .gte('created_at', currentStartStr),
        // Previous disputes
        supabase.from('disputes')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'open')
          .gte('created_at', previousStartStr)
          .lt('created_at', previousEndStr)
      ]);
      
      // Calculate percent changes
      const calculatePercentChange = (current: number, previous: number) => {
        if (previous === 0) return current > 0 ? 100 : 0;
        return Math.round(((current - previous) / previous) * 100);
      };
      
      // Update metrics state
      setMetrics({
        activeUsers: currentUsers || 0,
        activeUsersChange: calculatePercentChange(currentUsers || 0, previousUsers || 0),
        newItems: currentItems || 0,
        newItemsChange: calculatePercentChange(currentItems || 0, previousItems || 0),
        matches: currentMatches || 0,
        matchesChange: calculatePercentChange(currentMatches || 0, previousMatches || 0),
        disputes: currentDisputes || 0,
        disputesChange: calculatePercentChange(currentDisputes || 0, previousDisputes || 0)
      });
      
      console.log('Metrics updated from Supabase:', metrics);
      
    } catch (error) {
      console.error('Failed to fetch metrics from Supabase', error);
    }
  };

  // New function to fetch performance data directly from Supabase
  const fetchPerformanceDataFromSupabase = async () => {
    try {
      // Calculate date range based on selected timeframe
      const now = new Date();
      let startDate: Date;
      let format: string;
      let points: number;
      
      if (selectedTimeframe === 'day') {
        startDate = new Date(now);
        startDate.setHours(0, 0, 0, 0);
        startDate.setDate(startDate.getDate() - 1); // Last 24 hours
        format = 'hour';
        points = 24;
      } else if (selectedTimeframe === 'week') {
        startDate = new Date(now);
        startDate.setDate(startDate.getDate() - 7);
        format = 'day';
        points = 7;
      } else { // month
        startDate = new Date(now);
        startDate.setDate(startDate.getDate() - 30);
        format = 'day';
        points = 30;
      }
      
      console.log(`[AdminDashboard] Fetching performance data from ${startDate.toISOString()} to ${now.toISOString()}`);
      
      // Query the system_performance table or equivalent
      const { data, error } = await supabase
        .from('system_performance')
        .select('*')
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: true });
        
      if (error) {
        throw error;
      }
      
      if (!data || data.length === 0) {
        console.log('[AdminDashboard] No performance data found, generating sample data');
        // Generate sample data if no data is available
        const sampleData: PerformanceDataPoint[] = [];
        const baseDate = new Date(startDate);
        
        for (let i = 0; i < points; i++) {
          let date: string;
          
          if (format === 'hour') {
            baseDate.setHours(baseDate.getHours() + 1);
            date = baseDate.toISOString().split('T')[0] + ' ' + 
                  baseDate.toTimeString().split(' ')[0].split(':').slice(0, 2).join(':');
          } else {
            baseDate.setDate(baseDate.getDate() + 1);
            date = baseDate.toISOString().split('T')[0];
          }
          
          sampleData.push({
            date,
            responseTime: Math.round(100 + Math.random() * 900), // 100-1000ms
            requestCount: Math.round(10 + Math.random() * 90),  // 10-100 requests
            successRate: 80 + Math.random() * 20, // 80-100% success rate
          });
        }
        
        setPerformanceData(sampleData);
        return;
      }
      
      // Process the data into the format needed for the chart
      const chartData: PerformanceDataPoint[] = data.map(item => ({
        date: format === 'hour' 
          ? new Date(item.created_at).toISOString().split('T')[0] + ' ' + 
            new Date(item.created_at).toTimeString().split(' ')[0].split(':').slice(0, 2).join(':')
          : new Date(item.created_at).toISOString().split('T')[0],
        responseTime: item.average_response_time || 0,
        requestCount: item.total_requests || 0,
        successRate: item.success_rate || 95, // Default to 95% if not available
      }));
      
      // Aggregate data if we have more points than needed
      if (chartData.length > points) {
        console.log(`[AdminDashboard] Aggregating ${chartData.length} points to ${points} points`);
        
        // Group by date
        const groupedData: Record<string, PerformanceDataPoint[]> = {};
        chartData.forEach(point => {
          if (!groupedData[point.date]) {
            groupedData[point.date] = [];
          }
          groupedData[point.date].push(point);
        });
        
        // Calculate averages for each group
        const aggregatedData: PerformanceDataPoint[] = Object.keys(groupedData).map(date => {
          const points = groupedData[date];
          return {
            date,
            responseTime: Math.round(points.reduce((sum, p) => sum + p.responseTime, 0) / points.length),
            requestCount: Math.round(points.reduce((sum, p) => sum + p.requestCount, 0) / points.length),
            successRate: Math.round(points.reduce((sum, p) => sum + p.successRate, 0) / points.length),
          };
        });
        
        // Sort by date and limit to the number of points we want
        const sortedData = aggregatedData
          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
          .slice(-points);
          
        setPerformanceData(sortedData);
      } else {
        setPerformanceData(chartData);
      }
      
      console.log(`[AdminDashboard] Loaded ${performanceData.length} performance data points`);
      
    } catch (error) {
      console.error('Failed to fetch performance data from Supabase', error);
      // Generate fallback data on error
      setPerformanceData([
        { date: '2023-05-01', responseTime: 300, requestCount: 45, successRate: 98 },
        { date: '2023-05-02', responseTime: 350, requestCount: 50, successRate: 97 },
        { date: '2023-05-03', responseTime: 280, requestCount: 55, successRate: 99 },
        { date: '2023-05-04', responseTime: 400, requestCount: 60, successRate: 95 },
        { date: '2023-05-05', responseTime: 320, requestCount: 48, successRate: 96 },
        { date: '2023-05-06', responseTime: 290, requestCount: 52, successRate: 98 },
        { date: '2023-05-07', responseTime: 310, requestCount: 58, successRate: 97 },
      ]);
    }
  };

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
    fetchMetricsFromSupabase();
    fetchPerformanceDataFromSupabase();
  };

  const toggleWidget = (widgetId: WidgetType) => {
    if (activeWidgets.includes(widgetId)) {
      setActiveWidgets(activeWidgets.filter(id => id !== widgetId));
    } else {
      setActiveWidgets([...activeWidgets, widgetId]);
    }
  };

  // Helper to map backend performanceData to chart-kit format
  const getPerformanceChartData = () => {
    if (!performanceData || performanceData.length === 0) {
      return { labels: [], datasets: [{ data: [] }] };
    }
    
    return {
      labels: performanceData.map(d => d.date),
      datasets: [
        {
          data: performanceData.map(d => d[selectedMetricType]),
        },
      ],
    };
  };

  // Helper to get title and units for the current metric
  const getMetricInfo = () => {
    switch (selectedMetricType) {
      case 'responseTime':
        return { title: 'Response Time', unit: 'ms' };
      case 'requestCount':
        return { title: 'Request Count', unit: 'requests' };
      case 'successRate':
        return { title: 'Success Rate', unit: '%' };
      default:
        return { title: 'Response Time', unit: 'ms' };
    }
  };

  console.log('Performance chart data:', getPerformanceChartData());

  const getMetricsData = () => [
    {
      title: 'Total Users',
      value: metrics.activeUsers,
      change: metrics.activeUsersChange,
      icon: 'people-outline' as keyof typeof Ionicons.glyphMap,
      color: '#4CAF50',
    },
    {
      title: 'Active Items',
      value: metrics.newItems,
      change: metrics.newItemsChange,
      icon: 'cube-outline' as keyof typeof Ionicons.glyphMap,
      color: '#2196F3',
    },
    {
      title: 'Matches Made',
      value: metrics.matches,
      change: metrics.matchesChange,
      icon: 'git-network-outline' as keyof typeof Ionicons.glyphMap,
      color: '#9C27B0',
    },
    {
      title: 'Open Disputes',
      value: metrics.disputes,
      change: metrics.disputesChange,
      icon: 'warning-outline' as keyof typeof Ionicons.glyphMap,
      color: '#FF9800',
    },
  ];

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
      <AdminHeader title="Dashboard" navigation={navigation} />
      <ScrollView
        style={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
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
          {getMetricsData().map((metric, index) => (
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
          </View>
          
          {/* Add metric type selector */}
          <View style={{ flexDirection: 'row', marginBottom: 16, borderRadius: 8, backgroundColor: colors.background, padding: 4 }}>
            {[
              { label: 'Response Time', value: 'responseTime' },
              { label: 'Request Count', value: 'requestCount' },
              { label: 'Success Rate', value: 'successRate' }
            ].map((metric) => (
              <TouchableOpacity
                key={metric.value}
                style={{
                  flex: 1,
                  paddingVertical: 8,
                  paddingHorizontal: 4,
                  alignItems: 'center',
                  backgroundColor: selectedMetricType === metric.value ? colors.primary : 'transparent',
                  borderRadius: 6,
                }}
                onPress={() => setSelectedMetricType(metric.value as 'responseTime' | 'requestCount' | 'successRate')}
              >
                <Text
                  style={{
                    color: selectedMetricType === metric.value ? '#FFF' : colors.text,
                    fontWeight: '600',
                    fontSize: 12,
                  }}
                >
                  {metric.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          
          {/* Render chart with the fetched performance data */}
          <PerformanceChart data={getPerformanceChartData()} />
          
          {/* Add a legend or stats summary */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 16 }}>
            {performanceData.length > 0 && (
              <>
                <View>
                  <Text style={{ color: colors.secondary, fontSize: 12 }}>Average</Text>
                  <Text style={{ color: colors.text, fontWeight: 'bold' }}>
                    {Math.round(performanceData.reduce((sum, d) => sum + d[selectedMetricType], 0) / performanceData.length)} {getMetricInfo().unit}
                  </Text>
                </View>
                <View>
                  <Text style={{ color: colors.secondary, fontSize: 12 }}>Min</Text>
                  <Text style={{ color: colors.text, fontWeight: 'bold' }}>
                    {Math.min(...performanceData.map(d => d[selectedMetricType]))} {getMetricInfo().unit}
                  </Text>
                </View>
                <View>
                  <Text style={{ color: colors.secondary, fontSize: 12 }}>Max</Text>
                  <Text style={{ color: colors.text, fontWeight: 'bold' }}>
                    {Math.max(...performanceData.map(d => d[selectedMetricType]))} {getMetricInfo().unit}
                  </Text>
                </View>
              </>
            )}
          </View>
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
                onPress={() => {
                  console.log('[DEBUG] Opening Content Moderation via drawer');
                  navigation.jumpTo('ContentModeration');
                }}
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
                onPress={() => {
                  console.log('[DEBUG] Opening Dispute Resolution via drawer');
                  navigation.jumpTo('DisputeResolution');
                }}
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
