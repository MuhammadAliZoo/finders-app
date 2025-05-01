declare module 'expo-splash-screen' {
  export function preventAutoHideAsync(): Promise<void>;
  export function hideAsync(): Promise<void>;
}

declare module '@expo-google-fonts/poppins' {
  export const useFonts: (fonts: Record<string, any>) => [boolean, Error | null];
  export const Poppins_400Regular: any;
  export const Poppins_500Medium: any;
  export const Poppins_600SemiBold: any;
  export const Poppins_700Bold: any;
}

declare module 'expo-image-picker' {
  export interface ImagePickerResult {
    canceled: boolean;
    assets: Array<{
      uri: string;
      width: number;
      height: number;
      type?: string;
      fileName?: string;
      fileSize?: number;
    }>;
  }

  export interface ImagePickerOptions {
    mediaTypes: MediaTypeOptions;
    allowsEditing?: boolean;
    aspect?: [number, number];
    quality?: number;
  }

  export enum MediaTypeOptions {
    All = 'All',
    Videos = 'Videos',
    Images = 'Images',
  }

  export function launchImageLibraryAsync(options?: ImagePickerOptions): Promise<ImagePickerResult>;
  export function launchCameraAsync(options?: ImagePickerOptions): Promise<ImagePickerResult>;
  export function requestMediaLibraryPermissionsAsync(): Promise<{ status: string }>;
  export function requestCameraPermissionsAsync(): Promise<{ status: string }>;
}

declare module 'react-native-gesture-handler' {
  export const GestureHandlerRootView: React.ComponentType<any>;
}

declare module 'react-native-paper' {
  export const Provider: React.ComponentType<any>;
}

declare module 'expo-modules-core' {
  export interface EventEmitter {
    addListener(eventName: string, listener: (...args: any[]) => void): void;
    removeListener(eventName: string, listener: (...args: any[]) => void): void;
    emit(eventName: string, ...args: any[]): void;
  }

  export interface NativeModule {
    [key: string]: any;
  }

  export interface SharedObject {
    [key: string]: any;
  }

  export interface SharedRef {
    [key: string]: any;
  }
}

declare global {
  interface ExpoObject {
    modules: Record<string, any>;
    EventEmitter: typeof import('expo-modules-core').EventEmitter;
    NativeModule: typeof import('expo-modules-core').NativeModule;
    SharedObject: typeof import('expo-modules-core').SharedObject;
    SharedRef: typeof import('expo-modules-core').SharedRef;
  }

  var expo: ExpoObject;
} 