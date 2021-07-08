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
        addAuthorsToBook(id: ID!, authors: [String!]!): Book
        removeAuthorFromBook(id: ID!, authorId: ID!): Book
        addGenreToBook(id: ID!, genreLabel: String!): Book
        addGenresToBook(id: ID!, genres: [String!]!): Book
        removeGenreFromBook(id: ID!, genreLabel: String!): Book
        addTagToBook(id: ID!, tagLabel: String!): Book
        addTagsToBook(id: ID!, tags: [String!]!): Book
        removeTagFromBook(id: ID!, tagLabel: String!): Book
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