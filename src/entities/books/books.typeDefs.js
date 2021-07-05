const { gql } = require('apollo-server-express');

const typeDefs = gql`
    type Book {
        id: ID!
        title: String!
        isbn: String
        filename: String
        owner: User!
        authors: [Author]
    }

    type Query {
        book(id: ID!): Book
        allBooks: [Book]
        booksByOwner(ownerId: ID!): [Book]!
        booksByCurrentUser: [Book]!
    }

    type Mutation {
        addBook(data: CreateBookInput!, file: Upload!): Book
        addAuthorToBook(id: ID!, authorName: String!): Book
        addAuthorsToBook(id: ID!, authors: [AddAuthorInput!]!): Book
        removeAuthorFromBook(bookId: ID!, authorId: ID!): Book
    }

    input CreateBookInput {
        title: String!
        isbn: String
    }

    input AddAuthorInput {
        id: ID
        name: String
    }
`;

module.exports = typeDefs;