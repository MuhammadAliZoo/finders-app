import React, { createContext, useContext, useEffect, useState } from 'react';
import { Alert, Linking, Platform } from 'react-native';
import { RESULTS } from 'react-native-permissions';
import {
  REQUIRED_PERMISSIONS,
  checkAllPermissions,
  requestAllPermissions,
} from '../utils/permissions';

interface PermissionState {
  camera: boolean;
  microphone: boolean;
  photoLibrary: boolean;
  locationWhenInUse: boolean;
  locationAlways: boolean;
}

interface PermissionsContextType {
  permissions: PermissionState;
  checkPermissions: () => Promise<void>;
  requestPermissions: () => Promise<void>;
}

const DEFAULT_PERMISSIONS: PermissionState = {
  camera: false,
  microphone: false,
  photoLibrary: false,
  locationWhenInUse: false,
  locationAlways: false,
};

const PermissionsContext = createContext<PermissionsContextType | undefined>(undefined);

export const usePermissions = () => {
  const context = useContext(PermissionsContext);
  if (!context) {
    throw new Error('usePermissions must be used within a PermissionsProvider');
  }
  return context;
};

export const PermissionsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [permissions, setPermissions] = useState<PermissionState>(DEFAULT_PERMISSIONS);

  const checkPermissions = async () => {
    try {
      const statuses = await checkAllPermissions();
      
      setPermissions({
        camera: statuses[REQUIRED_PERMISSIONS.camera] === RESULTS.GRANTED,
        microphone: statuses[REQUIRED_PERMISSIONS.microphone] === RESULTS.GRANTED,
        photoLibrary: statuses[REQUIRED_PERMISSIONS.photoLibrary] === RESULTS.GRANTED,
        locationWhenInUse: statuses[REQUIRED_PERMISSIONS.locationWhenInUse] === RESULTS.GRANTED,
        locationAlways: statuses[REQUIRED_PERMISSIONS.locationAlways] === RESULTS.GRANTED,
      });
    } catch (error) {
      console.error('Error checking permissions:', error);
    }
  };

  const requestPermissions = async () => {
    try {
      const statuses = await requestAllPermissions();
      
      const newPermissions = {
        camera: statuses[REQUIRED_PERMISSIONS.camera] === RESULTS.GRANTED,
        microphone: statuses[REQUIRED_PERMISSIONS.microphone] === RESULTS.GRANTED,
        photoLibrary: statuses[REQUIRED_PERMISSIONS.photoLibrary] === RESULTS.GRANTED,
        locationWhenInUse: statuses[REQUIRED_PERMISSIONS.locationWhenInUse] === RESULTS.GRANTED,
        locationAlways: statuses[REQUIRED_PERMISSIONS.locationAlways] === RESULTS.GRANTED,
      };

      setPermissions(newPermissions);

      // Check if any permission was denied
      const deniedPermissions = Object.entries(newPermissions)
        .filter(([_, granted]) => !granted)
        .map(([key]) => key);

      if (deniedPermissions.length > 0) {
        Alert.alert(
          'Permissions Required',
          `The following permissions are required for the app to function properly: ${deniedPermissions.join(', ')}`,
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Open Settings',
              onPress: () => Linking.openSettings(),
            },
          ]
        );
      }
    } catch (error) {
      console.error('Error requesting permissions:', error);
    }
  };

  useEffect(() => {
    checkPermissions();
  }, []);

  return (
    <PermissionsContext.Provider
      value={{
        permissions,
        checkPermissions,
        requestPermissions,
      }}
    >
      {children}
    </PermissionsContext.Provider>
  );
}; 