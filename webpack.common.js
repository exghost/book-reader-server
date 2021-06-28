const path = require('path');

module.exports = {
    output: {
        filename: 'server.js',
        path: path.resolve(__dirname, 'dist')
    },
    entry: [path.join(__dirname, 'src')],
    resolve: {
        extensions: ['.js']
    },
    target: 'node'
}