"use client"

import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MainStackParamList } from '../navigation/types';

type SettingsScreenRouteProp = RouteProp<MainStackParamList, 'Settings'>;

const SettingsScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<MainStackParamList>>();
  const route = useRoute<SettingsScreenRouteProp>();
  const { colors } = useTheme();
  const { section } = route.params;

  const renderContent = () => {
    switch (section) {
      case 'profile':
        return (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Profile Settings</Text>
            {/* Add profile settings content here */}
          </View>
        );
      case 'help':
        return (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Help & Support</Text>
            {/* Add help & support content here */}
          </View>
        );
      case 'privacy':
        return (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Privacy & Security</Text>
            {/* Add privacy & security content here */}
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.card }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Settings</Text>
      </View>
      <ScrollView style={styles.content}>
        {renderContent()}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 16,
  },
});

export default SettingsScreen; 