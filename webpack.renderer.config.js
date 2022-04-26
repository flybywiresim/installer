const path = require('path');
const rules = require('./webpack.rules');
const devRules = require('./webpack.dev.rules');
const plugins = require('./webpack.plugins');
const HtmlWebpackPlugin = require("html-webpack-plugin");

rules.push({
    test: /\.s?css$/,
    use: [
        {
            loader: 'style-loader'
        },
        {
            loader: 'css-loader'
        },
        {
            loader: "postcss-loader",
            options: {
                postcssOptions: {
                    use: {
                        sass: {},
                    },
                    plugins: [require('postcss-import'), require('@csstools/postcss-sass'), require("tailwindcss")],
                },
            },
        },
    ],
});

module.exports = {
    entry: './src/renderer/index.tsx',
    output: {
        path: path.resolve(__dirname, 'webpack/renderer/'),
        filename: 'renderer.js',
    },
    target: 'electron-renderer',
    module: {
        rules: [...rules, ...devRules],
    },
    plugins: [
        ...plugins,
        new HtmlWebpackPlugin({
            template: 'index.html',
        }),
    ],
    resolve: {
        alias: {
            'renderer': path.resolve(__dirname, './src/renderer'),
            'common': path.resolve(__dirname, './src/common'),
        },
        extensions: ['.js', '.ts', '.jsx', '.tsx', '.css']
    },
};
