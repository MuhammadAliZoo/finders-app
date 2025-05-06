'use client';
import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

type PerformanceChartProps = {
  data: {
    labels: string[];
    datasets: {
      data: number[];
    }[];
  };
};

const PerformanceChart: React.FC<PerformanceChartProps> = ({ data }) => {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.card }]}>
      <Text style={[styles.placeholder, { color: colors.secondary }]}>
        Performance Chart Component
      </Text>
      <Text style={[styles.note, { color: colors.secondary }]}>
        Note: This is a placeholder. Implement actual chart using a library like
        react-native-chart-kit
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    borderRadius: 12,
    height: 200,
    justifyContent: 'center',
    padding: 16,
  },
  note: {
    fontSize: 12,
    opacity: 0.7,
    textAlign: 'center',
  },
  placeholder: {
    fontSize: 16,
    marginBottom: 8,
  },
});

export default PerformanceChart;
