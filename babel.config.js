module.exports = {
  presets: ['@babel/preset-env', '@babel/preset-react'],
  plugins: [
    '@babel/plugin-transform-modules-commonjs',
    // Note: @babel/plugin-proposal-class-properties is now included in @babel/preset-env
  ],
};
