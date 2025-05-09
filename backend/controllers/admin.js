import User from '../models/User.js';
import Item from '../models/Item.js';
import Dispute from '../models/Dispute.js';
import ModerationRule from '../models/ModerationRule.js';
import asyncHandler from 'express-async-handler';
import { Parser } from 'json2csv';
import PDFDocument from 'pdfkit';
import { supabaseClient } from '../lib/supabase.js';
import SystemPerformance from '../models/SystemPerformance.js';

// @desc    Get dashboard data
// @route   GET /api/admin/dashboard
// @access  Private (Admin only)
export const getDashboardData = asyncHandler(async (req, res) => {
  const { timeframe = 'week' } = req.query;

  let startDate;
  const now = new Date();

  switch (timeframe) {
    case 'day':
      startDate = new Date(now.setDate(now.getDate() - 1));
      break;
    case 'week':
      startDate = new Date(now.setDate(now.getDate() - 7));
      break;
    case 'month':
      startDate = new Date(now.setMonth(now.getMonth() - 1));
      break;
    default:
      startDate = new Date(now.setDate(now.getDate() - 7));
  }

  // Get metrics
  const metrics = await getMetrics(startDate);

  // Get performance data
  const performanceData = await getPerformanceData(startDate);

  // Get heatmap data
  const heatmapData = await getHeatmapData(startDate);

  // Get priority cases
  const priorityCases = await getPriorityCases();

  // Get recent activity
  const recentActivity = await getRecentActivity();

  // Get pending approvals
  const pendingApprovals = await getPendingApprovals();

  // Get critical issues
  const criticalIssues = await getCriticalIssues();

  // Get admin performance
  const adminPerformance = await getAdminPerformance(req.user.id);

  res.json({
    metrics,
    performanceData,
    heatmapData,
    priorityCases,
    recentActivity,
    pendingApprovals,
    criticalIssues,
    adminPerformance,
  });
});

// Helper function to get metrics
const getMetrics = async startDate => {
  const activeUsers = await User.countDocuments({
    updatedAt: { $gte: startDate },
  });

  const previousStartDate = new Date(startDate);
  previousStartDate.setDate(
    previousStartDate.getDate() - (startDate.getDate() - new Date().getDate()),
  );

  const previousActiveUsers = await User.countDocuments({
    updatedAt: { $gte: previousStartDate, $lt: startDate },
  });

  const activeUsersChange =
    previousActiveUsers === 0
      ? 100
      : Math.round(((activeUsers - previousActiveUsers) / previousActiveUsers) * 100);

  const newItems = await Item.countDocuments({
    createdAt: { $gte: startDate },
  });

  const previousNewItems = await Item.countDocuments({
    createdAt: { $gte: previousStartDate, $lt: startDate },
  });

  const newItemsChange =
    previousNewItems === 0
      ? 100
      : Math.round(((newItems - previousNewItems) / previousNewItems) * 100);

  const matches = await Item.countDocuments({
    status: 'matched',
    moderatedAt: { $gte: startDate },
  });

  const previousMatches = await Item.countDocuments({
    status: 'matched',
    moderatedAt: { $gte: previousStartDate, $lt: startDate },
  });

  const matchesChange =
    previousMatches === 0 ? 100 : Math.round(((matches - previousMatches) / previousMatches) * 100);

  const disputes = await Dispute.countDocuments({
    createdAt: { $gte: startDate },
  });

  const previousDisputes = await Dispute.countDocuments({
    createdAt: { $gte: previousStartDate, $lt: startDate },
  });

  const disputesChange =
    previousDisputes === 0
      ? 0
      : Math.round(((disputes - previousDisputes) / previousDisputes) * 100);

  return {
    activeUsers,
    activeUsersChange,
    newItems,
    newItemsChange,
    matches,
    matchesChange,
    disputes,
    disputesChange,
  };
};

// Helper function to get performance data
const getPerformanceData = async startDate => {
  // This would typically come from AdminMetrics collection
  // For now, returning mock data
  return [
    { date: '2023-01-01', responseTime: 45, resolutionRate: 78 },
    { date: '2023-01-02', responseTime: 42, resolutionRate: 80 },
    { date: '2023-01-03', responseTime: 38, resolutionRate: 82 },
    { date: '2023-01-04', responseTime: 35, resolutionRate: 85 },
    { date: '2023-01-05', responseTime: 30, resolutionRate: 88 },
    { date: '2023-01-06', responseTime: 28, resolutionRate: 90 },
    { date: '2023-01-07', responseTime: 25, resolutionRate: 92 },
  ];
};

