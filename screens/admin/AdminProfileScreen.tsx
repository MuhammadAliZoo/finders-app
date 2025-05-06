import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, type ThemeColors } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import AdminHeader from '../../components/admin/AdminHeader';
import type { DrawerNavigationProp } from '@react-navigation/drawer';
import { RootStackParamList } from '../../navigation/types';

type ActionItem = {
  id: string;
  action: string;
  date: string;
};

type RenderItemProps = {
  item: ActionItem;
};

const ActionItem = ({ action, colors }: { action: ActionItem; colors: ThemeColors }) => (
  <View style={styles.actionItem}>
    <Ionicons name="time-outline" size={16} color={colors.secondary} />
    <View style={styles.actionContent}>
      <Text style={[styles.actionText, { color: colors.text }]}>{action.action}</Text>
      <Text style={[styles.actionDate, { color: colors.secondary }]}>{action.date}</Text>
    </View>
  </View>
);

type AdminProfileScreenProps = {
  navigation: DrawerNavigationProp<RootStackParamList, 'AdminProfile'>;
};

const AdminProfileScreen = ({ navigation }: AdminProfileScreenProps) => {
  const { colors } = useTheme();
  const { signOut } = useAuth();

  // Mock admin data
  const adminData = {
    name: 'John Doe',
    role: 'Senior Administrator',
    email: 'john.doe@finders.com',
    joinDate: 'January 2023',
    recentActions: [
      { id: '1', action: 'Resolved dispute #1234', date: '2 hours ago' },
      { id: '2', action: 'Approved item moderation', date: '5 hours ago' },
      { id: '3', action: 'Generated monthly report', date: '1 day ago' },
    ] as ActionItem[],
  };

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const renderActionItem = ({ item }: RenderItemProps) => (
    <View style={styles.actionItem}>
      <Ionicons name="time-outline" size={16} color={colors.secondary} />
      <View style={styles.actionContent}>
        <Text style={[styles.actionText, { color: colors.text }]}>{item.action}</Text>
        <Text style={[styles.actionDate, { color: colors.secondary }]}>{item.date}</Text>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <AdminHeader title="Admin Profile" navigation={navigation} />
      <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { backgroundColor: colors.card }]}>
          <View style={styles.profileImageContainer}>
            <Image source={{ uri: 'https://via.placeholder.com/150' }} style={styles.profileImage} />
          </View>
          <Text style={[styles.name, { color: colors.text }]}>{adminData.name}</Text>
          <Text style={[styles.role, { color: colors.secondary }]}>{adminData.role}</Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Contact Information</Text>
          <View style={[styles.card, { backgroundColor: colors.card }]}>
            <View style={styles.infoRow}>
              <Ionicons name="mail-outline" size={20} color={colors.secondary} />
              <Text style={[styles.infoText, { color: colors.text }]}>{adminData.email}</Text>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="calendar-outline" size={20} color={colors.secondary} />
              <Text style={[styles.infoText, { color: colors.text }]}>
                Joined {adminData.joinDate}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Recent Actions</Text>
          <View style={[styles.card, { backgroundColor: colors.card }]}>
            <FlatList
              data={adminData.recentActions}
              renderItem={renderActionItem}
              keyExtractor={(item: ActionItem) => item.id}
              scrollEnabled={false}
            />
          </View>
        </View>

        <TouchableOpacity
          style={[styles.logoutButton, { backgroundColor: colors.primary }]}
          onPress={handleLogout}
        >
          <Ionicons name="log-out-outline" size={20} color="#FFFFFF" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  actionContent: {
    flex: 1,
    marginLeft: 12,
  },
  actionDate: {
    fontSize: 12,
  },
  actionItem: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    marginBottom: 16,
  },
  actionText: {
    fontSize: 14,
    marginBottom: 2,
  },
  card: {
    borderRadius: 12,
    padding: 16,
  },
  container: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    padding: 20,
  },
  infoRow: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 16,
    marginLeft: 12,
  },
  logoutButton: {
    alignItems: 'center',
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    margin: 16,
    padding: 16,
  },
  logoutText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  profileImage: {
    height: '100%',
    width: '100%',
  },
  profileImageContainer: {
    borderRadius: 60,
    height: 120,
    marginBottom: 16,
    overflow: 'hidden',
    width: 120,
  },
  role: {
    fontSize: 16,
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
});

export default AdminProfileScreen;
