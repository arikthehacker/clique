// babel-preset-expo (SDK 54+) adds the react-native-worklets plugin that
// react-native-reanimated 4 needs, so it is not listed here on purpose.
// AnimatedTabBar depends on reanimated; if worklets ever stop being picked up,
// add 'react-native-worklets/plugin' as the last entry of a plugins array.
module.exports = function (api) {
  api.cache(true);

  return {
    presets: ['babel-preset-expo'],
  };
};
