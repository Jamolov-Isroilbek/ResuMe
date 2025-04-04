// craco.config.js
const path = require("path");

module.exports = {
  webpack: {
    alias: {
      "@": path.resolve(__dirname, "src/"),
      "@app": path.resolve(__dirname, "src/app"),
      "@features": path.resolve(__dirname, "src/features"),
      "@lib": path.resolve(__dirname, "src/lib"),
      "@providers": path.resolve(__dirname, "src/providers"),
      "@types": path.resolve(__dirname, "src/types"),
    },
    configure: (webpackConfig) => {
      // webpackConfig.entry = path.resolve(__dirname, "src/app/index.tsx");
      webpackConfig.plugins.forEach(plugin => {
        if (plugin.constructor.name === 'HtmlWebpackPlugin') {
          plugin.userOptions.template = path.resolve(__dirname, 'public/index.html');
        }
      });
      webpackConfig.output = {
        ...webpackConfig.output,
        publicPath: '/'
      };
      webpackConfig.resolve = {
        ...webpackConfig.resolve,
        extensions: [".ts", ".tsx", ".js", ".json"],
        fallback: {
          ...webpackConfig.resolve?.fallback,
        },
      };
      return webpackConfig;
    },
  },
  devServer: {
    historyApiFallback: true,
  },
  jest: {
    configure: {
      moduleNameMapper: {
        "^@/(.*)$": "<rootDir>/src/$1",
        "^@app/(.*)$": "<rootDir>/src/app/$1",
        "^@features/(.*)$": "<rootDir>/src/features/$1",
        "^@lib/(.*)$": "<rootDir>/src/lib/$1",
        "^@providers/(.*)$": "<rootDir>/src/providers/$1",
        "^@types/(.*)$": "<rootDir>/src/types/$1",
      },
    },
  },
};
