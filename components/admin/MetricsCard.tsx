'use client';
import React from 'react';
import { View, Text, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';

export type MetricsCardProps = {
  title: string;
  value: number;
  change: number;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  style?: StyleProp<ViewStyle>;
};

const MetricsCard = React.memo<MetricsCardProps>(
  ({ title, value, change, icon, color, style }: MetricsCardProps) => {
    const { colors } = useTheme();

    return (
      <View style={[styles.container, { backgroundColor: colors.card }, style]}>
        <View style={[styles.iconContainer, { backgroundColor: color + '15' }]}>
          <Ionicons name={icon} size={24} color={color} />
        </View>
        <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
        <Text style={[styles.value, { color: colors.text }]}>{value}</Text>
        <View style={styles.changeContainer}>
          <Ionicons
            name={change >= 0 ? 'arrow-up' : 'arrow-down'}
            size={16}
            color={change >= 0 ? '#4CAF50' : '#F44336'}
          />
          <Text style={[styles.changeText, { color: colors.text }]}>
            {Math.abs(change)}% vs last period
          </Text>
        </View>
      </View>
    );
  },
);

MetricsCard.displayName = 'MetricsCard';

const styles = StyleSheet.create({
  changeContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 4,
  },
  changeText: {
    fontSize: 13,
    opacity: 0.6,
  },
  container: {
    borderRadius: 16,
    elevation: 2,
    marginBottom: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    width: '48%',
  },
  iconContainer: {
    alignItems: 'center',
    borderRadius: 20,
    height: 40,
    justifyContent: 'center',
    marginBottom: 12,
    width: 40,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
    opacity: 0.8,
  },
  value: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
  },
});

export default MetricsCard;