// Helper function to get heatmap data
const getHeatmapData = async startDate => {
  // This would typically be aggregated from Item collection
  // For now, returning mock data
  return [
    { lat: 37.7749, lng: -122.4194, weight: 10 },
    { lat: 37.7848, lng: -122.4294, weight: 8 },
    { lat: 37.7647, lng: -122.4094, weight: 15 },
    { lat: 37.7949, lng: -122.3994, weight: 12 },
    { lat: 37.7549, lng: -122.4394, weight: 5 },
  ];
};

// Helper function to get priority cases
const getPriorityCases = async () => {
  // Get high priority disputes
  const disputes = await Dispute.find({ priority: 'high', status: { $ne: 'resolved' } })
    .sort({ createdAt: -1 })
    .limit(3)
    .populate('item', 'title')
    .lean();

  // Get flagged items
  const items = await Item.find({ status: 'flagged' }).sort({ createdAt: -1 }).limit(3).lean();

  // Format and combine the results
  const priorityCases = [
    ...disputes.map(dispute => ({
      id: dispute._id,
      title: `Disputed: ${dispute.item?.title || 'Unknown item'}`,
      type: 'dispute',
      priority: dispute.priority,
      timeAgo: getTimeAgo(dispute.createdAt),
      aiReason: dispute.reason.substring(0, 50) + '...',
    })),
    ...items.map(item => ({
      id: item._id,
      title: item.title,
      type: 'moderation',
      priority: 'high',
      timeAgo: getTimeAgo(item.createdAt),
      aiReason: item.moderationNotes || 'Flagged for review',
    })),
  ];

  // Sort by priority and time
  priorityCases.sort((a, b) => {
    if (a.priority === b.priority) {
      return new Date(b.timeAgo) - new Date(a.timeAgo);
    }
    return a.priority === 'high' ? -1 : 1;
  });

  return priorityCases.slice(0, 5);
};

// Helper function to get recent activity
const getRecentActivity = async () => {
  // This would typically be a combination of recent actions
  // For now, returning mock data
  return [
    { id: 1, action: 'Item approved', user: 'Admin', time: '5 minutes ago' },
    { id: 2, action: 'Dispute resolved', user: 'Admin', time: '1 hour ago' },
    { id: 3, action: 'New item submitted', user: 'User123', time: '2 hours ago' },
    { id: 4, action: 'Match confirmed', user: 'System', time: '3 hours ago' },
  ];
};

// Helper function to get pending approvals
const getPendingApprovals = async () => {
  const pendingItems = await Item.find({ status: 'pending' })
    .sort({ createdAt: 1 })
    .limit(5)
    .lean();

  return pendingItems.map(item => ({
    id: item._id,
    title: item.title,
    type: item.itemType,
    time: getTimeAgo(item.createdAt),
  }));
};

// Helper function to get critical issues
const getCriticalIssues = async () => {
  // This would typically be issues that need immediate attention
  // For now, returning mock data
  return [
    { id: 1, title: 'System performance degradation', severity: 'high', time: '10 minutes ago' },
    { id: 2, title: 'Multiple failed login attempts', severity: 'medium', time: '1 hour ago' },
    { id: 3, title: 'Storage capacity warning', severity: 'low', time: '5 hours ago' },
  ];
};

// Helper function to get admin performance
const getAdminPerformance = async adminId => {
  // This would typically come from tracking admin actions
  // For now, returning mock data
  return {
    responseTime: '28 min avg',
    resolutionRate: '92%',
    userSatisfaction: '4.8/5',
    itemsModerated: 152,
    disputesResolved: 37,
  };
};

// Helper function to format time ago
const getTimeAgo = date => {
  const now = new Date();
  const diffMs = now - new Date(date);
  const diffMins = Math.round(diffMs / 60000);

  if (diffMins < 60) {
    return `${diffMins}m ago`;
  } else if (diffMins < 1440) {
    return `${Math.round(diffMins / 60)}h ago`;
  } else {
    return `${Math.round(diffMins / 1440)}d ago`;
  }
};

