module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      ['module-resolver', {
        root: ['./'],
        alias: {
          '@': './',
          '@components': './components',
          '@screens': './screens',
          '@utils': './utils',
        },
      }],
      ["module:react-native-dotenv", {
        "moduleName": "@env",
        "path": ".env",
        "blocklist": null,
        "allowlist": null,
        "safe": false,
        "allowUndefined": true,
        "verbose": false
      }],
      'react-native-reanimated/plugin'
    ],
    env: {
      production: {
        plugins: ['transform-remove-console'],
      },
    }
  };
}; 