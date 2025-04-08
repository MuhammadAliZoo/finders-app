"use client"
import { View, Text, StyleSheet } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useTheme } from "../../context/ThemeContext"

const MetricsCard = ({ title, value, change, icon, color }) => {
  const { colors } = useTheme()

  const isPositive = change >= 0

  return (
    <View style={[styles.card, { backgroundColor: colors.card }]}>
      <View style={[styles.iconContainer, { backgroundColor: color + "20" }]}>
        <Ionicons name={icon} size={20} color={color} />
      </View>

      <Text style={[styles.title, { color: colors.secondary }]}>{title}</Text>
      <Text style={[styles.value, { color: colors.text }]}>{value}</Text>

      <View style={styles.changeContainer}>
        <Ionicons
          name={isPositive ? "arrow-up-outline" : "arrow-down-outline"}
          size={14}
          color={isPositive ? colors.success : colors.error}
        />
        <Text style={[styles.changeText, { color: isPositive ? colors.success : colors.error }]}>
          {Math.abs(change)}%
        </Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    width: "48%",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  title: {
    fontSize: 14,
    marginBottom: 4,
  },
  value: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
  },
  changeContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  changeText: {
    fontSize: 12,
    fontWeight: "500",
    marginLeft: 2,
  },
})

export default MetricsCard

