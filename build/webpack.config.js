const path = require('path');
// const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const { merge } = require("webpack-merge");
const web3dWebpackConfig = require('./webpack.web3d.config.js')


module.exports = merge({
    entry: {
        index: './src/index.ts',
    },
    output: {
        filename: '[name].bundle.js',
        path: path.join(__dirname, '../dist'),
    },
    resolve: {
        extensions: [".js", ".json", ".jsx", ".ts", ".tsx", ".d.ts", ".css", ".sass", ".scss"],
        alias: {
            "src": path.resolve(__dirname, '../src/'),
            "#": path.resolve(__dirname, '../'),
            "node_modules": path.join(__dirname, '../node_modules/'),
        }
    },
    module: {
        rules: [
            {
                test: /\.m?js$/,
                exclude: /(node_modules|bower_components)/,
                use: [
                    'cache-loader',
                    'thread-loader',
                    {
                        loader: 'babel-loader?cacheDirectory',
                        options: {
                            presets: ['@babel/preset-env'],
                            plugins: ['@babel/plugin-transform-runtime']
                        }
                    }
                ],
            },
            {
                test: /\.css$/,
                use: [MiniCssExtractPlugin.loader, 'css-loader'],
            },
            {
                test: /\.s[ac]ss$/i,
                use: [MiniCssExtractPlugin.loader, 'css-loader', 'sass-loader'],
            },
            {
                test: /\.less$/i,
                use: [MiniCssExtractPlugin.loader, 'css-loader', 'less-loader'],
            },
            {
                test: /\.html$/,
                loader: 'html-loader',
            },
            {
                test: /\.(png|svg|jpg|gif)$/,
                use: ['file-loader', 'url-loader'],
            },
            {
                test: /\.(woff|woff2|eot|ttf|otf)$/,
                use: ['file-loader'],
            },
            {
                test: /\.(csv|tsv)$/,
                use: ['csv-loader'],
            },
            {
                test: /\.xml$/,
                use: ['xml-loader'],
            },
            {
                test: /\.tsx?$/,
                use: "ts-loader",
                exclude: /node_modules/
            },
        ]
    },
    plugins: [
        new HtmlWebpackPlugin({
            title: 'Webpack5 Demo',
        }),
        new MiniCssExtractPlugin(),
        new CleanWebpackPlugin(),
        // new webpack.optimize.CommonsChunkPlugin({
        //     name: 'common'
        // })
    ],
}, web3dWebpackConfig)