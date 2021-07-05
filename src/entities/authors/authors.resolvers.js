const { AuthenticationError, UserInputError } = require('apollo-server-express');

const { userOwnsBook } = require('../books/books.validations');
const { prisma } = require('../../db');

const resolvers = {
    Query: {
        author: (parent, { id }) => {
            return prisma.author.findFirst({
                where: { id: Number(id) }
            });
        }
    },
    Mutation: {
        createAuthor: async (parent, { name }) => {
            return await prisma.author.create({
                data: { name }
            });
        },
        addBookToAuthor: async (parent, { bookId, authorId }, { req }) => {
            if(!req.userId) throw new AuthenticationError('Must be logged in to add book to author');
            if(!(await userOwnsBook(req.userId, bookId)))
                throw new UserInputError(`Cannot edit book you do not own`);

            return await prisma.author.update({
                where: { id: Number(authorId) },
                data: {
                    books: {
                        connect: {
                            id: Number(bookId)
                        }
                    }
                }
            });
        },
        removeBookFromAuthor: async (parent, { bookId, authorId }, { req }) => {
            if(!req.userId) throw new AuthenticationError('Must be logged in to remove book from author');
            if(!(await userOwnsBook(req.userId, bookId)))
                throw new UserInputError(`Cannot edit book you do not own`);

            return await prisma.author.update({
                where: { id: Number(authorId) },
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
        books: async (parent, args) => {
            return await prisma.author.findFirst({
                where: { id: parent.id }
            }).books();
        }
    }
};

module.exports = resolvers;