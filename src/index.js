const { ApolloServer } = require('apollo-server-express');
const express = require('express');

const { userResolvers, userTypeDefs } = require('./users');

const PORT = process.env.PORT || 4000;

const app = express();

const server = new ApolloServer({ 
    typeDefs: userTypeDefs, 
    resolvers: userResolvers,
    mockEntireSchema: false
});

server.applyMiddleware({ app });

app.listen({ port: PORT }, () => {
    console.log(`Server ready at http://localhost${PORT}${server.graphqlPath}`);
});