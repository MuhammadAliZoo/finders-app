"use client"

import { createNativeStackNavigator } from "@react-navigation/native-stack"
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs"
import { Ionicons } from "@expo/vector-icons"

import HomeScreen from "../screens/HomeScreen"
import FinderScreen from "../screens/FinderScreen"
import RequesterScreen from "../screens/RequesterScreen"
import NotificationScreen from "../screens/NotificationScreen"
import ProfileScreen from "../screens/ProfileScreen"
import ItemDetailsScreen from "../screens/ItemDetailsScreen"
import SubmissionScreen from "../screens/SubmissionScreen"
import SearchResultsScreen from "../screens/SearchResultsScreen"
import ClaimTrackingScreen from "../screens/ClaimTrackingScreen"

import LogoTitle from "../components/LogoTitle"
import { useTheme } from "../context/ThemeContext"

const Stack = createNativeStackNavigator()
const Tab = createBottomTabNavigator()

const MainTabs = () => {
  const { colors } = useTheme()

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName

          if (route.name === "Home") {
            iconName = focused ? "home" : "home-outline"
          } else if (route.name === "Finder") {
            iconName = focused ? "search" : "search-outline"
          } else if (route.name === "Requester") {
            iconName = focused ? "add-circle" : "add-circle-outline"
          } else if (route.name === "Notifications") {
            iconName = focused ? "notifications" : "notifications-outline"
          } else if (route.name === "Profile") {
            iconName = focused ? "person" : "person-outline"
          }

          return <Ionicons name={iconName} size={size} color={color} />
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.secondary,
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopColor: colors.border,
        },
        headerStyle: {
          backgroundColor: colors.card,
        },
        headerTintColor: colors.text,
        headerTitle: (props) => <LogoTitle {...props} />,
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Finder" component={FinderScreen} />
      <Tab.Screen name="Requester" component={RequesterScreen} />
      <Tab.Screen name="Notifications" component={NotificationScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  )
}

const MainNavigator = () => {
  const { colors } = useTheme()

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.card,
        },
        headerTintColor: colors.text,
        contentStyle: {
          backgroundColor: colors.background,
        },
      }}
    >
      <Stack.Screen name="Main" component={MainTabs} options={{ headerShown: false }} />
      <Stack.Screen name="ItemDetails" component={ItemDetailsScreen} options={{ title: "Item Details" }} />
      <Stack.Screen name="Submission" component={SubmissionScreen} options={{ title: "Submit Item" }} />
      <Stack.Screen name="SearchResults" component={SearchResultsScreen} options={{ title: "Search Results" }} />
      <Stack.Screen name="ClaimTracking" component={ClaimTrackingScreen} options={{ title: "Claim Tracking" }} />
    </Stack.Navigator>
  )
}

export default MainNavigator

