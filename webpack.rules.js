module.exports = [
    {
        test: /\.node$/,
        use: 'node-loader',
    },
    {
        test: /\.less$/,
        use: [
            {
                loader: 'style-loader',
            }, {
                loader: 'css-loader',
            },
            {
                loader: 'less-loader',
                options: {
                    lessOptions: {
                        modifyVars: {
                            'primary-color': '#6e6e6e',
                        },
                        javascriptEnabled: true,
                    },
                },
            }],
    },
    {
        test: /\.md$/i,
        use: 'raw-loader',
    },
];
