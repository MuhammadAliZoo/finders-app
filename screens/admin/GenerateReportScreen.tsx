import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Alert, Linking } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { adminApi } from '../../api/admin';
import Constants from 'expo-constants';

interface ReportType {
  id: string;
  name: string;
  description: string;
}

const reportTypes: ReportType[] = [
  {
    id: '1',
    name: 'User Activity Report',
    description: 'Detailed report of user activities and interactions',
  },
  {
    id: '2',
    name: 'Item Statistics',
    description: 'Statistics about found and claimed items',
  },
  {
    id: '3',
    name: 'Dispute Analysis',
    description: 'Analysis of disputes and their resolutions',
  },
  {
    id: '4',
    name: 'System Performance',
    description: 'System performance metrics and analytics',
  },
];

const GenerateReportScreen = () => {
  const { colors } = useTheme();
  const [selectedReport, setSelectedReport] = useState<string>('');
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: '',
  });
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGenerateReport = async () => {
    setLoading(true);
    try {
      const filters = { startDate: dateRange.startDate, endDate: dateRange.endDate, email };
      await adminApi.generateReport(selectedReport, filters);
      Alert.alert('Success', 'Report generation requested. You will receive it by email.');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to generate report.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (format: 'csv' | 'pdf') => {
    try {
      // Build the download URL
      const apiUrl = Constants.expoConfig?.extra?.EXPO_PUBLIC_API_URL || process.env.EXPO_PUBLIC_API_URL;
      const url = `${apiUrl}/api/admin/reports?format=${format}`;
      const body = JSON.stringify({
        type: selectedReport,
        filters: { startDate: dateRange.startDate, endDate: dateRange.endDate, email },
      });
      // Open the download URL in the browser (will prompt for download)
      // Note: This works best if the user is already authenticated in the browser
      // For a more robust solution, use a file downloader library and attach the auth token
      Linking.openURL(url);
    } catch (error: any) {
      Alert.alert('Error', error.message || `Failed to download ${format.toUpperCase()} report.`);
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Generate Report</Text>
        <Text style={[styles.subtitle, { color: colors.secondary }]}>
          Select report type and parameters
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Report Type</Text>
        {reportTypes.map(report => (
          <TouchableOpacity
            key={report.id}
            style={[
              styles.reportType,
              { backgroundColor: colors.card },
              selectedReport === report.id && { borderColor: colors.primary, borderWidth: 2 },
            ]}
            onPress={() => setSelectedReport(report.id)}
          >
            <View style={styles.reportInfo}>
              <Text style={[styles.reportName, { color: colors.text }]}>{report.name}</Text>
              <Text style={[styles.reportDescription, { color: colors.secondary }]}>
                {report.description}
              </Text>
            </View>
            {selectedReport === report.id && (
              <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
            )}
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Date Range</Text>
        <View style={styles.dateInputs}>
          <View style={styles.dateInput}>
            <Text style={[styles.label, { color: colors.text }]}>Start Date</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.card, color: colors.text }]}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={colors.secondary}
              value={dateRange.startDate}
              onChangeText={text => setDateRange({ ...dateRange, startDate: text })}
            />
          </View>
          <View style={styles.dateInput}>
            <Text style={[styles.label, { color: colors.text }]}>End Date</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.card, color: colors.text }]}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={colors.secondary}
              value={dateRange.endDate}
              onChangeText={text => setDateRange({ ...dateRange, endDate: text })}
            />
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Email Address</Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.card, color: colors.text }]}
          placeholder="Enter email to receive report"
          placeholderTextColor={colors.secondary}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
        />
      </View>

      <TouchableOpacity
        style={[styles.generateButton, { backgroundColor: colors.primary, opacity: loading ? 0.7 : 1 }]}
        onPress={handleGenerateReport}
        disabled={!selectedReport || !dateRange.startDate || !dateRange.endDate || !email || loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
        <Text style={styles.generateButtonText}>Generate Report</Text>
        )}
      </TouchableOpacity>
      <View style={{ flexDirection: 'row', justifyContent: 'center', marginBottom: 24 }}>
        <TouchableOpacity
          style={[styles.generateButton, { backgroundColor: colors.success, marginRight: 8 }]}
          onPress={() => handleDownload('csv')}
          disabled={!selectedReport || !dateRange.startDate || !dateRange.endDate || !email}
        >
          <Text style={styles.generateButtonText}>Download as CSV</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.generateButton, { backgroundColor: colors.error }]}
          onPress={() => handleDownload('pdf')}
          disabled={!selectedReport || !dateRange.startDate || !dateRange.endDate || !email}
        >
          <Text style={styles.generateButtonText}>Download as PDF</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  dateInput: {
    flex: 1,
    marginRight: 8,
  },
  dateInputs: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  generateButton: {
    alignItems: 'center',
    borderRadius: 12,
    margin: 20,
    padding: 16,
  },
  generateButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    borderBottomColor: '#eee',
    borderBottomWidth: 1,
    padding: 20,
  },
  input: {
    borderRadius: 8,
    fontSize: 16,
    padding: 12,
  },
  label: {
    fontSize: 14,
    marginBottom: 8,
  },
  reportDescription: {
    fontSize: 14,
  },
  reportInfo: {
    flex: 1,
    marginRight: 16,
  },
  reportName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  reportType: {
    alignItems: 'center',
    borderRadius: 12,
    elevation: 2,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
});

export default GenerateReportScreen;
