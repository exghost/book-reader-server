const { AuthenticationError } = require('apollo-server-express');
const bcrypt = require('bcryptjs');

const { prisma } = require('../../db');
const { createTokens } = require('./auth');

const resolvers = {
    Query: {
        user: (_, args) => {
            return prisma.user.findUnique({
                where: { id: Number(args.id) }
            })
        },
        me: (_, __, { req }) => {
            if(!req.userId) return null;

            return prisma.user.findUnique({
                where: { id: Number(req.userId) }
            });
        }
    },
    Mutation: {
        registerUser: async (_,  { email, password }) => {
            const hashedPassword = bcrypt.hashSync(password, 12);
            let newUser;

            newUser = await prisma.user.create({
                data: {
                    email,
                    password: hashedPassword
                }
            });

            return newUser;
        },
        login: async (_, { email, password }, { res }) => {
            const user = await prisma.user.findUnique({
                where: { email }
            });

            if(!user) throw new AuthenticationError('Authentication failed');

            const valid = bcrypt.compareSync(password, user.password);
            if(!valid) throw new AuthenticationError('Authentication failed');

            const { accessToken, refreshToken } = createTokens(user);

            res.cookie("refresh-token", refreshToken);
            res.cookie("access-token", accessToken);

            return user;
        },
        invalidateTokens: async (_, __, { res, req }) => {
            if(!req.userId) return false;

            const user = await prisma.user.findUnique({
                where: { id: req.userId }
            });

            if(!user) return false;

            await prisma.user.update({
                where: { id: user.id },
                data: { count: user.count + 1 }
            });

            res.cookie('refresh-token', '', { maxAge: 0, overwrite: true});
            res.cookie('access-token', '', { maxAge: 0, overwrite: true});

            return true;
        }
    },
    User: {
        books: (parent, args) => {
            return prisma.book.findMany({
                where: { ownerId: parent.id }
            })
        }
    }
}

module.exports = resolvers;