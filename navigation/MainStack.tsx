import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MainStackParamList } from './types';
import { TabNavigator } from './TabNavigator';
import ItemDetailsScreen from '../screens/ItemDetailsScreen';
import { AIAssistantScreen } from '../screens/AIAssistantScreen';
import { AllTrendingItemsScreen } from '../screens/AllTrendingItemsScreen';
import { RareItemsMarketplaceScreen } from '../screens/RareItemsMarketplaceScreen';
import SettingsScreen from '../screens/SettingsScreen';
import ClaimTrackingScreen from '../screens/ClaimTrackingScreen';
import SearchResultsScreen from '../screens/SearchResultsScreen';
import SubmissionScreen from '../screens/SubmissionScreen';

const Stack = createNativeStackNavigator<MainStackParamList>();

export const MainStack = () => {
  return (
    <Stack.Navigator initialRouteName="Tabs">
      <Stack.Screen
        name="Tabs"
        component={TabNavigator}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ItemDetails"
        component={ItemDetailsScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="AIAssistant"
        component={AIAssistantScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="AllTrendingItems"
        component={AllTrendingItemsScreen as React.ComponentType<any>}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="RareItemsMarketplace"
        component={RareItemsMarketplaceScreen as React.ComponentType<any>}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ClaimTracking"
        component={ClaimTrackingScreen}
        options={{ 
          headerShown: true,
          gestureEnabled: true,
          gestureDirection: 'horizontal',
          animation: 'slide_from_right',
          presentation: 'card'
        }}
      />
      <Stack.Screen
        name="SearchResults"
        component={SearchResultsScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Submission"
        component={SubmissionScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}; 