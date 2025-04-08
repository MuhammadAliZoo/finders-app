"use client"
import { View, Text, StyleSheet, Dimensions, Image } from "react-native"
import { useTheme } from "../../context/ThemeContext"

const { width } = Dimensions.get("window")

const HeatmapView = ({ data }) => {
  const { colors } = useTheme()

  // This is a placeholder component
  // In a real app, you would use a mapping library like react-native-maps
  // with heatmap overlay capabilities

  return (
    <View style={styles.container}>
      <View style={[styles.mapContainer, { backgroundColor: colors.background }]}>
        <Image source={require("../../assets/heatmap-placeholder.png")} style={styles.mapImage} resizeMode="cover" />

        <View style={styles.legendContainer}>
          <Text style={[styles.legendTitle, { color: colors.text }]}>Density</Text>
          <View style={styles.legendGradient}>
            <View style={[styles.legendColor, { backgroundColor: "#00FF00" }]} />
            <View style={[styles.legendColor, { backgroundColor: "#FFFF00" }]} />
            <View style={[styles.legendColor, { backgroundColor: "#FF0000" }]} />
          </View>
          <View style={styles.legendLabels}>
            <Text style={[styles.legendLabel, { color: colors.secondary }]}>Low</Text>
            <Text style={[styles.legendLabel, { color: colors.secondary }]}>High</Text>
          </View>
        </View>
      </View>

      <View style={styles.statsContainer}>
        <View style={[styles.statItem, { backgroundColor: colors.background }]}>
          <Text style={[styles.statValue, { color: colors.text }]}>Downtown</Text>
          <Text style={[styles.statLabel, { color: colors.secondary }]}>Hotspot</Text>
        </View>

        <View style={[styles.statItem, { backgroundColor: colors.background }]}>
          <Text style={[styles.statValue, { color: colors.text }]}>+35%</Text>
          <Text style={[styles.statLabel, { color: colors.secondary }]}>Increase</Text>
        </View>

        <View style={[styles.statItem, { backgroundColor: colors.background }]}>
          <Text style={[styles.statValue, { color: colors.text }]}>127</Text>
          <Text style={[styles.statLabel, { color: colors.secondary }]}>Items</Text>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  mapContainer: {
    width: "100%",
    height: 200,
    borderRadius: 12,
    overflow: "hidden",
    position: "relative",
  },
  mapImage: {
    width: "100%",
    height: "100%",
  },
  legendContainer: {
    position: "absolute",
    bottom: 10,
    right: 10,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    borderRadius: 6,
    padding: 6,
  },
  legendTitle: {
    fontSize: 10,
    marginBottom: 4,
    textAlign: "center",
  },
  legendGradient: {
    flexDirection: "row",
    height: 8,
    width: 60,
    borderRadius: 4,
    overflow: "hidden",
  },
  legendColor: {
    flex: 1,
  },
  legendLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 2,
  },
  legendLabel: {
    fontSize: 8,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
    padding: 8,
    borderRadius: 8,
    marginHorizontal: 4,
  },
  statValue: {
    fontSize: 14,
    fontWeight: "bold",
  },
  statLabel: {
    fontSize: 12,
    marginTop: 2,
  },
})

export default HeatmapView

