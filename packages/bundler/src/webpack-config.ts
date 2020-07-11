import fs from "fs";
import os from "os";
import path from "path";
import webpack from "webpack";

const ErrorOverlayPlugin = require("@webhotelier/webpack-fast-refresh/error-overlay");
const ReactRefreshPlugin = require("@webhotelier/webpack-fast-refresh");

const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "react-motion-graphics"));

export const webpackConfig = (
  entry: string
): webpack.Configuration & {
  devServer: any;
} => ({
  entry: [
    path.resolve(
      __dirname,
      "..",
      "node_modules",
      "webpack-hot-middleware/client"
    ),
    "@webhotelier/webpack-fast-refresh/runtime.js",
    entry,
  ],
  mode: "development",
  plugins: [
    new ReactRefreshPlugin(),
    new ErrorOverlayPlugin(),
    new webpack.HotModuleReplacementPlugin(),
  ],
  output: {
    filename: "bundle.js",
    publicPath: "/",
    path: tmpDir,
  },
  devServer: {
    contentBase: path.resolve(__dirname, "..", "web"),
    historyApiFallback: {
      index: "index.html",
    },
    hot: true,
  },
  resolve: {
    extensions: [".ts", ".tsx", ".js"],
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: [
          {
            loader: "babel-loader",
            options: {
              presets: [
                "@babel/preset-env",
                "@babel/preset-react",
                [
                  "@babel/preset-typescript",
                  {
                    runtime: "automatic",
                    isTSX: true,
                    allExtensions: true,
                  },
                ],
              ],
              plugins: ["react-refresh/babel"],
            },
          },
          { loader: "@webhotelier/webpack-fast-refresh/loader.js" },
        ],
      },
    ],
  },
});
