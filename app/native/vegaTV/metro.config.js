const path = require('path');
const {getDefaultConfig, mergeConfig} = require('@react-native/metro-config');
module.exports = mergeConfig(getDefaultConfig(__dirname), {
  watchFolders: [
    path.resolve(__dirname, '../../src/features/tv-learning/vega'),
  ],
  resolver: {nodeModulesPaths: [path.resolve(__dirname, 'node_modules')]},
});
