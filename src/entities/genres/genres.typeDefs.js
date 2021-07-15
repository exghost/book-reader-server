const { gql } = require('apollo-server-express');

const typeDefs = gql`
    type Genre {
        id: ID!
        label: String!
        books: [Book]
    }

    type Query {
        genre(genreId: ID!): Genre
        allGenres: [Genre]
        genreCount: Int
    }

    type Mutation {
        createGenre(label: String!): Genre
        addBookToGenre(bookId: ID!, label: String!): Genre
        removeBookFromGenre(bookId: ID!, label: String!): Genre
    }
`;

module.exports = typeDefs;