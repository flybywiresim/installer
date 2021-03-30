const path = require('path');

module.exports = {
    entry: './src/main/index.ts',
    output: {
        path: path.resolve(__dirname, 'dist/main/'),
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
                        transpileOnly: true,
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
