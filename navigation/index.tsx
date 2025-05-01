import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from './types';

// Import your screens
import HomeScreen from '../screens/HomeScreen';
import ItemDetailsScreen from '../screens/ItemDetailsScreen';
import AIAssistantScreen from '../screens/AIAssistantScreen';
import AllItemsScreen from '../screens/AllItemsScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function Navigation() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
        <Stack.Screen
          name="ItemDetails"
          component={ItemDetailsScreen}
          options={{ title: 'Item Details' }}
        />
        <Stack.Screen
          name="AIAssistant"
          component={AIAssistantScreen}
          options={{ title: 'AI Assistant' }}
        />
        <Stack.Screen name="AllItems" component={AllItemsScreen} options={{ title: 'All Items' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
