const path = require('path');
const rules = require('./webpack.rules');
const plugins = require('./webpack.plugins');

rules.push({
    test: /\.css$/,
    use: [
        { loader: 'style-loader' },
        { loader: 'css-loader' },
        {
            loader: "postcss-loader",
            options: {
                postcssOptions: {
                    use: {
                        sass: {},
                    },
                    plugins: [require("tailwindcss"),],
                },
            },
        },
    ],
});

module.exports = {
    module: {
        rules,
    },
    plugins: plugins,
    resolve: {
        alias: {
            'renderer': path.resolve(__dirname, './src/renderer'),
            'common': path.resolve(__dirname, './src/common'),
        },
        extensions: ['.js', '.ts', '.jsx', '.tsx', '.css']
    },
};
