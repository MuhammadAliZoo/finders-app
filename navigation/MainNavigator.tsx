'use client';

import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { View, TouchableOpacity } from 'react-native';

import { HomeScreen } from '../screens/HomeScreen';
import FinderScreen from '../screens/FinderScreen';
import RequesterScreen from '../screens/RequesterScreen';
import NotificationScreen from '../screens/NotificationScreen';
import ProfileScreen from '../screens/ProfileScreen';
import { ItemDetailsScreen } from '../screens/ItemDetailsScreen';
import SubmissionScreen from '../screens/SubmissionScreen';
import SearchResultsScreen from '../screens/SearchResultsScreen';
import ClaimTrackingScreen from '../screens/ClaimTrackingScreen';
import { AIAssistantScreen } from '../screens/AIAssistantScreen';
import { AllTrendingItemsScreen } from '../screens/AllTrendingItemsScreen';
import { RareItemsMarketplaceScreen } from '../screens/RareItemsMarketplaceScreen';

import LogoTitle from '../components/LogoTitle';
import { useTheme } from '../context/ThemeContext';
import { MainStackParamList, TabParamList } from './types';

const Stack = createNativeStackNavigator<MainStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

const TabNavigator = () => {
  const { colors } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'home';

          switch (route.name) {
            case 'HomeTab':
              iconName = focused ? 'home' : 'home-outline';
              break;
            case 'FinderTab':
              iconName = focused ? 'search' : 'search-outline';
              break;
            case 'RequesterTab':
              iconName = focused ? 'add-circle' : 'add-circle-outline';
              break;
            case 'NotificationsTab':
              iconName = focused ? 'notifications' : 'notifications-outline';
              break;
            case 'ProfileTab':
              iconName = focused ? 'person' : 'person-outline';
              break;
          }

          return <Ionicons name={iconName} size={size} color={color} />;
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
        headerTitle: () => (
          <View style={{ flex: 1, alignItems: 'center' }}>
            <LogoTitle />
          </View>
        ),
      })}
      initialRouteName="HomeTab"
    >
      <Tab.Screen 
        name="HomeTab" 
        component={HomeScreen} 
        options={{ 
          title: 'Home',
          headerShown: true 
        }} 
      />
      <Tab.Screen name="FinderTab" component={FinderScreen} options={{ title: 'Finder' }} />
      <Tab.Screen name="RequesterTab" component={RequesterScreen} options={{ title: 'Requester' }} />
      <Tab.Screen
        name="NotificationsTab"
        component={NotificationScreen}
        options={{ title: 'Notifications' }}
      />
      <Tab.Screen name="ProfileTab" component={ProfileScreen} options={{ title: 'Profile' }} />
    </Tab.Navigator>
  );
};

const MainNavigator = () => {
  const { colors } = useTheme();

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
        gestureEnabled: true,
        gestureDirection: 'horizontal',
        animation: 'slide_from_right',
        presentation: 'card',
      }}
      initialRouteName="Tabs"
    >
      <Stack.Screen name="Tabs" component={TabNavigator} options={{ headerShown: false }} />
      <Stack.Screen
        name="ItemDetails"
        component={ItemDetailsScreen}
        options={{ title: 'Item Details' }}
      />
      <Stack.Screen
        name="Submission"
        component={SubmissionScreen}
        options={{ title: 'Submit Item' }}
      />
      <Stack.Screen
        name="SearchResults"
        component={SearchResultsScreen}
        options={{ title: 'Search Results' }}
      />
      <Stack.Screen
        name="ClaimTracking"
        component={ClaimTrackingScreen}
        options={({ navigation }) => ({
          title: 'Claim Tracking',
          gestureEnabled: true,
          gestureDirection: 'horizontal',
          animation: 'slide_from_right',
          presentation: 'card',
          headerShown: true,
          headerBackTitle: 'Back',
          headerLeft: () => (
            <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginLeft: 8 }}>
              <Ionicons name="chevron-back" size={24} color={colors.text} />
            </TouchableOpacity>
          ),
        })}
      />
      <Stack.Screen
        name="AIAssistant"
        component={AIAssistantScreen}
        options={{ title: 'AI Assistant' }}
      />
      <Stack.Screen
        name="AllTrendingItems"
        component={AllTrendingItemsScreen as React.ComponentType<any>}
        options={{ title: 'All Trending Items' }}
      />
      <Stack.Screen
        name="RareItemsMarketplace"
        component={RareItemsMarketplaceScreen as React.ComponentType<any>}
        options={{ title: 'Rare Items Marketplace' }}
      />
    </Stack.Navigator>
  );
};

export default MainNavigator;
