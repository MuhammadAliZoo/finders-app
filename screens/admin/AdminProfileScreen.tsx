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
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '../../config/supabase';

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
  const { user, signOut } = useAuth();

  // Use real admin data from Supabase
  const adminData = {
    name: user?.full_name || user?.name || 'Admin',
    role: user?.role || 'admin',
    email: user?.username || '',
    joinDate: user?.created_at ? new Date(user.created_at).toLocaleDateString() : '',
    profileImage: user?.avatar_url || 'https://cdn-icons-png.flaticon.com/512/616/616408.png', // Wolf head icon
    recentActions: [], // You can fetch and display real actions if available
  };

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleProfileImageChange = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (permissionResult.status !== 'granted') {
        alert('Permission to access camera roll is required!');
        return;
      }
      const pickerResult = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });
      if (pickerResult.canceled) return;
      const uri = pickerResult.assets && pickerResult.assets.length > 0 ? pickerResult.assets[0].uri : undefined;
      if (!uri) return;
      // Upload to Supabase Storage bucket 'profile-pictures'
      const fileName = `profile-pictures/${user?.id}_${Date.now()}.jpg`;
      const response = await fetch(uri);
      const blob = await response.blob();
      const { error: uploadError } = await supabase.storage.from('profile-pictures').upload(fileName, blob, { upsert: true });
      if (uploadError) throw uploadError;
      // Get public URL
      const { data: publicUrlData } = supabase.storage.from('profile-pictures').getPublicUrl(fileName);
      const publicUrl = publicUrlData?.publicUrl;
      if (!publicUrl) throw new Error('Failed to get public URL');
      // Update profile in Supabase
      const { error: updateError } = await supabase.from('profiles').update({ avatar_url: publicUrl }).eq('id', user?.id);
      if (updateError) throw updateError;
      alert('Profile picture updated!');
    } catch (e: any) {
      alert('Failed to update profile picture: ' + (e.message || e));
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
      <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { backgroundColor: colors.card }]}>
          <View style={styles.profileImageContainer}>
            <Image source={{ uri: adminData.profileImage }} style={styles.profileImage} />
            <TouchableOpacity
              style={styles.profileImageEdit}
              onPress={handleProfileImageChange}
            >
              <Ionicons name="camera-outline" size={24} color={colors.primary} />
            </TouchableOpacity>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text style={[styles.name, { color: colors.text }]}>{adminData.name}</Text>
            <Ionicons name="location-outline" size={20} color={colors.primary} style={{ marginLeft: 8 }} />
          </View>
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
          onPress={async () => {
            await signOut();
            navigation.navigate('Login');
          }}
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
  profileImageEdit: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 4,
    elevation: 2,
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
