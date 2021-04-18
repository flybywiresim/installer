const Webpack = require('webpack');
const WebpackDevServer = require('webpack-dev-server');

/** @type webpack.Configuration */
const WebpackMainConfig = require('./webpack.main.config');

/** @type webpack.Configuration */
const WebpackRendererConfig = require('./webpack.renderer.config');

function makeWds(/** webpack.Configuration */ webpackConfig, /** string */ name) {
    const compiler = Webpack({ ...webpackConfig, stats: 'errors-only' });

    compiler.hooks.done.tap('fbwInstallerDev', () => {
        console.log(`${name} WDS done`);
    });

    return new WebpackDevServer(compiler, { stats: 'errors-only', noInfo: true });
}

const mainWds = makeWds(WebpackMainConfig, 'main');
const rendererWds = makeWds(WebpackRendererConfig, 'renderer');

mainWds.listen(8080, '127.0.0.1', () => {
    console.log('main WDS started on 127.0.0.1:8080');
});

rendererWds.listen(8081, '127.0.0.1', () => {
    console.log('renderer WDS started on 127.0.0.1:8081');
});
