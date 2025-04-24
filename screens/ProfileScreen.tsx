"use client"

import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, Switch, Alert, ViewStyle, ActivityIndicator } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useTheme } from "../theme/ThemeContext"
import { useNavigation } from "@react-navigation/native"
import { NativeStackNavigationProp } from "@react-navigation/native-stack"
import { CompositeNavigationProp } from '@react-navigation/native'
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs'
import { MainStackParamList, TabParamList } from "../navigation/types"
import * as ImagePicker from 'expo-image-picker'
import type { ThemeColors } from '../types'
import { useAuth } from "../context/AuthContext"
import auth from '@react-native-firebase/auth'
import { User } from '../types/user'
import ImageUpload from '../components/ImageUpload'

type ProfileScreenNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<TabParamList, 'ProfileTab'>,
  NativeStackNavigationProp<MainStackParamList>
>;

const ProfileScreen = () => {
  const navigation = useNavigation<ProfileScreenNavigationProp>();
  const { colors, isDark, toggleTheme } = useTheme();
  const { user, updateUserProfile } = useAuth();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [locationEnabled, setLocationEnabled] = useState(true);
  const [loading, setLoading] = useState(false);

  const updateProfilePicture = async (photoURL: string) => {
    try {
      setLoading(true);
      await updateUserProfile({ photoURL });
      Alert.alert('Success', 'Profile picture updated successfully!');
    } catch (error) {
      console.error('Error updating profile picture:', error);
      Alert.alert('Error', 'Failed to update profile picture');
    } finally {
      setLoading(false);
    }
  };

  const removeProfilePicture = async () => {
    try {
      setLoading(true);
      await updateUserProfile({ photoURL: null });
      Alert.alert('Success', 'Profile picture removed successfully!');
    } catch (error) {
      console.error('Error removing profile picture:', error);
      Alert.alert('Error', 'Failed to remove profile picture');
    } finally {
      setLoading(false);
    }
  };

  const handleEditProfile = () => {
    navigation.navigate('EditProfile');
  };

  const handleHelpSupport = () => {
    navigation.navigate('HelpSupport');
  };

  const handlePrivacySecurity = () => {
    navigation.navigate('PrivacySecurity');
  };

  const handleLogout = async () => {
    try {
      await auth().signOut();
      navigation.navigate('Login');
    } catch (error) {
      console.error('Error signing out:', error);
      Alert.alert('Error', 'Failed to sign out');
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!user) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.text }}>No user data available</Text>
      </View>
    );
  }

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: colors.background }]}
      testID="profile-screen"
      showsVerticalScrollIndicator={false}
    >
      {/* Profile Header */}
      <View style={[styles.profileHeader, { backgroundColor: colors.card }]}>
        <View style={styles.profileImageContainer}>
          <ImageUpload
            path={`users/profile-pictures/${user.id}`}
            onImageUploaded={updateProfilePicture}
            onImageRemoved={removeProfilePicture}
            initialImage={user.photoURL || undefined}
          />
        </View>
        <Text style={[styles.profileName, { color: colors.text }]}>{user.displayName || 'No Name'}</Text>
        <View style={styles.contactInfo}>
          <View style={styles.contactItem}>
            <Ionicons name="mail-outline" size={16} color={colors.secondary} />
            <Text style={[styles.contactText, { color: colors.secondary }]}>{user.email}</Text>
          </View>
          {user.phoneNumber && (
            <View style={styles.contactItem}>
              <Ionicons name="call-outline" size={16} color={colors.secondary} />
              <Text style={[styles.contactText, { color: colors.secondary }]}>{user.phoneNumber}</Text>
            </View>
          )}
        </View>
        <TouchableOpacity 
          style={[styles.editProfileButton, { borderColor: colors.primary }]}
          onPress={handleEditProfile}
          testID="edit-profile-button"
        >
          <Text style={[styles.editProfileText, { color: colors.primary }]}>Edit Profile</Text>
        </TouchableOpacity>
      </View>

      {/* Settings */}
      <View style={[styles.settingsContainer, { backgroundColor: colors.card }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Settings</Text>

        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Ionicons name="notifications-outline" size={24} color={colors.text} />
            <Text style={[styles.settingText, { color: colors.text }]}>Push Notifications</Text>
          </View>
          <Switch
            value={notificationsEnabled}
            onValueChange={setNotificationsEnabled}
            trackColor={{ false: "#767577", true: colors.primary + "70" }}
            thumbColor={notificationsEnabled ? colors.primary : "#f4f3f4"}
            testID="notifications-switch"
          />
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Ionicons name="location-outline" size={24} color={colors.text} />
            <Text style={[styles.settingText, { color: colors.text }]}>Location Services</Text>
          </View>
          <Switch
            value={locationEnabled}
            onValueChange={setLocationEnabled}
            trackColor={{ false: "#767577", true: colors.primary + "70" }}
            thumbColor={locationEnabled ? colors.primary : "#f4f3f4"}
            testID="location-switch"
          />
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Ionicons name="moon-outline" size={24} color={colors.text} />
            <Text style={[styles.settingText, { color: colors.text }]}>Dark Mode</Text>
          </View>
          <Switch
            value={isDark}
            onValueChange={toggleTheme}
            trackColor={{ false: "#767577", true: colors.primary + "70" }}
            thumbColor={isDark ? colors.primary : "#f4f3f4"}
            testID="theme-switch"
          />
        </View>
      </View>

      {/* Account Actions */}
      <View style={styles.accountActions}>
        <TouchableOpacity 
          style={[styles.actionButton, { backgroundColor: colors.card }]}
          onPress={handleHelpSupport}
          testID="help-support-button"
        >
          <Ionicons name="help-circle-outline" size={24} color={colors.text} />
          <Text style={[styles.actionText, { color: colors.text }]}>Help & Support</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.actionButton, { backgroundColor: colors.card }]}
          onPress={handlePrivacySecurity}
          testID="privacy-security-button"
        >
          <Ionicons name="shield-checkmark-outline" size={24} color={colors.text} />
          <Text style={[styles.actionText, { color: colors.text }]}>Privacy & Security</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.actionButton, { backgroundColor: colors.error + "20" }]}
          onPress={handleLogout}
          testID="logout-button"
        >
          <Ionicons name="log-out-outline" size={24} color={colors.error} />
          <Text style={[styles.actionText, { color: colors.error }]}>Log Out</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  profileHeader: {
    alignItems: "center",
    padding: 24,
    margin: 16,
    borderRadius: 12,
  },
  profileImageContainer: {
    position: "relative",
    marginBottom: 16,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  editImageButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  profileName: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
  },
  contactInfo: {
    marginBottom: 16,
  },
  contactItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  contactText: {
    fontSize: 14,
    marginLeft: 8,
  },
  editProfileButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  editProfileText: {
    fontSize: 14,
    fontWeight: "500",
  },
  sectionHeaderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 4,
  },
  statsContainer: {
    padding: 20,
    margin: 16,
    marginTop: 0,
    borderRadius: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 16,
  },
  statItemContainer: {
    flexBasis: '47%',
    backgroundColor: 'transparent',
  },
  statItem: {
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
  },
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 28,
    fontWeight: '600',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    fontWeight: '500',
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginLeft: 8,
  },
  badgesContainer: {
    padding: 16,
    margin: 16,
    marginTop: 0,
    borderRadius: 12,
  },
  badgesScroll: {
    flexDirection: "row",
  },
  badgeItem: {
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    marginRight: 12,
    width: 120,
  },
  badgeIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  badgeName: {
    fontSize: 14,
    fontWeight: "500",
    textAlign: "center",
    marginBottom: 4,
  },
  badgeCount: {
    fontSize: 12,
  },
  settingsContainer: {
    padding: 16,
    margin: 16,
    marginTop: 0,
    borderRadius: 12,
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#333333",
  },
  settingInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  settingText: {
    fontSize: 16,
    marginLeft: 12,
  },
  accountActions: {
    padding: 16,
    marginBottom: 24,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  actionText: {
    fontSize: 16,
    marginLeft: 12,
  },
});

export default ProfileScreen;

