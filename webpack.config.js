const path = require('path');

module.exports = {
  // 入口文件
  entry: './src/index.js',

  // 输出配置
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'index.js',
    libraryTarget: 'commonjs2',
  },

  // 模块配置
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
          },
        },
      },
    ],
  },

  // 目标环境
  target: 'node',

  // 模式
  mode: 'production',
};
