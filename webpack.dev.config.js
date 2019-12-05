const path = require("path");
const autoprefixer = require("autoprefixer");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
    mode: "development",
    devtool: "source-map",
    entry: "./src/index.ts",
    output: {
        path: path.join(__dirname, "dist/"),
        filename: "js/main.js"
    },
    resolve: {
        extensions: [".ts", ".js"]
    },
    devServer: {
        contentBase: path.join(__dirname, "dist/"),
        historyApiFallback: true
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: "src/index.html",
        })
    ],
    module: {
        rules: [{
                test: /\.ts$/,
                loader: "awesome-typescript-loader"
            }
        ]
    }
};