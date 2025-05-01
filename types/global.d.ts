declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: 'development' | 'production' | 'test';
      EXPO_DEV_SERVER_ORIGIN?: string;
      EXPO_ROUTER_IMPORT_MODE?: string;
      EXPO_ROUTER_ABS_APP_ROOT?: string;
      EXPO_ROUTER_APP_ROOT?: string;
      EXPO_BASE_URL?: string;
      EXPO_OS?: string;
      [key: string]: string | undefined;
    }
  }
}

export {}; 