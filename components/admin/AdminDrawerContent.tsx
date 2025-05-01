'use client';

import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import type { DrawerContentComponentProps } from '@react-navigation/drawer';

const AdminDrawerContent = (props: DrawerContentComponentProps) => {
  const { colors, isInitialized } = useTheme();
  const { user, logout } = useAuth();

  if (!isInitialized) {
    return null;
  }

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed', error);
    }
  };

  return (
    <DrawerContentScrollView {...props} style={{ backgroundColor: colors.card }}>
      <View style={styles.drawerHeader}>
        <View style={styles.userInfoSection}>
          {user?.profileImage ? (
            <Image source={{ uri: user.profileImage }} style={styles.userImage} />
          ) : (
            <View style={[styles.userImagePlaceholder, { backgroundColor: colors.primary + '40' }]}>
              <Text style={[styles.userInitial, { color: colors.primary }]}>
                {user?.name?.charAt(0).toUpperCase() || 'A'}
              </Text>
            </View>
          )}
          <View style={styles.userInfo}>
            <Text style={[styles.userName, { color: colors.text }]}>
              {user?.name || 'Admin User'}
            </Text>
            <Text style={[styles.userRole, { color: colors.secondary }]}>Administrator</Text>
          </View>
        </View>
      </View>

      <View style={styles.drawerContent}>
        <DrawerItemList {...props} />

        <View style={[styles.divider, { backgroundColor: colors.border }]} />

        <Text style={[styles.sectionTitle, { color: colors.secondary }]}>Tools</Text>

        <TouchableOpacity
          style={styles.drawerItem}
          onPress={() => props.navigation.navigate('GenerateReport', { type: 'overview' })}
        >
          <Ionicons
            name="bar-chart-outline"
            size={22}
            color={colors.secondary}
            style={styles.drawerIcon}
          />
          <Text style={[styles.drawerLabel, { color: colors.text }]}>Reports</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.drawerItem}
          onPress={() => props.navigation.navigate('CollaborativeWorkspace')}
        >
          <Ionicons
            name="people-outline"
            size={22}
            color={colors.secondary}
            style={styles.drawerIcon}
          />
          <Text style={[styles.drawerLabel, { color: colors.text }]}>Workspace</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.drawerItem}
          onPress={() => props.navigation.navigate('WidgetSettings')}
        >
          <Ionicons
            name="settings-outline"
            size={22}
            color={colors.secondary}
            style={styles.drawerIcon}
          />
          <Text style={[styles.drawerLabel, { color: colors.text }]}>Settings</Text>
        </TouchableOpacity>

        <View style={[styles.divider, { backgroundColor: colors.border }]} />

        <TouchableOpacity style={styles.drawerItem} onPress={handleLogout}>
          <Ionicons
            name="log-out-outline"
            size={22}
            color={colors.error}
            style={styles.drawerIcon}
          />
          <Text style={[styles.drawerLabel, { color: colors.error }]}>Logout</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.drawerFooter}>
        <Text style={[styles.versionText, { color: colors.secondary }]}>Finders Admin v1.0.0</Text>
      </View>
    </DrawerContentScrollView>
  );
};

const styles = StyleSheet.create({
  divider: {
    height: 1,
    marginHorizontal: 16,
    marginVertical: 12,
  },
  drawerContent: {
    flex: 1,
    paddingTop: 8,
  },
  drawerFooter: {
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
    borderTopWidth: 1,
    marginTop: 16,
    padding: 16,
  },
  drawerHeader: {
    padding: 16,
  },
  drawerIcon: {
    alignItems: 'center',
    marginRight: 32,
    width: 24,
  },
  drawerItem: {
    alignItems: 'center',
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  drawerLabel: {
    fontSize: 15,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 8,
    marginLeft: 16,
    marginTop: 4,
    textTransform: 'uppercase',
  },
  userImage: {
    borderRadius: 25,
    height: 50,
    width: 50,
  },
  userImagePlaceholder: {
    alignItems: 'center',
    borderRadius: 25,
    height: 50,
    justifyContent: 'center',
    width: 50,
  },
  userInfo: {
    marginLeft: 12,
  },
  userInfoSection: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: 12,
  },
  userInitial: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  userRole: {
    fontSize: 12,
  },
  versionText: {
    fontSize: 12,
    textAlign: 'center',
  },
});

export default AdminDrawerContent;
