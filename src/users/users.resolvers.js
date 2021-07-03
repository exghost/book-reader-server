const bcrypt = require('bcryptjs');

const { prisma } = require('../db');
const { createTokens } = require('./auth');

const resolvers = {
    Query: {
        user: (_, args) => {
            return prisma.user.findFirst({
                where: { id: Number(args.id) }
            })
        },
        me: (_, __, { req }) => {
            if(!req.userId) return null;

            return prisma.user.findFirst({
                where: { id: Number(req.userId) }
            });
        }
    },
    Mutation: {
        registerUser: (_, { data }) => {
            const { email, password } = data;
            const hashedPassword = bcrypt.hashSync(password, 12);
            return prisma.user.create({
                data: {
                    email,
                    password: hashedPassword
                }
            })
        },
        login: async (_, { email, password }, { res }) => {
            const user = await prisma.user.findFirst({
                where: { email }
            });

            if(!user) return null;

            const valid = bcrypt.compareSync(password, user.password);
            if(!valid) return null;

            const { accessToken, refreshToken } = createTokens(user);

            res.cookie("refresh-token", refreshToken);
            res.cookie("access-token", accessToken);

            return user;
        }
    }
}

module.exports = resolvers;