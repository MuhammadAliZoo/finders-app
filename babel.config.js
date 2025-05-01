module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      'react-native-reanimated/plugin',
      '@babel/plugin-transform-export-namespace-from',
      ['module-resolver', {
        root: ['.'],
        alias: {
          '@': '.',
          'buffer': '@craftzdog/react-native-buffer',
          'http': './polyfills/empty.js',
          'https': './polyfills/empty.js',
          'net': './polyfills/empty.js',
          'tls': './polyfills/empty.js',
          'fs': './polyfills/empty.js',
          'path': './polyfills/empty.js',
          'zlib': './polyfills/empty.js'
        },
        extensions: [
          '.ios.ts',
          '.android.ts',
          '.ts',
          '.ios.tsx',
          '.android.tsx',
          '.tsx',
          '.jsx',
          '.js',
          '.json',
          '.cjs',
          '.mjs'
        ],
      }],
      ["module:react-native-dotenv", {
        "moduleName": "@env",
        "path": ".env",
        "blacklist": null,
        "whitelist": null,
        "safe": false,
        "allowUndefined": true
      }]
    ],
  };
}; 