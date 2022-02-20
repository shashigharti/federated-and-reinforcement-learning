const webpack = require("webpack");
const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const dotenv = require("dotenv");

// call dotenv and it will return an Object with a parsed key
const env = dotenv.config().parsed;

if (env == null) {
  console.log("ENV not set. Create a .env file in the root folder \n\n");
  return false;
}

// reduce it to a nice object, the same as before
const envKeys = Object.keys(env).reduce((prev, next) => {
  prev[`process.env.${next}`] = JSON.stringify(env[next]);
  return prev;
}, {});

module.exports = (env, argv) => ({
  mode: argv.mode,
  entry: ["regenerator-runtime/runtime", "./index.js"],
  output: {
    publicPath: "/",
    path: path.join(__dirname, "/dist"),
    filename: "index.bundle.js",
  },
  devtool: argv.mode === "development" ? "eval-source-map" : "source-map",
  devServer: {
    port: 8080,
    hot: true,
    open: true,
    stats: {
      children: false, // Hide children information
      maxModules: 0, // Set the maximum number of modules to be shown
    },
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            presets: ["@babel/preset-env", "@babel/preset-react"],
            plugins: ["@babel/plugin-proposal-class-properties"],
          },
        },
      },
      {
        test: /\.svg$/,
        use: [
          {
            loader: "svg-url-loader",
            options: {
              limit: 10000,
            },
          },
        ],
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({ template: "./index.html" }),
    new webpack.DefinePlugin(envKeys),
  ],
  externals: {
    "@tensorflow/tfjs-core": "tf",
  },
  devServer: {
    historyApiFallback: true,
    contentBase: "./",
    hot: true,
  },
});
