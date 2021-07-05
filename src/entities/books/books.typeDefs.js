const { gql } = require('apollo-server-express');

const typeDefs = gql`
    type Book {
        id: ID!
        title: String!
        isbn: String
        edition: Int
        publishYear: Int
        filename: String
        owner: User!
        authors: [Author]
        genres: [Genre]
        tags: [Tag]
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
        addGenreToBook(bookId: ID!, genreLabel: String!): Book
        removeGenreFromBook(bookId: ID!, genreLabel: String!): Book
        addTagToBook(bookId: ID!, tagLabel: String!): Book
        removeTagFromBook(bookId: ID!, tagLabel: String!): Book
    }

    input CreateBookInput {
        title: String!
        isbn: String
        edition: Int
        publishYear: Int
        authors: [String!]
        genres: [String!]
        tags: [String!]
    }

    input AddAuthorInput {
        id: ID
        name: String
    }
`;

module.exports = typeDefs;