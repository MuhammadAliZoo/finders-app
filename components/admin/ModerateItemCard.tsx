import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { ModerationItem } from '../../navigation/types';

export interface ModerateItemCardProps {
  moderationItem: ModerationItem;
  isSelected: boolean;
  onSelect: () => void;
  onPress: () => void;
  onChatPress: () => void;
}

const ModerateItemCard: React.FC<ModerateItemCardProps> = ({
  moderationItem,
  isSelected,
  onSelect,
  onPress,
  onChatPress,
}) => {
  const { colors } = useTheme();

  return (
    <TouchableOpacity
      style={[
        styles.container,
        { backgroundColor: colors.card },
        isSelected && { borderColor: colors.primary, borderWidth: 2 },
      ]}
      onPress={onPress}
    >
      <View style={styles.header}>
        <TouchableOpacity style={styles.checkbox} onPress={onSelect}>
          <Ionicons
            name={isSelected ? 'checkbox' : 'square-outline'}
            size={24}
            color={colors.primary}
          />
        </TouchableOpacity>
        <View style={styles.titleContainer}>
          <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
            {moderationItem.title}
          </Text>
          <Text style={[styles.date, { color: colors.secondary }]}>{moderationItem.date}</Text>
        </View>
        <TouchableOpacity style={styles.chatButton} onPress={onChatPress}>
          <Ionicons name="chatbubble-outline" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <Image source={{ uri: moderationItem.images[0] }} style={styles.image} resizeMode="cover" />
        <View style={styles.details}>
          <Text style={[styles.description, { color: colors.secondary }]} numberOfLines={2}>
            {moderationItem.description}
          </Text>
          <View style={styles.stats}>
            <View style={styles.stat}>
              <Ionicons name="star" size={16} color={colors.warning} />
              <Text style={[styles.statText, { color: colors.secondary }]}>
                {moderationItem.rating}
              </Text>
            </View>
            <View style={styles.stat}>
              <Ionicons name="flag" size={16} color={colors.error} />
              <Text style={[styles.statText, { color: colors.secondary }]}>
                {moderationItem.priority}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  chatButton: {
    marginLeft: 12,
  },
  checkbox: {
    marginRight: 12,
  },
  container: {
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
  },
  content: {
    flexDirection: 'row',
    padding: 12,
  },
  date: {
    fontSize: 12,
  },
  description: {
    fontSize: 14,
    marginBottom: 8,
  },
  details: {
    flex: 1,
    marginLeft: 12,
  },
  header: {
    alignItems: 'center',
    borderBottomColor: '#333333',
    borderBottomWidth: 1,
    flexDirection: 'row',
    padding: 12,
  },
  image: {
    borderRadius: 8,
    height: 80,
    width: 80,
  },
  stat: {
    alignItems: 'center',
    flexDirection: 'row',
    marginRight: 16,
  },
  statText: {
    fontSize: 14,
    marginLeft: 4,
  },
  stats: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  titleContainer: {
    flex: 1,
  },
});

export default ModerateItemCard;
