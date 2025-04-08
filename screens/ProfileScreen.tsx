"use client"

import { useState } from "react"
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, Switch } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useTheme } from "../context/ThemeContext"

// Mock data
const userProfile = {
  name: "John Doe",
  email: "john.doe@example.com",
  phone: "+1 (555) 123-4567",
  image: "https://via.placeholder.com/150",
  stats: {
    itemsFound: 5,
    itemsReturned: 3,
    itemsLost: 2,
    itemsRecovered: 1,
  },
  badges: [
    { id: "b1", name: "Helpful Finder", icon: "search", count: 5 },
    { id: "b2", name: "Quick Responder", icon: "time", count: 10 },
    { id: "b3", name: "Community Hero", icon: "star", count: 3 },
  ],
}

const ProfileScreen = () => {
  const { colors, theme, toggleTheme } = useTheme()
  const [notificationsEnabled, setNotificationsEnabled] = useState(true)
  const [locationEnabled, setLocationEnabled] = useState(true)

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Profile Header */}
      <View style={[styles.profileHeader, { backgroundColor: colors.card }]}>
        <View style={styles.profileImageContainer}>
          <Image source={{ uri: userProfile.image }} style={styles.profileImage} />
          <TouchableOpacity style={[styles.editImageButton, { backgroundColor: colors.primary }]}>
            <Ionicons name="camera" size={16} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
        <Text style={[styles.profileName, { color: colors.text }]}>{userProfile.name}</Text>
        <View style={styles.contactInfo}>
          <View style={styles.contactItem}>
            <Ionicons name="mail-outline" size={16} color={colors.secondary} />
            <Text style={[styles.contactText, { color: colors.secondary }]}>{userProfile.email}</Text>
          </View>
          <View style={styles.contactItem}>
            <Ionicons name="call-outline" size={16} color={colors.secondary} />
            <Text style={[styles.contactText, { color: colors.secondary }]}>{userProfile.phone}</Text>
          </View>
        </View>
        <TouchableOpacity style={[styles.editProfileButton, { borderColor: colors.primary }]}>
          <Text style={[styles.editProfileText, { color: colors.primary }]}>Edit Profile</Text>
        </TouchableOpacity>
      </View>

      {/* Stats */}
      <View style={[styles.statsContainer, { backgroundColor: colors.card }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Your Stats</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: colors.text }]}>{userProfile.stats.itemsFound}</Text>
            <Text style={[styles.statLabel, { color: colors.secondary }]}>Items Found</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: colors.text }]}>{userProfile.stats.itemsReturned}</Text>
            <Text style={[styles.statLabel, { color: colors.secondary }]}>Items Returned</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: colors.text }]}>{userProfile.stats.itemsLost}</Text>
            <Text style={[styles.statLabel, { color: colors.secondary }]}>Items Lost</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: colors.text }]}>{userProfile.stats.itemsRecovered}</Text>
            <Text style={[styles.statLabel, { color: colors.secondary }]}>Items Recovered</Text>
          </View>
        </View>
      </View>

      {/* Badges */}
      <View style={[styles.badgesContainer, { backgroundColor: colors.card }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Your Badges</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.badgesScroll}>
          {userProfile.badges.map((badge) => (
            <View key={badge.id} style={[styles.badgeItem, { backgroundColor: colors.background }]}>
              <View style={[styles.badgeIcon, { backgroundColor: colors.primary + "20" }]}>
                <Ionicons name={badge.icon} size={24} color={colors.primary} />
              </View>
              <Text style={[styles.badgeName, { color: colors.text }]}>{badge.name}</Text>
              <Text style={[styles.badgeCount, { color: colors.secondary }]}>x{badge.count}</Text>
            </View>
          ))}
        </ScrollView>
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
          />
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Ionicons name="moon-outline" size={24} color={colors.text} />
            <Text style={[styles.settingText, { color: colors.text }]}>Dark Mode</Text>
          </View>
          <Switch
            value={theme === "dark"}
            onValueChange={toggleTheme}
            trackColor={{ false: "#767577", true: colors.primary + "70" }}
            thumbColor={theme === "dark" ? colors.primary : "#f4f3f4"}
          />
        </View>
      </View>

      {/* Account Actions */}
      <View style={styles.accountActions}>
        <TouchableOpacity style={[styles.actionButton, { backgroundColor: colors.card }]}>
          <Ionicons name="help-circle-outline" size={24} color={colors.text} />
          <Text style={[styles.actionText, { color: colors.text }]}>Help & Support</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.actionButton, { backgroundColor: colors.card }]}>
          <Ionicons name="shield-checkmark-outline" size={24} color={colors.text} />
          <Text style={[styles.actionText, { color: colors.text }]}>Privacy & Security</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.actionButton, { backgroundColor: colors.error + "20" }]}>
          <Ionicons name="log-out-outline" size={24} color={colors.error} />
          <Text style={[styles.actionText, { color: colors.error }]}>Log Out</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  )
}

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
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
  },
  statsContainer: {
    padding: 16,
    margin: 16,
    marginTop: 0,
    borderRadius: 12,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  statItem: {
    width: "48%",
    alignItems: "center",
    padding: 16,
    marginBottom: 16,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
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
})

export default ProfileScreen

