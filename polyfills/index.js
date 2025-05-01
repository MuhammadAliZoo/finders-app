// Import polyfills
import 'react-native-url-polyfill/auto';
import 'react-native-get-random-values';

// URL polyfill
import { URL, URLSearchParams } from 'react-native-url-polyfill';
global.URL = URL;
global.URLSearchParams = URLSearchParams;

// Crypto polyfill
import { getRandomValues } from 'react-native-get-random-values';
global.crypto = {
  getRandomValues,
  // Use a minimal implementation for subtle
  subtle: {},
};

// Buffer polyfill
global.Buffer = require('@craftzdog/react-native-buffer').Buffer;

// Process polyfill
global.process = require('process');

// Other required polyfills
global.assert = require('assert');
global.stream = require('stream-browserify');
global.https = require('https-browserify'); 