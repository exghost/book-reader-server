const { ApolloServer } = require('apollo-server-express');
const express = require('express');
const cookieParser = require('cookie-parser');
const { verify } = require('jsonwebtoken');

const { userResolvers, userTypeDefs } = require('./users');

const PORT = process.env.PORT || 4056;

const startServer = async() => {
    const app = express();

    app.use(cookieParser());

    app.use((req, _, next) => {
        const accessToken = req.cookies["access-token"];
        try {
            const data = verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
            req.userId = data.userId;
        } catch {}
        
        next();
    })

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