// @desc    Get items for moderation
// @route   GET /api/admin/moderation/items
// @access  Private (Admin only)
export const getItemsForModeration = asyncHandler(async (req, res) => {
  const { status = 'all', sortBy = 'date' } = req.query;

  const query = {};

  if (status !== 'all') {
    query.status = status;
  } else {
    query.status = { $in: ['pending', 'flagged'] };
  }

  let sort = {};

  switch (sortBy) {
    case 'date':
      sort = { createdAt: -1 };
      break;
    case 'priority':
      // This would require some logic to determine priority
      sort = { createdAt: -1 }; // Fallback to date
      break;
    case 'rating':
      // This would require user ratings
      sort = { createdAt: -1 }; // Fallback to date
      break;
    default:
      sort = { createdAt: -1 };
  }

  const items = await Item.find(query).sort(sort).populate('user', 'name email').lean();

  res.json(items);
});

// @desc    Get moderation rules
// @route   GET /api/admin/moderation/rules
// @access  Private (Admin only)
export const getModerationRules = asyncHandler(async (req, res) => {
  const rules = await ModerationRule.find()
    .sort({ priority: -1 })
    .populate('createdBy', 'name')
    .populate('updatedBy', 'name')
    .lean();

  res.json(rules);
});

// @desc    Create moderation rule
// @route   POST /api/admin/moderation/rules
// @access  Private (Admin only)
export const createModerationRule = asyncHandler(async (req, res) => {
  const { name, description, criteria, action, priority } = req.body;

  const ruleExists = await ModerationRule.findOne({ name });

  if (ruleExists) {
    res.status(400);
    throw new Error('Rule with this name already exists');
  }

  const rule = await ModerationRule.create({
    name,
    description,
    criteria,
    action,
    priority: priority || 1,
    createdBy: req.user.id,
  });

  res.status(201).json(rule);
});

// @desc    Update moderation rule
// @route   PUT /api/admin/moderation/rules/:id
// @access  Private (Admin only)
export const updateModerationRule = asyncHandler(async (req, res) => {
  const rule = await ModerationRule.findById(req.params.id);

  if (!rule) {
    res.status(404);
    throw new Error('Rule not found');
  }

  rule.name = req.body.name || rule.name;
  rule.description = req.body.description || rule.description;
  rule.criteria = req.body.criteria || rule.criteria;
  rule.action = req.body.action || rule.action;
  rule.priority = req.body.priority || rule.priority;
  rule.active = req.body.active !== undefined ? req.body.active : rule.active;
  rule.updatedBy = req.user.id;

  const updatedRule = await rule.save();

  res.json(updatedRule);
});

// @desc    Batch moderate items
// @route   POST /api/admin/moderation/batch
// @access  Private (Admin only)
export const batchModerateItems = asyncHandler(async (req, res) => {
  const { itemIds, action } = req.body;

  if (!itemIds || !Array.isArray(itemIds) || itemIds.length === 0) {
    res.status(400);
    throw new Error('No items provided');
  }

  if (!['approve', 'reject', 'flag'].includes(action)) {
    res.status(400);
    throw new Error('Invalid action');
  }

  const statusMap = {
    approve: 'approved',
    reject: 'rejected',
    flag: 'flagged',
  };

  const result = await Item.updateMany(
    { _id: { $in: itemIds } },
    {
      $set: {
        status: statusMap[action],
        moderatedBy: req.user.id,
        moderatedAt: Date.now(),
      },
    },
  );

  res.json({
    message: `${result.nModified} items updated successfully`,
    modifiedCount: result.nModified,
  });
});

// @desc    Get disputes
// @route   GET /api/admin/disputes
// @access  Private (Admin only)
export const getDisputes = asyncHandler(async (req, res) => {
  const { status = 'all', sortBy = 'date' } = req.query;

  const query = {};

  if (status !== 'all') {
    query.status = status;
  }

  let sort = {};

  switch (sortBy) {
    case 'date':
      sort = { createdAt: -1 };
      break;
    case 'priority':
      sort = { priority: -1, createdAt: -1 };
      break;
    case 'response_time':
      // This would require tracking response times
      sort = { createdAt: -1 }; // Fallback to date
      break;
    default:
      sort = { createdAt: -1 };
  }

  const disputes = await Dispute.find(query)
    .sort(sort)
    .populate('item', 'title')
    .populate('requester', 'name')
    .populate('finder', 'name')
    .populate('assignedTo', 'name')
    .lean();

  res.json(disputes);
});

