const { prisma } = require('@prisma/client');

const resolvers = {
    Query: {
        user: (parent, args) => {
            return prisma.user.findFirst({
                where: { id: Number(args.id) }
            })
        }
    },
    Mutation: {
        registerUser: (parent, args) => {
            return prisma.user.create({
                data: {
                    email: args.data.email,
                    username: args.data.username,
                }
            })
        }
    }
}

module.exports = resolvers;