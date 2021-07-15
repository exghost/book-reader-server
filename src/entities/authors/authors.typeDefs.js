const { gql } = require('apollo-server-express');

const typeDefs = gql`
    type Author {
        id: ID!
        name: String!
        books: [Book]
    }

    type Query {
        author(id: ID!): Author
        allAuthors(): [Author]
        authorCount(): Int
    }

    type Mutation {
        createAuthor(name: String!): Author
        addBookToAuthor(id: ID!, bookId: ID!): Author
        removeBookFromAuthor(id: ID!, bookId: ID!): Author
    }
`;

module.exports = typeDefs;