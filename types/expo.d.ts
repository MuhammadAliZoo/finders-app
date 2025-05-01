import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';

declare global {
  interface ExpoGlobal extends ExpoObject {
    /**
     * Host object that is used to access native Expo modules.
     */
    modules: Record<string, any>;

    // Utils

    /**
     * Generates a random UUID v4 string.
     */
    uuidv4(): string;

    /**
     * Generates a UUID v5 string representation of the value in the specified namespace.
     */
    uuidv5(name: string, namespace: string): string;

    /**
     * Returns a static view config of the native view with the given name
     * or `null` if the view has not been registered.
     */
    getViewConfig(viewName: string): ViewConfig | null;

    /**
     * Reloads the app.
     */
    reloadAppAsync(reason: string): Promise<void>;
  }

  interface ViewConfig {
    validAttributes: Record<string, any>;
    directEventTypes: Record<string, { registrationName: string }>;
  }

  interface ExpoProcessEnv {
    NODE_ENV: string;
    /** Used in `@expo/metro-runtime`. */
    EXPO_DEV_SERVER_ORIGIN?: string;

    EXPO_ROUTER_IMPORT_MODE?: string;
    EXPO_ROUTER_ABS_APP_ROOT?: string;
    EXPO_ROUTER_APP_ROOT?: string;

    /** Maps to the `experiments.baseUrl` property in the project Expo config. */
    EXPO_BASE_URL?: string;

    /** Build-time representation of the `Platform.OS` value. */
    EXPO_OS?: string;

    [key: string]: any;
  }

  interface ExpoProcess {
    env: ExpoProcessEnv;
    [key: string]: any;
  }

  namespace NodeJS {
    interface ProcessEnv extends ExpoProcessEnv {}
    interface Process extends ExpoProcess {
      env: ProcessEnv;
    }
  }

  var expo: ExpoGlobal;
  var process: NodeJS.Process;
  var ExpoDomWebView: Record<string, any> | undefined;
}

// Example image compression function for Expo Go
export const compressImage = async (uri: string): Promise<string> => {
  try {
    const result = await manipulateAsync(
      uri,
      [{ resize: { width: 1024 } }],
      { compress: 0.7, format: SaveFormat.JPEG }
    );
    return result.uri;
  } catch (error) {
    console.error('Error compressing image:', error);
    return uri; // Return original URI if compression fails
  }
}; 