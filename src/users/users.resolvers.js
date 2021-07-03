const bcrypt = require('bcryptjs');

const { prisma } = require('../db');
const { createTokens } = require('./auth');

const resolvers = {
    Query: {
        user: (parent, args) => {
            return prisma.user.findFirst({
                where: { id: Number(args.id) }
            })
        },
        me: (parent, args, { req }) => {
            if(!req.userId) return null;

            return prisma.user.findFirst({
                where: { id: Number(req.userId) }
            });
        }
    },
    Mutation: {
        registerUser: (parent, { data }) => {
            const { email, password } = data;
            const hashedPassword = bcrypt.hashSync(password)
            return prisma.user.create({
                data: {
                    email,
                    password: hashedPassword
                }
            })
        },
        login: async (parent, { email, password }, { res }) => {
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