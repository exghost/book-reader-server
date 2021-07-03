const process = require('process');
const path = require('path');
const { createWriteStream, unlinkSync } = require('fs');
const { 
    AuthenticationError,
    UserInputError
 } = require('apollo-server-express');

const { prisma } = require('../db');
const { uploadFileToFS } = require('./upload');

const resolvers = {
    Query: {
        book: (parent, args) => {
            return prisma.book.findFirst({
                where: { id: args.id }
            });
        },
        allBooks: (parent, args) => {
            return prisma.book.findMany();
        },
        booksByOwner: (parent, args) => {
            return prisma.book.findMany({
                where: { ownerId: args.id }
            });
        },
        booksByCurrentUser: (parent, args, { res, req }) => {
            if(!req.userId) return null;

            return prisma.book.findMany({
                where: { ownerId: req.userId }
            });
        }
    },
    Mutation: {
        addBook: async (_,  { title, file }, { req }) => {
            const { userId } = req; 
            if(!userId) throw new AuthenticationError('Must be logged in to add book');
            if(!file) throw new UserInputError('File must be included with query');

            const { createReadStream, mimetype } = await file;

            const stream = await createReadStream();
            let filename;

            try {
                filename = await uploadFileToFS(stream, mimetype, userId);
            } catch(err) {
                throw err;
            }

            console.log(filename);

            return null;
            /*
            return prisma.book.create({
                data: { title, isbn, ownerId: req.userId }
            })
            */
        },
    },
    Book: {
        owner: (parent, args) => {
            return prisma.user.findFirst({
                where: { id: parent.ownerId }
            })
        }
    }
}

module.exports = resolvers;