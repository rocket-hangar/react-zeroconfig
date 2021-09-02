import { Configuration, HotModuleReplacementPlugin } from 'webpack';

export const WATCH_DEV_CONFIG: Configuration = {
  mode: 'development',
  devtool: 'source-map',

  performance: {
    hints: false,
  },

  optimization: {
    removeAvailableModules: false,
    removeEmptyChunks: false,
    splitChunks: false,

    moduleIds: 'named',
    emitOnErrors: false,
  },
};

export const BUILD_CONFIG: Configuration = {
  mode: 'production',
  devtool: 'source-map',
};

export const SERVER_DEV_CONFIG: Configuration = {
  mode: 'development',
  devtool: 'eval-cheap-module-source-map',

  plugins: [new HotModuleReplacementPlugin()],

  performance: {
    hints: false,
  },

  optimization: {
    removeAvailableModules: false,
    removeEmptyChunks: false,
    splitChunks: false,

    moduleIds: 'named',
    emitOnErrors: false,
  },
};
