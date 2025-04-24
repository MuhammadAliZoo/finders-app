import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { FirebaseProvider } from './context/FirebaseContext';
import { SocketProvider } from './context/SocketContext';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, Text } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Provider as PaperProvider } from 'react-native-paper';
import * as SplashScreen from 'expo-splash-screen';
import { useCallback } from 'react';
import { Platform } from 'react-native';
import { RootStackParamList } from './navigation/types';
import {
  useFonts,
  Poppins_400Regular as PoppinsRegular,
  Poppins_500Medium as PoppinsMedium,
  Poppins_600SemiBold as PoppinsSemiBold,
  Poppins_700Bold as PoppinsBold,
} from '@expo-google-fonts/poppins';
import { useFirebase } from './context/FirebaseContext';

// Import screens
import { HomeScreen } from './screens/HomeScreen';
import LoginScreen from './screens/auth/LoginScreen';
import SignupScreen from './screens/auth/SignupScreen';
import ProfileScreen from './screens/ProfileScreen';
import SettingsScreen from './screens/SettingsScreen';
import { ChatScreen } from './screens/ChatScreen';
import { FirebaseTest } from './screens/FirebaseTest';

const Stack = createNativeStackNavigator<RootStackParamList>();

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

function AppContent() {
  const [fontsLoaded] = useFonts({
    'Poppins-Regular': PoppinsRegular,
    'Poppins-Medium': PoppinsMedium,
    'Poppins-SemiBold': PoppinsSemiBold,
    'Poppins-Bold': PoppinsBold,
  });

  const { isInitialized, error } = useFirebase();

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded && isInitialized) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded, isInitialized]);

  if (!fontsLoaded || !isInitialized) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Error initializing app: {error.message}</Text>
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }} onLayout={onLayoutRootView}>
      <SafeAreaProvider>
        <PaperProvider>
          <NavigationContainer>
            <Stack.Navigator
              initialRouteName="Home"
              screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: '#FFFFFF' },
              }}
            >
              <Stack.Screen name="Home" component={HomeScreen} />
              <Stack.Screen name="Auth" component={LoginScreen} />
              <Stack.Screen name="Signup" component={SignupScreen} />
              <Stack.Screen name="Profile" component={ProfileScreen} />
              <Stack.Screen name="Settings" component={SettingsScreen} />
              <Stack.Screen name="FirebaseTest" component={FirebaseTest} />
              <Stack.Screen 
                name="Chat" 
                component={ChatScreen}
                initialParams={{
                  conversationId: '',
                  otherUser: {
                    id: '',
                    displayName: '',
                    photoURL: null
                  },
                  item: undefined
                }}
              />
            </Stack.Navigator>
            <StatusBar style="auto" />
          </NavigationContainer>
        </PaperProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

export default function App() {
  return (
    <FirebaseProvider>
      <SocketProvider>
        <AppContent />
      </SocketProvider>
    </FirebaseProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  loadingText: {
    fontSize: 18,
    color: '#000000',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#FFFFFF',
  },
  errorText: {
    textAlign: 'center',
    color: 'red',
    fontSize: 16,
  },
});

