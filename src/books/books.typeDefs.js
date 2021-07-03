const { gql } = require('apollo-server-express');

const typeDefs = gql`
    type Book {
        id: ID!
        title: String!
        isbn: String
        filename: String
        owner: User!
    }

    type Query {
        book(id: ID!): Book
        allBooks: [Book]
        booksByOwner(ownerId: ID!): [Book!]!
        booksByCurrentUser: [Book!]!
    }

    type Mutation {
        addBook(title: String!, file: Upload!): Book
    }

    input CreateBookInput {
        title: String!
        isbn: String!
    }
`;

module.exports = typeDefs;