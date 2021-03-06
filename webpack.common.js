const path = require('path');
const nodeExternals = require('webpack-node-externals');

module.exports = {
    output: {
        filename: 'server.js',
        path: path.resolve(__dirname, 'dist')
    },
    entry: [path.join(__dirname, 'src')],
    resolve: {
        extensions: ['.js']
    },
    externals: [nodeExternals()],
    target: 'node'
}