const path = require('path');
const process = require('process');
const { loadFilesSync } = require('@graphql-tools/load-files');
const { mergeResolvers } = require('@graphql-tools/merge');

const resolversArray = loadFilesSync(path.join(process.cwd(), 'src/**/*.resolvers.js'));

module.exports = mergeResolvers(resolversArray);
