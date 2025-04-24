"use client"
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useTheme } from "../../theme/ThemeContext"
import { useAuth } from "../../context/AuthContext"

type AdminHeaderProps = {
  title: string;
  navigation: any;
  showBackButton?: boolean;
};

const AdminHeader: React.FC<AdminHeaderProps> = ({ title, navigation, showBackButton = false }) => {
  const { colors } = useTheme()
  const { user } = useAuth()

  const openDrawer = () => {
    navigation.openDrawer()
  }

  const goBack = () => {
    navigation.goBack()
  }

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

        <TouchableOpacity style={styles.profileButton} onPress={() => navigation.navigate("AdminProfile")}>
          {user?.profileImage ? (
            <Image source={{ uri: user.profileImage }} style={styles.profileImage} />
          ) : (
            <View style={[styles.profilePlaceholder, { backgroundColor: colors.primary + "40" }]}>
              <Text style={[styles.profileInitial, { color: colors.primary }]}>
                {user?.name?.charAt(0).toUpperCase() || "A"}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  menuButton: {
    padding: 8,
  },
  backButton: {
    padding: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
  },
  rightContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  notificationButton: {
    padding: 8,
  },
  badge: {
    position: "absolute",
    top: 4,
    right: 4,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: "center",
    alignItems: "center",
  },
  badgeText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "bold",
  },
  profileButton: {
    padding: 2,
  },
  profileImage: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  profilePlaceholder: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  profileInitial: {
    fontSize: 16,
    fontWeight: "bold",
  },
})

export default AdminHeader

