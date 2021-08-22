const ReactRefreshTypeScript = require('react-refresh-typescript');
const path = require('path');

const isDevelopment = process.env.NODE_ENV !== 'production';

module.exports = {
    mode: isDevelopment ? 'development' : 'production',
    entry: './src/main/index.ts',
    output: {
        path: path.resolve(__dirname, 'webpack/main/'),
    },
    target: 'electron-main',
    module: {
        rules: [
            ...require('./webpack.rules'),
            {
                test: /\.tsx?$/,
                exclude: /(node_modules|\.webpack)/,
                use: {
                    loader: 'ts-loader',
                    options: {
                        getCustomTransformers: () => ({
                            before: isDevelopment ? [ReactRefreshTypeScript()] : [],
                        }),
                        transpileOnly: isDevelopment,
                    },
                },
            },
        ],
    },
    resolve: {
        alias: {
            'main': path.resolve(__dirname, './src/main'),
            'common': path.resolve(__dirname, './src/common'),
        },
        extensions: ['.js', '.ts', '.jsx', '.tsx', '.css', '.json']
    },
};
