// Initialize globalThis first
if (typeof globalThis === 'undefined') {
  global.globalThis = global;
}

// Initialize process before imports
if (!globalThis.process) {
  globalThis.process = {
    env: {},
    browser: true,
    version: '',
    versions: {},
    platform: 'react-native',
    nextTick: (callback) => setTimeout(callback, 0)
  };
}

// Core polyfills
import 'react-native-url-polyfill/auto';
import * as Crypto from 'react-native-get-random-values';
import { Buffer } from '@craftzdog/react-native-buffer';

// Initialize Buffer
if (!globalThis.Buffer) {
  globalThis.Buffer = Buffer;
}

// Initialize crypto
if (!globalThis.crypto) {
  globalThis.crypto = Crypto;
}

// Initialize setImmediate/clearImmediate
if (!globalThis.setImmediate) {
  globalThis.setImmediate = function setImmediate(callback, ...args) {
    const id = setTimeout(() => callback(...args), 0);
    return id;
  };
}

if (!globalThis.clearImmediate) {
  globalThis.clearImmediate = function clearImmediate(id) {
    clearTimeout(id);
  };
}

// Log initialization status
console.log('[Polyfills] Runtime initialization complete:', {
  globalThis: !!globalThis,
  process: !!globalThis.process,
  Buffer: !!globalThis.Buffer,
  crypto: !!globalThis.crypto,
  setImmediate: !!globalThis.setImmediate,
  clearImmediate: !!globalThis.clearImmediate
}); 