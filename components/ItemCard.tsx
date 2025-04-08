"use client"
import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useTheme } from "../context/ThemeContext"

interface ItemCardProps {
  item: {
    id: string
    title: string
    location: string
    time: string
    image: string
  }
  onPress: () => void
}

const ItemCard = ({ item, onPress }: ItemCardProps) => {
  const { colors } = useTheme()

  return (
    <TouchableOpacity style={[styles.card, { backgroundColor: colors.card }]} onPress={onPress}>
      <Image source={{ uri: item.image }} style={styles.image} />
      <View style={styles.content}>
        <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
          {item.title}
        </Text>
        <View style={styles.infoRow}>
          <Ionicons name="location-outline" size={14} color={colors.secondary} />
          <Text style={[styles.infoText, { color: colors.secondary }]} numberOfLines={1}>
            {item.location}
          </Text>
        </View>
        <View style={styles.infoRow}>
          <Ionicons name="time-outline" size={14} color={colors.secondary} />
          <Text style={[styles.infoText, { color: colors.secondary }]}>{item.time}</Text>
        </View>
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  card: {
    width: 160,
    borderRadius: 12,
    overflow: "hidden",
    marginRight: 12,
  },
  image: {
    width: "100%",
    height: 120,
  },
  content: {
    padding: 10,
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  infoText: {
    fontSize: 12,
    marginLeft: 4,
  },
})

export default ItemCard

