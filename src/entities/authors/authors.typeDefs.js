const { gql } = require('apollo-server-express');

const typeDefs = gql`
    type Author {
        id: ID!
        name: String!
        books: [Book]
    }

    type Query {
        author(id: ID!): Author
    }

    type Mutation {
        createAuthor(name: String!): Author
    }
`;

module.exports = typeDefs;