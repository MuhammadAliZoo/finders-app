"use client"
import { NavigationContainer } from "@react-navigation/native"
import { useAuth } from "../context/AuthContext"
import AuthNavigator from "./AuthNavigator"
import MainNavigator from "./MainNavigator"
import AdminNavigator from "./AdminNavigator"
import { ActivityIndicator, View, StyleSheet } from "react-native"
import { useTheme } from "../context/ThemeContext"

const AppNavigator = () => {
  const { user, isLoading, isAdmin } = useAuth()
  const { colors } = useTheme()

  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    )
  }

  return (
    <NavigationContainer>
      {user ? isAdmin ? <AdminNavigator /> : <MainNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  )
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
})

export default AppNavigator

