'use client';
import { useAuth } from '../context/AuthContext';
import AuthNavigator from './AuthNavigator';
import MainNavigator from './MainNavigator';
import AdminNavigator from './AdminNavigator';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavigator = () => {
  const { user, loading } = useAuth();
  const { colors } = useTheme();

  // Show loading screen while auth is initializing
  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors?.background || '#FFFFFF' }]}>
        <ActivityIndicator size="large" color={colors?.primary || '#007AFF'} />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!user ? (
        <Stack.Screen 
          name="Auth" 
          component={AuthNavigator}
          options={{
            animationTypeForReplace: !user ? 'pop' : 'push',
          }}
        />
      ) : (
        <Stack.Screen 
          name="Main" 
          component={MainNavigator}
          options={{
            animation: 'fade'
          }}
        />
      )}
    </Stack.Navigator>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default AppNavigator;
