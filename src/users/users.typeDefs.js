const { gql } = require('apollo-server-express');

const typeDefs = gql`
    type User {
        id: ID!
        username: String!
        email: String!
    }

    type Query {
        user(id: ID!): User
    }

    type Mutation {
        registerUser(data: UserCreateInput!): User!
    }

    input UserCreateInput {
        email: String!
        username: String!
    }
`;

module.exports = typeDefs;