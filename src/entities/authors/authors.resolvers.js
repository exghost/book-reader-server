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
        }
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