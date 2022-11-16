const path = require('path')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const pkg = require('../package.json')

module.exports = {
  mode: 'development', // "production" | "development" | "none"
  entry: path.resolve(__dirname, '../src/index.tsx'), // string | object | array
  output: {
    path: path.resolve(__dirname, '../dist'), 
    filename: '[name].[contenthash].js'
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx|ts|tsx)$/,
        // include: path.resolve(__dirname, "src"),
        use: [
          {
            loader: 'esbuild-loader',
            options: {
              loader: 'tsx',
              target: 'es2015'
            }
          }
        ]
      },
      {
        test: /\.worker\.(c|m)?js$/i,
        loader: "worker-loader",
        options: {
          esModule: false,
          inline: false,
        },
      },
      {
        test: /\.txt$/i,
        use: [
          {
            loader: 'raw-loader',
            options: {
              esModule: false,
            },
          },
        ],
      },
      {
        test: /\.css|less$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
            options: {
              esModule: false
            }
          },
          {
            loader: 'css-loader',
            options: {
              modules: false
            }
          },
          { 
            loader: 'less-loader',
            options: {
              lessOptions: {
                javascriptEnabled: true
              }
            }
          }
        ]
      },
      {
        test: /\.(png|jpeg|jpg|gif|svg)$/,
        type: 'asset',
        parser: {
            dataUrlCondition: {
                maxSize: 10 * 1024
            }
        },
        generator: {
            filename: 'img/[name].[hash:6][ext]',
            publicPath: './'
        }
      },
    ]
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.json', '.jsx', '.css']
  },
  devtool: 'cheap-module-source-map',
  context: path.join(__dirname, '../'),
  target: ['web'],
  stats: 'normal',
  devServer: {
    static: path.join(__dirname, '../'), // boolean | string | array, static file location
    compress: true, // enable gzip compression
    historyApiFallback: true, // true for index.html upon 404, object for multiple paths
    hot: true, // hot module replacement. Depends on HotModuleReplacementPlugin
    https: false, // true for self-signed, object for cert authority
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './public/index.html',
      chunksSortMode: 'manual'
    }),
    new MiniCssExtractPlugin(),
    new CleanWebpackPlugin()
  ],
  // list of additional plugins
  optimization: {
    minimize: false,
    concatenateModules: false,
    providedExports: false,
    usedExports: true 
  }
}