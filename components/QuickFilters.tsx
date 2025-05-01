import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useTheme } from '../theme/ThemeContext';

type Filter = {
  id: string;
  label: string;
  icon: string;
};

type QuickFiltersProps = {
  filters: Filter[];
  selectedFilter: string | null;
  onFilterSelect: (filterId: string) => void;
};

const QuickFilters: React.FC<QuickFiltersProps> = ({ filters, selectedFilter, onFilterSelect }) => {
  const { colors } = useTheme();

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      {filters.map(filter => (
        <TouchableOpacity
          key={filter.id}
          onPress={() => onFilterSelect(filter.id)}
          style={[
            styles.filterButton,
            {
              backgroundColor: selectedFilter === filter.id ? colors.primary : colors.card,
            },
          ]}
        >
          <Text
            style={[
              styles.filterText,
              {
                color: selectedFilter === filter.id ? colors.background : colors.text,
              },
            ]}
          >
            {filter.label}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 0,
  },
  contentContainer: {
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  filterButton: {
    borderRadius: 20,
    marginRight: 10,
    paddingHorizontal: 15,
    paddingVertical: 8,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '500',
  },
});

export default QuickFilters;
