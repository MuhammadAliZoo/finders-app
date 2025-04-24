import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeContext';

type AdminWidgetProps = {
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress?: () => void;
  children: React.ReactNode;
};

const AdminWidget: React.FC<AdminWidgetProps> = ({ title, icon, onPress, children }) => {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.card }]}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Ionicons name={icon} size={20} color={colors.primary} />
          <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
        </View>
        {onPress && (
          <TouchableOpacity onPress={onPress}>
            <Ionicons name="chevron-forward" size={20} color={colors.secondary} />
          </TouchableOpacity>
        )}
      </View>
      <View style={styles.content}>{children}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  content: {
    padding: 16,
  },
});

export default AdminWidget; 