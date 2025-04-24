import React, { createContext, useContext, useState, useEffect } from 'react';
import { Alert } from 'react-native';
import * as Location from 'expo-location';

interface PermissionState {
  locationEnabled: boolean;
  backgroundLocationEnabled: boolean;
  loading: boolean;
  error: string | null;
}

interface PermissionContextType extends PermissionState {
  checkPermissions: () => Promise<void>;
  requestPermissions: () => Promise<void>;
}

const initialState: PermissionState = {
  locationEnabled: false,
  backgroundLocationEnabled: false,
  loading: true,
  error: null,
};

const PermissionsContext = createContext<PermissionContextType | undefined>(undefined);

export const PermissionsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<PermissionState>(initialState);

  const checkPermissions = async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      const foregroundStatus = await Location.getForegroundPermissionsAsync();
      const backgroundStatus = await Location.getBackgroundPermissionsAsync();

      setState(prev => ({
        ...prev,
        locationEnabled: foregroundStatus.granted,
        backgroundLocationEnabled: backgroundStatus.granted,
        loading: false,
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to check permissions',
      }));
    }
  };

  const requestPermissions = async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      // Request foreground location permission
      const { status: foregroundStatus } = await Location.requestForegroundPermissionsAsync();
      if (foregroundStatus !== 'granted') {
        Alert.alert(
          'Location Permission Required',
          'Please enable location services to use this feature.',
          [{ text: 'OK' }]
        );
        return;
      }

      // Request background location permission
      const { status: backgroundStatus } = await Location.requestBackgroundPermissionsAsync();
      if (backgroundStatus !== 'granted') {
        Alert.alert(
          'Background Location',
          'Background location access was not granted. Some features may be limited.',
          [{ text: 'OK' }]
        );
      }

      // Update state with new permission status
      setState(prev => ({
        ...prev,
        locationEnabled: foregroundStatus === 'granted',
        backgroundLocationEnabled: backgroundStatus === 'granted',
        loading: false,
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to request permissions',
      }));
      Alert.alert('Error', 'Failed to request location permissions');
    }
  };

  useEffect(() => {
    checkPermissions();
  }, []);

  const value = {
    ...state,
    checkPermissions,
    requestPermissions,
  };

  return (
    <PermissionsContext.Provider value={value}>
      {children}
    </PermissionsContext.Provider>
  );
};

export const usePermissions = () => {
  const context = useContext(PermissionsContext);
  if (context === undefined) {
    throw new Error('usePermissions must be used within a PermissionsProvider');
  }
  return context;
}; 