"use client"
import { createDrawerNavigator } from "@react-navigation/drawer"
import { createNativeStackNavigator } from "@react-navigation/native-stack"
import { Ionicons } from "@expo/vector-icons"
import { useTheme } from "../context/ThemeContext"

import AdminDashboardScreen from "../screens/admin/AdminDashboardScreen"
import ContentModerationScreen from "../screens/admin/ContentModerationScreen"
import DisputeResolutionScreen from "../screens/admin/DisputeResolutionScreen"
import AdminProfileScreen from "../screens/admin/AdminProfileScreen"
import ItemModerationScreen from "../screens/admin/ItemModerationScreen"
import DisputeDetailsScreen from "../screens/admin/DisputeDetailsScreen"
import GenerateReportScreen from "../screens/admin/GenerateReportScreen"
import CollaborativeWorkspaceScreen from "../screens/admin/CollaborativeWorkspaceScreen"
import WidgetSettingsScreen from "../screens/admin/WidgetSettingsScreen"
import AdminDrawerContent from "../components/admin/AdminDrawerContent"

const Drawer = createDrawerNavigator()
const Stack = createNativeStackNavigator()

const DashboardStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="AdminDashboard" component={AdminDashboardScreen} />
      <Stack.Screen name="GenerateReport" component={GenerateReportScreen} />
      <Stack.Screen name="CollaborativeWorkspace" component={CollaborativeWorkspaceScreen} />
      <Stack.Screen name="WidgetSettings" component={WidgetSettingsScreen} />
    </Stack.Navigator>
  )
}

const ModerationStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ContentModeration" component={ContentModerationScreen} />
      <Stack.Screen name="ItemModeration" component={ItemModerationScreen} />
    </Stack.Navigator>
  )
}

const DisputeStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="DisputeResolution" component={DisputeResolutionScreen} />
      <Stack.Screen name="DisputeDetails" component={DisputeDetailsScreen} />
    </Stack.Navigator>
  )
}

const AdminNavigator = () => {
  const { colors } = useTheme()

  return (
    <Drawer.Navigator
      drawerContent={(props) => <AdminDrawerContent {...props} />}
      screenOptions={{
        headerShown: false,
        drawerActiveTintColor: colors.primary,
        drawerInactiveTintColor: colors.secondary,
        drawerLabelStyle: {
          marginLeft: -20,
          fontSize: 15,
        },
        drawerStyle: {
          backgroundColor: colors.card,
          width: 280,
        },
      }}
    >
      <Drawer.Screen
        name="Dashboard"
        component={DashboardStack}
        options={{
          drawerIcon: ({ color }) => <Ionicons name="grid-outline" size={22} color={color} />,
        }}
      />
      <Drawer.Screen
        name="Moderation"
        component={ModerationStack}
        options={{
          drawerIcon: ({ color }) => <Ionicons name="shield-checkmark-outline" size={22} color={color} />,
        }}
      />
      <Drawer.Screen
        name="Disputes"
        component={DisputeStack}
        options={{
          drawerIcon: ({ color }) => <Ionicons name="alert-circle-outline" size={22} color={color} />,
        }}
      />
      <Drawer.Screen
        name="AdminProfile"
        component={AdminProfileScreen}
        options={{
          drawerIcon: ({ color }) => <Ionicons name="person-outline" size={22} color={color} />,
          title: "Profile",
        }}
      />
    </Drawer.Navigator>
  )
}

export default AdminNavigator

