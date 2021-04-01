module.exports = [
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
    {
        test: /\.(png|jpg|gif|svg)$/i,
        use: 'url-loader',
    },
];
