const { gql } = require('apollo-server-express');

const typeDefs = gql`
    type User {
        id: ID!
        email: String!
        books: [Book]!
    }

    type Query {
        user(id: ID!): User,
        me: User
    }

    type Mutation {
        registerUser(email: String!, password: String!): User!
        login(email: String!, password: String!): User!
        invalidateTokens: Boolean
    }
`;

module.exports = typeDefs;