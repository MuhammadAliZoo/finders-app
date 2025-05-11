import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MainStackParamList } from './types';

// Import screens
import { TabNavigator } from './TabNavigator';
import { ItemDetailsScreen } from '../screens/ItemDetailsScreen';
import { AIAssistantScreen } from '../screens/AIAssistantScreen';
import SubmissionScreen from '../screens/SubmissionScreen';
import SearchResultsScreen from '../screens/SearchResultsScreen';
import ClaimTrackingScreen from '../screens/ClaimTrackingScreen';
import { AllTrendingItemsScreen } from '../screens/AllTrendingItemsScreen';
import { ChatScreen } from '../screens/ChatScreen';
import SettingsScreen from '../screens/SettingsScreen';
import { RareItemsMarketplaceScreen } from '../screens/RareItemsMarketplaceScreen';

const Stack = createNativeStackNavigator<MainStackParamList>();

export function MainStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="Tabs" component={TabNavigator} />
      <Stack.Screen name="ItemDetails" component={ItemDetailsScreen} />
      <Stack.Screen name="AIAssistant" component={AIAssistantScreen} />
      <Stack.Screen name="Submission" component={SubmissionScreen} />
      <Stack.Screen name="SearchResults" component={SearchResultsScreen} />
      <Stack.Screen name="ClaimTracking" component={ClaimTrackingScreen} />
      <Stack.Screen
        name="AllTrendingItems"
        component={AllTrendingItemsScreen as React.ComponentType<any>}
      />
      <Stack.Screen
        name="RareItemsMarketplace"
        component={RareItemsMarketplaceScreen as React.ComponentType<any>}
        options={{ title: 'Rare Items Marketplace' }}
      />
      <Stack.Screen name="Chat" component={ChatScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
    </Stack.Navigator>
  );
}