// @desc    Get dispute by ID
// @route   GET /api/admin/disputes/:id
// @access  Private (Admin only)
export const getDisputeById = asyncHandler(async (req, res) => {
  const dispute = await Dispute.findById(req.params.id)
    .populate('item', 'title description images category location date')
    .populate('requester', 'name email profileImage')
    .populate('finder', 'name email profileImage')
    .populate('assignedTo', 'name email profileImage')
    .populate('timeline.performedBy', 'name')
    .populate('documents.uploadedBy', 'name')
    .lean();

  if (!dispute) {
    res.status(404);
    throw new Error('Dispute not found');
  }

  res.json(dispute);
});

// @desc    Update dispute status
// @route   PUT /api/admin/disputes/:id/status
// @access  Private (Admin only)
export const updateDisputeStatus = asyncHandler(async (req, res) => {
  const { status, notes } = req.body;

  if (!['open', 'in_progress', 'escalated', 'resolved', 'closed'].includes(status)) {
    res.status(400);
    throw new Error('Invalid status');
  }

  const dispute = await Dispute.findById(req.params.id);

  if (!dispute) {
    res.status(404);
    throw new Error('Dispute not found');
  }

  dispute.status = status;

  // Add to timeline
  dispute.timeline.push({
    action: `Status changed to ${status}`,
    performedBy: req.user.id,
    notes: notes || '',
  });

  // If status is in_progress and not assigned, assign to current admin
  if (status === 'in_progress' && !dispute.assignedTo) {
    dispute.assignedTo = req.user.id;
  }

  const updatedDispute = await dispute.save();

  res.json(updatedDispute);
});

// @desc    Get AI recommendation for dispute
// @route   GET /api/admin/disputes/:id/ai-recommendation
// @access  Private (Admin only)
export const getAIRecommendation = asyncHandler(async (req, res) => {
  const dispute = await Dispute.findById(req.params.id).populate('item').lean();

  if (!dispute) {
    res.status(404);
    throw new Error('Dispute not found');
  }

  // This would typically call an AI service
  // For now, returning mock data
  const recommendation = {
    summary: 'Based on the evidence provided, this appears to be a legitimate claim.',
    confidence: 85,
    reasoning: [
      'Timestamp of the lost report predates the found report by only 2 hours',
      'Location data shows both reports within 0.5 miles of each other',
      'Item descriptions match with 92% similarity',
      'Photos provided by both parties show the same distinctive marks',
    ],
    suggestedAction: 'Approve the match and facilitate return',
    additionalNotes:
      'Consider requesting additional verification due to the high value of the item.',
  };

  res.json(recommendation);
});

// @desc    Generate report
// @route   POST /api/admin/reports
// @access  Private (Admin only)
export const generateReport = asyncHandler(async (req, res) => {
  const { type, filters } = req.body;
  const format = req.query.format;

  let report = {};

  switch (type) {
    case 'users':
      report = await generateUserReport(filters);
      break;
    case 'items':
      report = await generateItemReport(filters);
      break;
    case 'matches':
      report = await generateMatchReport(filters);
      break;
    case 'disputes':
      report = await generateDisputeReport(filters);
      break;
    case 'system_performance':
      report = await generateSystemPerformanceReport(filters);
      break;
    default:
      res.status(400);
      throw new Error('Invalid report type');
  }

  if (format === 'csv') {
    // Convert report.details (or another array) to CSV
    const details = report.details || [];
    if (!Array.isArray(details) || details.length === 0) {
      return res.status(400).json({ message: 'No data available for CSV export.' });
    }
    const fields = Object.keys(details[0]);
    const json2csvParser = new Parser({ fields });
    const csv = json2csvParser.parse(details);
    res.header('Content-Type', 'text/csv');
    res.attachment(`${report.title.replace(/ /g, '_')}_${Date.now()}.csv`);
    return res.send(csv);
  }

  if (format === 'pdf') {
    // Generate a simple PDF report
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${report.title.replace(/ /g, '_')}_${Date.now()}.pdf"`);
    const doc = new PDFDocument();
    doc.pipe(res);
    doc.fontSize(20).text(report.title, { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`Generated At: ${new Date(report.generatedAt).toLocaleString()}`);
    doc.moveDown();
    if (report.summary) {
      doc.fontSize(14).text('Summary:', { underline: true });
      Object.entries(report.summary).forEach(([key, value]) => {
        doc.text(`${key}: ${value}`);
      });
      doc.moveDown();
    }
    if (Array.isArray(report.details) && report.details.length > 0) {
      doc.fontSize(14).text('Details:', { underline: true });
      const fields = Object.keys(report.details[0]);
      // Table header
      doc.font('Helvetica-Bold');
      fields.forEach(field => doc.text(field, { continued: true, width: 100 }));
      doc.text('');
      doc.font('Helvetica');
      // Table rows
      report.details.forEach(row => {
        fields.forEach(field => doc.text(String(row[field]), { continued: true, width: 100 }));
        doc.text('');
      });
    } else {
      doc.text('No details available.');
    }
    doc.end();
    return;
  }

  res.json(report);
});

// Helper function to generate user report
const generateUserReport = async filters => {
  // Fetch users from Supabase instead of MongoDB
  const { data: users, error } = await supabaseClient.from('users').select('*');
  if (error) {
    throw new Error('Failed to fetch users from Supabase: ' + error.message);
  }
  return {
    title: 'User Activity Report',
    generatedAt: new Date(),
    summary: {
      totalUsers: users.length,
      activeUsers: users.filter(u => u.status === 'online').length,
      newUsers: users.filter(u => {
        const created = new Date(u.created_at);
        const now = new Date();
        return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear();
      }).length,
      // You can add more summary stats as needed
    },
    charts: [],
    details: users.map(u => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      createdAt: u.created_at,
      lastSeen: u.last_seen,
      status: u.status,
    })),
  };
};

