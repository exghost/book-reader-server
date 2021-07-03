const path = require('path');
const process = require('process');
const { loadFilesSync } = require('@graphql-tools/load-files');
const { mergeTypeDefs } = require('@graphql-tools/merge');

const typesArray = loadFilesSync(path.join(process.cwd(), 'src/**/*.typeDefs.js'));

module.exports = mergeTypeDefs(typesArray);

