const { AuthenticationError, UserInputError } = require('apollo-server-express');

const { userOwnsBook } = require('../books/books.validations');
const { prisma } = require('../../db');

const resolvers = {
    Query: {
        author: async (_, { id }) => {
            return await prisma.author.findUnique({
                where: { id: Number(id) },
                include: { books: true }
            });
        },
        allAuthors: async () => {
            return await prisma.author.findMany();
        },
        authorCount: async () => {
            return await prisma.author.count();
        }
    },
    Mutation: {
        createAuthor: async (_, { name }) => {
            return await prisma.author.create({
                data: { name }
            });
        },
        addBookToAuthor: async (_, { id, bookId }, { req }) => {
            if(!req.userId) throw new AuthenticationError('Must be logged in to add book to author');
            if(!(await userOwnsBook(req.userId, bookId)))
                throw new UserInputError(`Cannot edit book you do not own`);

            return await prisma.author.update({
                where: { id: Number(id) },
                data: {
                    books: {
                        connect: {
                            id: Number(bookId)
                        }
                    }
                }
            });
        },
        removeBookFromAuthor: async (_, { id, bookId }, { req }) => {
            if(!req.userId) throw new AuthenticationError('Must be logged in to remove book from author');
            if(!(await userOwnsBook(req.userId, bookId)))
                throw new UserInputError(`Cannot edit book you do not own`);

            return await prisma.author.update({
                where: { id: Number(id) },
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
    Author: {
        books: async (parent) => {
            return await prisma.author.findUnique({
                where: { id: parent.id }
            }).books();
        }
    }
};

module.exports = resolvers;