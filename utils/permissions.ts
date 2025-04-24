import { Platform } from 'react-native';
import {
  PERMISSIONS,
  Permission,
  PermissionStatus,
  check,
  checkMultiple,
  request,
  requestMultiple,
} from 'react-native-permissions';

export const REQUIRED_PERMISSIONS = Platform.select({
  ios: {
    camera: PERMISSIONS.IOS.CAMERA,
    microphone: PERMISSIONS.IOS.MICROPHONE,
    photoLibrary: PERMISSIONS.IOS.PHOTO_LIBRARY,
    locationWhenInUse: PERMISSIONS.IOS.LOCATION_WHEN_IN_USE,
    locationAlways: PERMISSIONS.IOS.LOCATION_ALWAYS,
  },
  android: {
    camera: PERMISSIONS.ANDROID.CAMERA,
    microphone: PERMISSIONS.ANDROID.RECORD_AUDIO,
    photoLibrary: PERMISSIONS.ANDROID.READ_MEDIA_IMAGES,
    locationWhenInUse: PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
    locationAlways: PERMISSIONS.ANDROID.ACCESS_BACKGROUND_LOCATION,
  },
}) as { [key: string]: Permission };

export const checkPermission = async (permission: Permission): Promise<PermissionStatus> => {
  try {
    return await check(permission);
  } catch (error) {
    console.error('Error checking permission:', error);
    return 'denied';
  }
};

export const requestPermission = async (permission: Permission): Promise<PermissionStatus> => {
  try {
    return await request(permission);
  } catch (error) {
    console.error('Error requesting permission:', error);
    return 'denied';
  }
};

export const checkAllPermissions = async (): Promise<{ [key: string]: PermissionStatus }> => {
  try {
    const permissions = Object.values(REQUIRED_PERMISSIONS);
    return await checkMultiple(permissions);
  } catch (error) {
    console.error('Error checking multiple permissions:', error);
    return {};
  }
};

export const requestAllPermissions = async (): Promise<{ [key: string]: PermissionStatus }> => {
  try {
    const permissions = Object.values(REQUIRED_PERMISSIONS);
    return await requestMultiple(permissions);
  } catch (error) {
    console.error('Error requesting multiple permissions:', error);
    return {};
  }
}; 