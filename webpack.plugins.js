const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const { DuplicatesPlugin } = require("inspectpack/plugin");

module.exports = [
    new ForkTsCheckerWebpackPlugin(),
    new DuplicatesPlugin({
        emitErrors: true,
        verbose: true
    })
];
