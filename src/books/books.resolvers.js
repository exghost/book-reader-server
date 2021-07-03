const { prisma } = require('../db');

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
        addBook: (_,  { data }, { req }) => {
            if(!req.userId) return null;
            const { title, isbn } = data;
            
            return prisma.book.create({
                data: { title, isbn, ownerId: req.userId }
            })
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