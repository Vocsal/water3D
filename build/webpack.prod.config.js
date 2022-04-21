const webpack = require('webpack');
const { merge } = require("webpack-merge");
const baseWebpackConfig = require('./webpack.config.js');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const TerserPlugin = require("terser-webpack-plugin");

module.exports = merge(baseWebpackConfig, {
    mode: 'production',
    // devtool: 'source-map',
    plugins: [
        new webpack.DefinePlugin({
            "process.env.NODE_ENV": JSON.stringify('production'),
        }),
    ],
    optimization: {
        minimizer: [
            new CssMinimizerPlugin(),
            new TerserPlugin(),
        ]
    }
})