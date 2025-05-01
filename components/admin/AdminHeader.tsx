'use client';
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeContext';
import { useAuth } from '../../context/AuthContext';

type AdminHeaderProps = {
  title: string;
  navigation: any;
  showBackButton?: boolean;
};

const AdminHeader: React.FC<AdminHeaderProps> = ({ title, navigation, showBackButton = false }) => {
  const { colors } = useTheme();
  const { user } = useAuth();

  const openDrawer = () => {
    navigation.openDrawer();
  };

  const goBack = () => {
    navigation.goBack();
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.card }]}>
      {showBackButton ? (
        <TouchableOpacity style={styles.backButton} onPress={goBack}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
      ) : (
        <TouchableOpacity style={styles.menuButton} onPress={openDrawer}>
          <Ionicons name="menu-outline" size={24} color={colors.text} />
        </TouchableOpacity>
      )}

      <Text style={[styles.title, { color: colors.text }]}>{title}</Text>

      <View style={styles.rightContainer}>
        <TouchableOpacity style={styles.notificationButton}>
          <Ionicons name="notifications-outline" size={24} color={colors.text} />
          <View style={[styles.badge, { backgroundColor: colors.primary }]}>
            <Text style={styles.badgeText}>3</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.profileButton}
          onPress={() => navigation.navigate('AdminProfile')}
        >
          {user?.profileImage ? (
            <Image source={{ uri: user.profileImage }} style={styles.profileImage} />
          ) : (
            <View style={[styles.profilePlaceholder, { backgroundColor: colors.primary + '40' }]}>
              <Text style={[styles.profileInitial, { color: colors.primary }]}>
                {user?.name?.charAt(0).toUpperCase() || 'A'}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  backButton: {
    padding: 4,
  },
  badge: {
    alignItems: 'center',
    borderRadius: 9,
    height: 18,
    justifyContent: 'center',
    minWidth: 18,
    position: 'absolute',
    right: 4,
    top: 4,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  container: {
    alignItems: 'center',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 16,
    paddingHorizontal: 16,
    paddingTop: 60,
  },
  menuButton: {
    padding: 8,
  },
  notificationButton: {
    padding: 8,
  },
  profileButton: {
    padding: 2,
  },
  profileImage: {
    borderRadius: 16,
    height: 32,
    width: 32,
  },
  profileInitial: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  profilePlaceholder: {
    alignItems: 'center',
    borderRadius: 16,
    height: 32,
    justifyContent: 'center',
    width: 32,
  },
  rightContainer: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
});

export default AdminHeader;
