const { gql } = require('apollo-server-express');

const typeDefs = gql`
    type User {
        id: ID!
        email: String!
    }

    type Query {
        user(id: ID!): User,
        me: User
    }

    type Mutation {
        registerUser(data: UserCreateInput!): User!
        login(email: String!, password: String!): User!
    }

    input UserCreateInput {
        email: String!
        password: String!
    }
`;

module.exports = typeDefs;