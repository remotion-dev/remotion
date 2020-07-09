const fs = require("fs");
const os = require("os");
const path = require("path");

const ErrorOverlayPlugin = require("@webhotelier/webpack-fast-refresh/error-overlay");
const ReactRefreshPlugin = require("@webhotelier/webpack-fast-refresh");

const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "react-motion-graphics"));

module.exports = {
  entry: ["@webhotelier/webpack-fast-refresh/runtime.js", "./src/entry.tsx"],
  mode: "development",
  plugins: [new ReactRefreshPlugin(), new ErrorOverlayPlugin()],
  output: {
    filename: "bundle.js",
    path: tmpDir,
  },
  devServer: {
    contentBase: "./web",
    hot: true,
    historyApiFallback: {
      index: "index.html",
    },
  },
  resolve: {
    extensions: [".ts", ".tsx", ".js"],
  },
  module: {
    rules: [
      {
        test: /\.tsx$/,
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
};
