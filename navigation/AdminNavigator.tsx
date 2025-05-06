'use client';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import type {
  DrawerNavigationOptions,
  DrawerContentComponentProps,
} from '@react-navigation/drawer';
import type { NativeStackNavigationOptions } from '@react-navigation/native-stack';
import { ReactNode } from 'react';
import { RootStackParamList } from './types';

import AdminDashboardScreen from '../screens/admin/AdminDashboardScreen';
import ContentModerationScreen from '../screens/admin/ContentModerationScreen';
import DisputeResolutionScreen from '../screens/admin/DisputeResolutionScreen';
import AdminProfileScreen from '../screens/admin/AdminProfileScreen';
import ItemModerationScreen from '../screens/admin/ItemModerationScreen';
import DisputeDetailsScreen from '../screens/admin/DisputeDetailsScreen';
import GenerateReportScreen from '../screens/admin/GenerateReportScreen';
import CollaborativeWorkspaceScreen from '../screens/admin/CollaborativeWorkspaceScreen';
import WidgetSettingsScreen from '../screens/admin/WidgetSettingsScreen';
import AdminDrawerContent from '../components/admin/AdminDrawerContent';

const Drawer = createDrawerNavigator<RootStackParamList>();
const Stack = createNativeStackNavigator<RootStackParamList>();

const stackScreenOptions: NativeStackNavigationOptions = {
  headerShown: false,
};

const DashboardStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="AdminDashboard"
        component={AdminDashboardScreen}
        options={stackScreenOptions}
      />
      <Stack.Screen
        name="GenerateReport"
        component={GenerateReportScreen}
        options={stackScreenOptions}
      />
      <Stack.Screen
        name="CollaborativeWorkspace"
        component={CollaborativeWorkspaceScreen}
        options={stackScreenOptions}
      />
      <Stack.Screen
        name="WidgetSettings"
        component={WidgetSettingsScreen}
        options={stackScreenOptions}
      />
    </Stack.Navigator>
  );
};

const ModerationStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="ContentModeration"
        component={ContentModerationScreen}
        options={stackScreenOptions}
      />
      <Stack.Screen
        name="ItemModeration"
        component={ItemModerationScreen}
        options={stackScreenOptions}
      />
    </Stack.Navigator>
  );
};

const DisputeStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="DisputeResolution"
        component={DisputeResolutionScreen}
        options={stackScreenOptions}
      />
      <Stack.Screen
        name="DisputeDetails"
        component={DisputeDetailsScreen}
        options={stackScreenOptions}
      />
    </Stack.Navigator>
  );
};

const AdminNavigator = () => {
  const { colors } = useTheme();

  const drawerScreenOptions: DrawerNavigationOptions = {
    headerStyle: {
      backgroundColor: colors.background,
    },
    headerTintColor: colors.text,
    drawerStyle: {
      backgroundColor: colors.background,
    },
    drawerActiveTintColor: colors.primary,
    drawerInactiveTintColor: colors.text,
  };

  return (
    <Drawer.Navigator drawerContent={props => <AdminDrawerContent {...props} />}>
      <Drawer.Screen
        name="AdminDashboard"
        component={DashboardStack}
        options={{
          ...drawerScreenOptions,
          headerShown: false,
          drawerIcon: ({ color }) => <Ionicons name="home" size={24} color={color} />,
        }}
      />
      <Drawer.Screen
        name="ContentModeration"
        component={ModerationStack}
        options={{
          ...drawerScreenOptions,
          drawerIcon: ({ color }) => <Ionicons name="shield-checkmark" size={24} color={color} />,
        }}
      />
      <Drawer.Screen
        name="DisputeResolution"
        component={DisputeStack}
        options={{
          ...drawerScreenOptions,
          drawerIcon: ({ color }) => <Ionicons name="alert-circle" size={24} color={color} />,
        }}
      />
      <Drawer.Screen
        name="AdminProfile"
        component={AdminProfileScreen}
        options={{
          ...drawerScreenOptions,
          drawerIcon: ({ color }) => <Ionicons name="person" size={24} color={color} />,
        }}
      />
    </Drawer.Navigator>
  );
};

export default AdminNavigator;
