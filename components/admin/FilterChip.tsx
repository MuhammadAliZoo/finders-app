'use client';

import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';

interface FilterChipProps {
  label: string;
  isSelected: boolean;
  onPress: () => void;
  count?: number;
}

const FilterChip: React.FC<FilterChipProps> = ({ label, isSelected, onPress, count }) => {
  const { colors } = useTheme();

  return (
    <TouchableOpacity
      style={[
        styles.chip,
        {
          backgroundColor: isSelected ? colors.primary : 'transparent',
          borderColor: isSelected ? colors.primary : colors.border,
        },
      ]}
      onPress={onPress}
    >
      <Text style={[styles.label, { color: isSelected ? '#FFFFFF' : colors.text }]}>{label}</Text>
      {count !== undefined && (
        <View
          style={[styles.countBadge, { backgroundColor: isSelected ? '#FFFFFF' : colors.primary }]}
        >
          <Text style={[styles.countText, { color: isSelected ? colors.primary : '#FFFFFF' }]}>
            {count}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  chip: {
    alignItems: 'center',
    borderRadius: 20,
    borderWidth: 1,
    flexDirection: 'row',
    marginBottom: 8,
    marginRight: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  countBadge: {
    alignItems: 'center',
    borderRadius: 10,
    height: 20,
    justifyContent: 'center',
    marginLeft: 6,
    minWidth: 20,
    paddingHorizontal: 4,
  },
  countText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
  },
});

export default FilterChip;
