// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('@expo/metro-config');

module.exports = async () => {
  const defaultConfig = await getDefaultConfig(__dirname);

const config = {
  ...defaultConfig,
  resolver: {
    ...defaultConfig.resolver,
      sourceExts: [...defaultConfig.resolver.sourceExts, 'mjs', 'cjs'],
      assetExts: [...defaultConfig.resolver.assetExts],
      platforms: ['ios', 'android', 'web'],
    extraNodeModules: {
        'stream': 'stream-browserify',
        'crypto': 'react-native-get-random-values',
        'buffer': '@craftzdog/react-native-buffer',
        'process': 'process/browser',
        'events': 'events',
        'url': 'react-native-url-polyfill'
      },
      hermesParser: true
  },
  transformer: {
    ...defaultConfig.transformer,
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: true,
          unstable_disableES6Transforms: false,
      },
    }),
      hermesParser: true
    }
};

  return config;
}; 