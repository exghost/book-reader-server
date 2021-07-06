const { ApolloServer } = require('apollo-server-express');
const express = require('express');
const cookieParser = require('cookie-parser');

const { verifyTokens } = require('./entities/users/auth');
const typeDefs = require('./graphql/typeDefs');
const resolvers = require('./graphql/resolvers');

const PORT = process.env.PORT || 4056;

const startServer = async() => {
    const app = express();

    app.use(cookieParser());

    app.use(verifyTokens);

    const server = new ApolloServer({ 
        typeDefs, 
        resolvers,
        context: ({ req, res}) => ({ req, res }),
        uploads: {
            maxFieldSize: process.env.UPLOAD_SIZE_LIMIT,
            maxFiles: process.env.UPLOAD_FILE_LIMIT
        }
    });

    server.applyMiddleware({ app });

    app.listen({ port: PORT }, () => {
        console.log(`Server ready at http://localhost:${PORT}${server.graphqlPath}`);
    });
}

startServer();