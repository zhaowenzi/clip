import type { Configuration } from "webpack";
import path from "path";
import { rules } from "./webpack.rules";
import { plugins } from "./webpack.plugins";

rules.push({
  test: /\.(png|jpe?g|gif|svg)$/,
  type: "asset/resource",
  generator: {
    filename: "assets/[hash][ext][query]",
  },
});

export const mainConfig: Configuration = {
  entry: "./src/index.ts",
  module: {
    rules,
  },
  plugins,
  resolve: {
    extensions: [".js", ".ts", ".jsx", ".tsx", ".css", ".json"],
  },
  output: {
    path: path.resolve(__dirname, ".webpack/main"),
    filename: "index.js",
  },
};