// Helper function to generate item report
const generateItemReport = async filters => {
  // Fetch items from Supabase instead of returning mock data
  const { data: items, error } = await supabaseClient.from('items').select('*');
  if (error) {
    throw new Error('Failed to fetch items from Supabase: ' + error.message);
  }
  return {
    title: 'Item Activity Report',
    generatedAt: new Date(),
    summary: {
      totalItems: items.length,
      lostItems: items.filter(item => item.status === 'lost').length,
      foundItems: items.filter(item => item.status === 'found').length,
      matchRate: '35%', // This can be calculated based on your logic
    },
    charts: [
      { type: 'bar', title: 'Items by Category', data: {} },
      { type: 'line', title: 'Items Over Time', data: {} },
    ],
    details: items.map(item => ({
      id: item.id,
      title: item.title,
      status: item.status,
      createdAt: item.created_at,
    })),
  };
};

// Helper function to generate match report
const generateMatchReport = async filters => {
  // This would typically generate a detailed match report
  // For now, returning mock data
  return {
    title: 'Match Success Report',
    generatedAt: new Date(),
    summary: {
      totalMatches: 875,
      successfulReturns: 750,
      averageTimeToMatch: '3.5 days',
      matchAccuracyRate: '92%',
    },
    charts: [
      { type: 'line', title: 'Match Rate Over Time', data: {} },
      { type: 'pie', title: 'Match Success by Category', data: {} },
    ],
    details: [],
  };
};

// Helper function to generate dispute report
const generateDisputeReport = async filters => {
  // Fetch disputes from MongoDB instead of Supabase
  const disputes = await Dispute.find({}).lean();
  return {
    title: 'Dispute Resolution Report',
    generatedAt: new Date(),
    summary: {
      totalDisputes: disputes.length,
      resolvedDisputes: disputes.filter(dispute => dispute.status === 'resolved').length,
      averageResolutionTime: '2.3 days', // This can be calculated based on your logic
      satisfactionRate: '85%', // This can be calculated based on your logic
    },
    charts: [
      { type: 'bar', title: 'Disputes by Category', data: {} },
      { type: 'line', title: 'Resolution Time Trend', data: {} },
    ],
    details: disputes.map(dispute => ({
      id: dispute._id,
      title: dispute.title,
      status: dispute.status,
      createdAt: dispute.createdAt,
    })),
  };
};

// Helper function to generate system performance report
const generateSystemPerformanceReport = async filters => {
  // Fetch system performance data from MongoDB instead of returning mock data
  const performanceData = await SystemPerformance.find({}).lean();
  return {
    title: 'System Performance Report',
    generatedAt: new Date(),
    summary: {
      totalRequests: performanceData.reduce((sum, data) => sum + data.totalRequests, 0),
      averageResponseTime: performanceData.reduce((sum, data) => sum + data.averageResponseTime, 0) / performanceData.length,
      uptime: '99.9%', // This can be calculated based on your logic
    },
    charts: [
      { type: 'line', title: 'Response Time Over Time', data: {} },
      { type: 'bar', title: 'Requests by Endpoint', data: {} },
    ],
    details: performanceData.map(data => ({
      id: data._id,
      totalRequests: data.totalRequests,
      averageResponseTime: data.averageResponseTime,
      createdAt: data.createdAt,
    })),
  };
};
