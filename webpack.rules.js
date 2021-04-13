module.exports = [
    // Add support for native node modules
    {
        test: /\.node$/,
        use: 'node-loader',
    },
    {
        test: /\.(m?js|node)$/,
        parser: { amd: false },
        use: {
            loader: '@marshallofsound/webpack-asset-relocator-loader',
            options: {
                outputAssetBase: 'native_modules',
            },
        },
    },
    {
        test: /\.tsx?$/,
        exclude: /(node_modules|\.webpack)/,
        use: {
            loader: 'ts-loader',
            options: {
                transpileOnly: true
            }
        }
    },
    {
        test: /\.less$/,
        use: [{
            loader: 'style-loader',
        }, {
            loader: 'css-loader',
        }, {
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
        test: /\.svg$/,
        use: ['@svgr/webpack', 'url-loader'],
    },
    {
        test: /\.md$/i,
        use: 'raw-loader'
    },
    {
      test: /\.(png|jpg|gif)$/i,
      use: 'url-loader'
    },
];
