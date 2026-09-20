// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  expoConfig,
  {
    ignores: [
      'dist/*',
      '.expo/*',
      'node_modules/*',
    ],
  },
  {
    rules: {
      // the codebase spreads things vertically on purpose, prettier owns layout
      'react-hooks/exhaustive-deps': 'warn',
    },
  },
]);
