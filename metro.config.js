// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('@react-native/metro-config');

module.exports = (async () => {
  const defaultConfig = await getDefaultConfig(__dirname);
  
  defaultConfig.resolver.extraNodeModules = {
    ...defaultConfig.resolver.extraNodeModules,
    stream: require.resolve('stream-browserify'),
    https: require.resolve('https-browserify'),
    assert: require.resolve('assert'),
    util: require.resolve('util/'),
    process: require.resolve('process/browser'),
    events: require.resolve('events/'),
    buffer: require.resolve('@craftzdog/react-native-buffer'),
    url: require.resolve('react-native-url-polyfill'),
    crypto: require.resolve('react-native-get-random-values'),
  };

  return defaultConfig;
})(); 