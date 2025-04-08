"use client"
import { View, Text, StyleSheet, Dimensions } from "react-native"
import { LineChart } from "react-native-chart-kit"
import { useTheme } from "../../context/ThemeContext"

const { width } = Dimensions.get("window")

const PerformanceChart = ({ data }) => {
  const { colors } = useTheme()

  // Default data if none provided
  const chartData = data || {
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    datasets: [
      {
        data: [20, 45, 28, 80, 99, 43, 50],
        color: () => colors.primary,
        strokeWidth: 2,
      },
      {
        data: [30, 25, 38, 52, 69, 33, 40],
        color: () => colors.success,
        strokeWidth: 2,
      },
    ],
    legend: ["Response Time", "Resolution Rate"],
  }

  const chartConfig = {
    backgroundColor: "transparent",
    backgroundGradientFrom: "transparent",
    backgroundGradientTo: "transparent",
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
    labelColor: (opacity = 1) => colors.secondary,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: "4",
      strokeWidth: "2",
    },
  }

  return (
    <View style={styles.container}>
      <LineChart
        data={chartData}
        width={width - 64}
        height={220}
        chartConfig={chartConfig}
        bezier
        style={styles.chart}
        withInnerLines={false}
        withOuterLines={false}
        withShadow={false}
        withDots={true}
        withVerticalLabels={true}
        withHorizontalLabels={true}
        fromZero={true}
      />

      <View style={styles.legendContainer}>
        {chartData.legend.map((label, index) => (
          <View key={index} style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: index === 0 ? colors.primary : colors.success }]} />
            <Text style={[styles.legendText, { color: colors.secondary }]}>{label}</Text>
          </View>
        ))}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  legendContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 8,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 12,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 6,
  },
  legendText: {
    fontSize: 12,
  },
})

export default PerformanceChart

