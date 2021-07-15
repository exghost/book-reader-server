const { AuthenticationError, UserInputError } = require('apollo-server-express');

const { userOwnsBook } = require('../books/books.validations');
const { prisma } = require('../../db');

const resolvers = {
    Query: {
        tag: async (_, { tagId }) => {
            return await prisma.tag.findUnique({
                where: { id: Number(tagId) }
            });
        },
        allTags: async () => {
            return await prisma.tag.findMany();
        },
        tagCount: async () => {
            return await prisma.tag.count();
        }
    },
    Mutation: {
        createTag: async (_, { label }) => {
            return await prisma.tag.create({
                data: { label }
            });
        },
        addBookToTag: async (_, { bookId, label }, { req }) => {
            if(!req.userId) throw new AuthenticationError('Must be logged in to add book to author');
            if(!(await userOwnsBook(req.userId, bookId)))
                throw new UserInputError(`Cannot edit book you do not own`);

            return await prisma.tag.update({
                where: { label },
                data: {
                    books: {
                        connect: {
                            id: Number(bookId)
                        }
                    }
                }
            });
        },
        removeBookFromTag: async (_, { bookId, label }, { req }) => {
            if(!req.userId) throw new AuthenticationError('Must be logged in to remove book from author');
            if(!(await userOwnsBook(req.userId, bookId)))
                throw new UserInputError(`Cannot edit book you do not own`);

            return await prisma.tag.update({
                where: { label },
                data: {
                    books: {
                        disconnect: {
                            id: Number(bookId)
                        }
                    }
                }
            });
        },
    },
    Tag: {
        books: async (parent) => {
            return await prisma.tag.findUnique({
                where: { id: parent.id }
            }).books();
        }
    }
};

module.exports = resolvers;