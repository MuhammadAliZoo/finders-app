import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Switch, TouchableOpacity } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { Ionicons } from '@expo/vector-icons';

interface WidgetSetting {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
}

const WidgetSettingsScreen = () => {
  const { colors } = useTheme();
  const [settings, setSettings] = useState<WidgetSetting[]>([
    {
      id: '1',
      name: 'Recent Activity',
      description: 'Show recent user activities in the dashboard',
      enabled: true,
    },
    {
      id: '2',
      name: 'Statistics Overview',
      description: 'Display key statistics and metrics',
      enabled: true,
    },
    {
      id: '3',
      name: 'Quick Actions',
      description: 'Show quick action buttons for common tasks',
      enabled: false,
    },
    {
      id: '4',
      name: 'Notifications',
      description: 'Display recent notifications and alerts',
      enabled: true,
    },
  ]);

  const toggleSetting = (id: string) => {
    setSettings(prevSettings =>
      prevSettings.map(setting =>
        setting.id === id ? { ...setting, enabled: !setting.enabled } : setting,
      ),
    );
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Widget Settings</Text>
        <Text style={[styles.subtitle, { color: colors.secondary }]}>
          Customize your dashboard widgets
        </Text>
      </View>

      <View style={styles.settingsList}>
        {settings.map(setting => (
          <TouchableOpacity key={setting.id} onPress={() => toggleSetting(setting.id)}>
            <View style={[styles.settingItem, { backgroundColor: colors.card }]}>
              <View style={styles.settingInfo}>
                <Text style={[styles.settingName, { color: colors.text }]}>{setting.name}</Text>
                <Text style={[styles.settingDescription, { color: colors.secondary }]}>
                  {setting.description}
                </Text>
              </View>
              <Switch
                value={setting.enabled}
                onValueChange={() => toggleSetting(setting.id)}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor={setting.enabled ? colors.primary : colors.secondary}
              />
            </View>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity
        style={[styles.saveButton, { backgroundColor: colors.primary }]}
        onPress={() => {
          // TODO: Implement save functionality
          console.log('Saving widget settings:', settings);
        }}
      >
        <Text style={styles.saveButtonText}>Save Changes</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    borderBottomColor: '#eee',
    borderBottomWidth: 1,
    padding: 20,
  },
  saveButton: {
    alignItems: 'center',
    borderRadius: 12,
    margin: 20,
    padding: 16,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  settingDescription: {
    fontSize: 14,
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingItem: {
    alignItems: 'center',
    borderRadius: 12,
    elevation: 2,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  settingName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  settingsList: {
    padding: 20,
  },
  subtitle: {
    fontSize: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
});

export default WidgetSettingsScreen;
