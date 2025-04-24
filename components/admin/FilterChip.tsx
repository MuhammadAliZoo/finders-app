"use client"

import { TouchableOpacity, Text, StyleSheet, View } from "react-native"
import { useTheme } from "../../theme/ThemeContext"

interface FilterChipProps {
  label: string;
  isSelected: boolean;
  onPress: () => void;
  count?: number;
}

const FilterChip: React.FC<FilterChipProps> = ({ label, isSelected, onPress, count }) => {
  const { colors } = useTheme()

  return (
    <TouchableOpacity
      style={[
        styles.chip,
        {
          backgroundColor: isSelected ? colors.primary : "transparent",
          borderColor: isSelected ? colors.primary : colors.border,
        },
      ]}
      onPress={onPress}
    >
      <Text style={[styles.label, { color: isSelected ? "#FFFFFF" : colors.text }]}>{label}</Text>
      {count !== undefined && (
        <View style={[styles.countBadge, { backgroundColor: isSelected ? "#FFFFFF" : colors.primary }]}>
          <Text style={[styles.countText, { color: isSelected ? colors.primary : "#FFFFFF" }]}>{count}</Text>
        </View>
      )}
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
  },
  countBadge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 6,
    paddingHorizontal: 4,
  },
  countText: {
    fontSize: 10,
    fontWeight: "bold",
  },
})

export default FilterChip

