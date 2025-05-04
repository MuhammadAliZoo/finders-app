// Ensure polyfills are loaded first
import './polyfills';

// Import dependencies after polyfills
import { registerRootComponent } from 'expo';
import App from './App';

// Register the app immediately (no setTimeout)
registerRootComponent(App); 