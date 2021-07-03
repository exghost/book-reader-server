const { ApolloServer } = require('apollo-server-express');
const express = require('express');
const cookieParser = require('cookie-parser');
const { verify } = require('jsonwebtoken');

const { userResolvers, userTypeDefs } = require('./users');
const { verifyTokens } = require('./users/auth');

const PORT = process.env.PORT || 4056;

const startServer = async() => {
    const app = express();

    app.use(cookieParser());

    app.use(verifyTokens);

    const server = new ApolloServer({ 
        typeDefs: userTypeDefs, 
        resolvers: userResolvers,
        context: ({ req, res}) => ({ req, res })
    });

    server.applyMiddleware({ app });

    app.listen({ port: PORT }, () => {
        console.log(`Server ready at http://localhost:${PORT}${server.graphqlPath}`);
    });
}

startServer();