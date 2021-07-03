const { ApolloServer, gql } = require('apollo-server');

const { userResolvers, userTypeDefs } = require('./users');

const server = new ApolloServer({ 
    typeDefs: userTypeDefs, 
    resolvers: userResolvers,
    mockEntireSchema: false
});

server.listen().then(({ url }) => {
    console.log(`Server ready at ${url}`);
});