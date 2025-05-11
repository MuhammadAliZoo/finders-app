'use client';
import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { useTheme } from '../../context/ThemeContext';

const screenWidth = Dimensions.get('window').width;

type PerformanceChartProps = {
  data: {
    labels: string[];
    datasets: {
      data: number[];
    }[];
  };
};

const chartConfig = (colors: any) => ({
  backgroundGradientFrom: colors.card,
  backgroundGradientTo: colors.card,
  color: (opacity = 1) => colors.primary,
  labelColor: (opacity = 1) => colors.text,
  strokeWidth: 2,
  propsForDots: {
    r: '4',
    strokeWidth: '2',
    stroke: colors.primary,
  },
});

const PerformanceChart: React.FC<PerformanceChartProps> = ({ data }) => {
  const { colors } = useTheme();

  if (!data || !data.labels || !data.datasets || !data.datasets[0].data.length) {
    return (
      <View style={[styles.container, { backgroundColor: colors.card }]}> 
        <Text style={[styles.placeholder, { color: colors.secondary }]}>No performance data available.</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.card }]}>
      <LineChart
        data={data}
        width={screenWidth - 64}
        height={180}
        chartConfig={chartConfig(colors)}
        bezier
        style={{ borderRadius: 12 }}
      />
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
  placeholder: {
    fontSize: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
});

export default PerformanceChart;
