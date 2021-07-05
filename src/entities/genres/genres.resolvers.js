const { AuthenticationError, UserInputError } = require('apollo-server-express');

const { userOwnsBook } = require('../books/books.validations');
const { prisma } = require('../../db');

const resolvers = {
    Query: {
        genre: async (parent, { genreId }) => {
            return await prisma.genre.findUnique({
                where: { id: Number(genreId) }
            });
        },
        allGenres: async (parent, args) => {
            return await prisma.genre.findMany();
        }
    },
    Mutation: {
        createGenre: async (parent, { label }) => {
            return await prisma.genre.create({
                data: { label }
            });
        },
        addBookToGenre: async (parent, { bookId, label }, { req }) => {
            if(!req.userId) throw new AuthenticationError('Must be logged in to add book to author');
            if(!(await userOwnsBook(req.userId, bookId)))
                throw new UserInputError(`Cannot edit book you do not own`);

            return await prisma.genre.update({
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
        removeBookFromGenre: async (parent, { bookId, label }, { req }) => {
            if(!req.userId) throw new AuthenticationError('Must be logged in to remove book from author');
            if(!(await userOwnsBook(req.userId, bookId)))
                throw new UserInputError(`Cannot edit book you do not own`);

            return await prisma.genre.update({
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
    Genre: {
        books: async (parent, args) => {
            return await prisma.genre.findUnique({
                where: { id: parent.id }
            }).books();
        }
    }
};

module.exports = resolvers;