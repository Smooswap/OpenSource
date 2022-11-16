const path = require('path')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const pkg = require('../package.json')
const webpack = require('webpack')
const TerserPlugin = require('terser-webpack-plugin');
const SentryCliPlugin = require('@sentry/webpack-plugin');


module.exports = {
  mode: "production", // "production" | "development" | "none"
  entry: path.resolve(__dirname, '../src/index.tsx'), // string | object | array
  output: {
    path: path.resolve(__dirname, "../dist"), // string (default)
    filename: '[name].[contenthash].js'
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx|ts|tsx)$/,
        use: [
          {
            loader: 'esbuild-loader',
            options: {
              loader: 'tsx',
              target: 'es2015',
            },
          }
        ]
      },
      {
        test: /\.worker\.(c|m)?js$/i,
        loader: "worker-loader",
        options: {
          // esModule: false,
          inline: 'fallback'
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
              esModule: true,
              modules: {
                mode: 'local',
                auto: true,
                exportGlobals: true,
                localIdentName:
                    '[path][name]__[local]--[hash:base64:5]',
                localIdentContext: path.resolve(
                    __dirname,
                    'src'
                ),
                localIdentHashSalt: 'my-custom-hash',
                namedExport: true,
                exportLocalsConvention: 'camelCase',
                exportOnlyLocals: false,
              },
            }
          },
          { loader: 'less-loader' }
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
    ],
  },
  resolve: {
    extensions: ['.ts', '.tsx', ".js", ".json", ".jsx", ".css"],
  },
  devtool: 'source-map',
  context: path.join(__dirname, '../'),
  target: ['web'],
  stats: 'normal',
  experiments: {
    asyncWebAssembly: true,
    // WebAssembly as async module (Proposal)
    syncWebAssembly: true,
    // WebAssembly as sync module (deprecated)
    topLevelAwait: true,
    // Allow to use await on module evaluation (Proposal)
  },
  plugins: [
    new CleanWebpackPlugin(),
    new HtmlWebpackPlugin({
      template: '/public/index.html'
    }), 
    new MiniCssExtractPlugin(),
    new webpack.BannerPlugin({
      entryOnly: true,
      banner: () => `
      MCM Version:${pkg.version} 
      Publish time: ${new Date().toString()}, 
      file:[file]
      `
    }),
    new SentryCliPlugin({
      release:`${pkg.name}@${pkg.version}`,
      include: "./dist",
      ignoreFile: ".sentrycliignore",
      ignore: ["node_modules", "webpack.config.js"],
      configFile: './.sentryclirc', 
      // urlPrefix:"http://localhost:8081/"
    }),
  ],
  // list of additional plugins
  optimization: {
    chunkIds: "size",
    // method of generating ids for chunks
    moduleIds: "size",
    // method of generating ids for modules
    mangleExports: "size",
    // rename export names to shorter names
    minimize: true,
    minimizer: [new TerserPlugin({
      extractComments: false,
    })],
    concatenateModules: false,
    providedExports: false,
    usedExports: true 
  },
  performance: {
    hints: "warning",
    maxAssetSize: 1000000,
    maxEntrypointSize: 1000000
  }
}
