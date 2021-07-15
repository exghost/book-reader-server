const { gql } = require('apollo-server-express');

const typeDefs = gql`
    type Tag {
        id: ID!
        label: String!
        books: [Book]
    }

    type Query {
        tag(tagId: ID!): Tag
        allTags: [Tag]
        tagCount: Int
    }

    type Mutation {
        createTag(label: String!): Tag
        addBookToTag(bookId: ID!, label: String!): Tag
        removeBookFromTag(bookId: ID!, label: String!): Tag
    }
`;

module.exports = typeDefs;