const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const { merge } = require('webpack-merge');
const path = require('path');

const common = require('./webpack.common');

module.exports = merge(common, {
    devtool: 'inline-source-map',
    mode: 'development',
    plugins: [new CleanWebpackPlugin()],
    watch: true
});