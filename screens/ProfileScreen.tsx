'use client';

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  Switch,
  Alert,
  ViewStyle,
  ActivityIndicator,
  Button,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { CompositeNavigationProp } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { MainStackParamList, TabParamList, RootStackParamList } from '../navigation/types';
import * as ImagePicker from 'expo-image-picker';
import type { ThemeColors } from '../types';
import { useAuth } from '../context/AuthContext';
import ImageUpload from '../components/ImageUpload';
import { uploadImage } from '../utils/storage';
import { supabase } from '../config/supabase';

type ProfileScreenNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<TabParamList, 'ProfileTab'>,
  NativeStackNavigationProp<RootStackParamList>
>;

const ProfileScreen = () => {
  const navigation = useNavigation<ProfileScreenNavigationProp>();
  const { colors, isDark, toggleTheme } = useTheme();
  const { user, loading, signOut, refreshProfile } = useAuth();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [locationEnabled, setLocationEnabled] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [fullName, setFullName] = useState(user?.full_name || '');
  const [phone, setPhone] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const handleProfilePictureUpload = async (uri: string) => {
    try {
      if (!user) throw new Error('User not logged in');
      const url = await uploadImage(uri, user.id);
      await supabase.from('profiles').update({ avatar_url: url }).eq('id', user.id);
      await refreshProfile();
      Alert.alert('Success', 'Profile picture updated!');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update profile picture');
    }
  };

  const handleUpdateProfile = async () => {
    if (!fullName) {
      Alert.alert('Error', 'Full name is required');
      return;
    }
    setIsUpdating(true);
    try {
      await supabase.from('profiles').update({ full_name: fullName, phone }).eq('id', user?.id);
      await refreshProfile();
      Alert.alert('Success', 'Profile updated successfully');
      setIsEditing(false);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update profile');
    } finally {
      setIsUpdating(false);
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

  const handleSignOut = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await supabase.auth.signOut();
              if (error) throw error;
              
              // Clear any local storage or state if needed
              await signOut(); // This is from useAuth context
              
              // Navigate to the Auth stack
              navigation.navigate('Auth');
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to sign out');
            }
          },
        },
      ],
      { cancelable: true }
    );
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
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          {user?.avatar_url ? (
            <Image source={{ uri: user.avatar_url }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatarPlaceholder, { backgroundColor: colors.primary }]}>
              <Text style={styles.avatarText}>
                {user?.full_name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase()}
              </Text>
            </View>
          )}
        </View>
        <Text style={[styles.email, { color: colors.secondary }]}>{user?.email}</Text>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Profile Information</Text>

        <View style={styles.inputGroup}>
          <Text style={[styles.inputLabel, { color: colors.text }]}>Full Name</Text>
          <View style={[styles.inputContainer, { backgroundColor: colors.card }]}>
            <Ionicons
              name="person-outline"
              size={20}
              color={colors.secondary}
              style={styles.inputIcon}
            />
            <TextInput
              style={[styles.input, { color: colors.text }]}
              value={fullName}
              onChangeText={setFullName}
              editable={isEditing}
              placeholder="Enter your full name"
              placeholderTextColor={colors.secondary}
            />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.inputLabel, { color: colors.text }]}>Phone Number</Text>
          <View style={[styles.inputContainer, { backgroundColor: colors.card }]}>
            <Ionicons
              name="call-outline"
              size={20}
              color={colors.secondary}
              style={styles.inputIcon}
            />
            <TextInput
              style={[styles.input, { color: colors.text }]}
              value={phone}
              onChangeText={setPhone}
              editable={isEditing}
              placeholder="Enter your phone number"
              placeholderTextColor={colors.secondary}
              keyboardType="phone-pad"
            />
          </View>
        </View>

        <View style={styles.buttonContainer}>
          {isEditing ? (
            <TouchableOpacity
              style={[styles.button, { backgroundColor: colors.primary }]}
              onPress={handleUpdateProfile}
              disabled={isUpdating}
            >
              {isUpdating ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={styles.buttonText}>Save Changes</Text>
              )}
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.button, { backgroundColor: colors.primary }]}
              onPress={() => setIsEditing(true)}
            >
              <Text style={styles.buttonText}>Edit Profile</Text>
            </TouchableOpacity>
          )}
        </View>
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
            trackColor={{ false: '#767577', true: colors.primary + '70' }}
            thumbColor={notificationsEnabled ? colors.primary : '#f4f3f4'}
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
            trackColor={{ false: '#767577', true: colors.primary + '70' }}
            thumbColor={locationEnabled ? colors.primary : '#f4f3f4'}
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
            trackColor={{ false: '#767577', true: colors.primary + '70' }}
            thumbColor={isDark ? colors.primary : '#f4f3f4'}
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
          style={[styles.actionButton, { backgroundColor: colors.error + '20' }]}
          onPress={handleSignOut}
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
  accountActions: {
    marginBottom: 24,
    padding: 16,
  },
  actionButton: {
    alignItems: 'center',
    borderRadius: 12,
    flexDirection: 'row',
    marginBottom: 12,
    padding: 16,
  },
  actionText: {
    fontSize: 16,
    marginLeft: 12,
  },
  avatar: {
    borderRadius: 50,
    height: 100,
    width: 100,
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatarPlaceholder: {
    alignItems: 'center',
    borderRadius: 50,
    height: 100,
    justifyContent: 'center',
    width: 100,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 40,
    fontWeight: 'bold',
  },
  button: {
    alignItems: 'center',
    borderRadius: 8,
    height: 48,
    justifyContent: 'center',
  },
  buttonContainer: {
    marginTop: 20,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  container: {
    flex: 1,
  },
  email: {
    fontSize: 16,
    marginTop: 8,
  },
  header: {
    alignItems: 'center',
    padding: 20,
  },
  input: {
    flex: 1,
    fontSize: 16,
    height: 48,
  },
  inputContainer: {
    alignItems: 'center',
    borderRadius: 8,
    flexDirection: 'row',
    paddingHorizontal: 12,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputIcon: {
    marginRight: 12,
  },
  inputLabel: {
    fontSize: 16,
    marginBottom: 8,
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  settingInfo: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  settingItem: {
    alignItems: 'center',
    borderBottomColor: '#333333',
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  settingText: {
    fontSize: 16,
    marginLeft: 12,
  },
  settingsContainer: {
    borderRadius: 12,
    margin: 16,
    marginTop: 0,
    padding: 16,
  },
});

export default ProfileScreen;
