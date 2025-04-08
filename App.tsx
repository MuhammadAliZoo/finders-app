import { StatusBar } from "react-native"
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs"
import { createNativeStackNavigator } from "@react-navigation/native-stack"
import { SafeAreaProvider } from "react-native-safe-area-context"
import { Ionicons } from "@expo/vector-icons"
import dynamic from 'next/dynamic'

// Lazy load screens
const HomeScreen = dynamic(() => import("./screens/HomeScreen"), { ssr: false })
const FinderScreen = dynamic(() => import("./screens/FinderScreen"), { ssr: false })
const RequesterScreen = dynamic(() => import("./screens/RequesterScreen"), { ssr: false })
const NotificationScreen = dynamic(() => import("./screens/NotificationScreen"), { ssr: false })
const ProfileScreen = dynamic(() => import("./screens/ProfileScreen"), { ssr: false })

// Components
const LogoTitle = dynamic(() => import("./components/LogoTitle"), { ssr: false })

// Context
import { ThemeProvider } from "./context/ThemeContext"
import { AuthProvider } from "./context/AuthContext"
import AppNavigator from "./navigation/AppNavigator"

const Tab = createBottomTabNavigator()
const Stack = createNativeStackNavigator()

type IconName = "home" | "home-outline" | "search" | "search-outline" | "add-circle" | "add-circle-outline" | "notifications" | "notifications-outline" | "person" | "person-outline"

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: IconName

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
          } else {
            iconName = "home"
          }

          return <Ionicons name={iconName} size={size} color={color} />
        },
        tabBarActiveTintColor: "#00BFFF",
        tabBarInactiveTintColor: "#888888",
        tabBarStyle: {
          backgroundColor: "#121212",
          borderTopColor: "#262626",
        },
        headerStyle: {
          backgroundColor: "#121212",
        },
        headerTintColor: "#FFFFFF",
        headerTitle: () => <LogoTitle />,
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

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <SafeAreaProvider>
          <StatusBar barStyle="light-content" backgroundColor="#121212" />
          <AppNavigator />
        </SafeAreaProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}

