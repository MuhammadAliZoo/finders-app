import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';

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

  const handleGenerateReport = () => {
    // TODO: Implement report generation
    console.log('Generating report:', {
      reportType: selectedReport,
      dateRange,
      email,
    });
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
              <Text style={[styles.reportName, { color: colors.text }]}>
                {report.name}
              </Text>
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
        style={[styles.generateButton, { backgroundColor: colors.primary }]}
        onPress={handleGenerateReport}
        disabled={!selectedReport || !dateRange.startDate || !dateRange.endDate || !email}
      >
        <Text style={styles.generateButtonText}>Generate Report</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  reportType: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
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
  reportDescription: {
    fontSize: 14,
  },
  dateInputs: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dateInput: {
    flex: 1,
    marginRight: 8,
  },
  label: {
    fontSize: 14,
    marginBottom: 8,
  },
  input: {
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
  },
  generateButton: {
    margin: 20,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  generateButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default GenerateReportScreen; 