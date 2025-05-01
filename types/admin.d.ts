import { Ionicons } from "@expo/vector-icons"

export interface MetricData {
  title: string;
  value: number;
  change: number;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
}

export interface AdminMetrics {
  activeUsers: number;
  activeUsersChange: number;
  newItems: number;
  newItemsChange: number;
  matches: number;
  matchesChange: number;
  disputes: number;
  disputesChange: number;
}

export interface AdminNotification {
  id: string;
  message: string;
  timestamp: Date;
  type: 'info' | 'warning' | 'error' | 'success';
  read: boolean;
}

export interface PerformanceData {
  labels: string[];
  datasets: Array<{
    data: number[];
    color?: string;
    strokeWidth?: number;
  }>;
}

export interface PriorityCase {
  id: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  status: 'open' | 'in_progress' | 'resolved';
  createdAt: Date;
  updatedAt: Date;
  assignedTo?: string;
  type: string;
  timeAgo: string;
  aiReason: string;
}

export interface AdminActivity {
  id: string;
  action: string;
  performedBy: string;
  timestamp: Date;
  details: Record<string, any>;
}

export interface PendingApproval {
  id: string;
  type: 'user' | 'item' | 'report';
  requestedBy: string;
  timestamp: Date;
  status: 'pending' | 'approved' | 'rejected';
  data: Record<string, any>;
}

export interface CriticalIssue {
  id: string;
  title: string;
  description: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  status: 'open' | 'in_progress' | 'resolved';
  createdAt: Date;
  updatedAt: Date;
}

export interface AdminPerformance {
  responseTime: number;
  resolutionRate: number;
  satisfactionScore: number;
  activeTickets: number;
}

export interface DashboardData {
  metrics: AdminMetrics;
  notifications?: AdminNotification[];
  performanceData: PerformanceData;
  heatmapData: any[];
  priorityCases: PriorityCase[];
  recentActivity: AdminActivity[];
  pendingApprovals: PendingApproval[];
  criticalIssues: CriticalIssue[];
  adminPerformance: AdminPerformance;
} 