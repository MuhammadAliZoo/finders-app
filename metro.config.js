// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('@react-native/metro-config');

const defaultConfig = getDefaultConfig(__dirname);
const { resolver: { sourceExts, assetExts } } = defaultConfig;

const config = {
  ...defaultConfig,
  resolver: {
    ...defaultConfig.resolver,
    sourceExts: [...sourceExts, 'jsx', 'js', 'ts', 'tsx', 'json', 'cjs', 'mjs'],
    assetExts: [...assetExts],
    extraNodeModules: {
      ...defaultConfig.resolver.extraNodeModules,
      'base64-js': require.resolve('base64-js'),
      'buffer': require.resolve('buffer/'),
    },
  },
  transformer: {
    ...defaultConfig.transformer,
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: true,
      },
    }),
  },
};

module.exports = config; 