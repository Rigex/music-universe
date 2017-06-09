const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
// const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: { presets: ['es2015', 'es2016'] }
        }
      },
      {
        test: /\.js$/,
        exclude: /(node_modules|helpers)/,
        use: {
          loader: 'eslint-loader'
        }
      },
      {test: /\.(pug|jade)$/, loader: 'pug-loader', options: { pretty: true}},
      {
        test: /\.(styl|css)$/,
        loader: 'style-loader!css-loader!stylus-loader'
      },
      {test: /\.jpe?g$|\.gif$|\.png$|\.svg$|\.woff$|\.ttf$|\.wav$|\.mp3$/, loader: "file-loader?name=[name].[ext]?[hash]"}
    ]
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new HtmlWebpackPlugin({
      template: 'src/index.pug'
    })
    // new CopyWebpackPlugin([
    //   { from: './src/assets', to: './assets' }
    // ])
  ],
  devServer: {
    contentBase: path.join(__dirname, "dist"),
    compress: true,
    port: 8000,
    hot: true,
    stats: 'errors-only'
  },
  devtool: 'cheap-inline-module-source-map'
};
