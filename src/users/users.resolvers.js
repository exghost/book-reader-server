const bcrypt = require('bcryptjs');
const { sign } = require('jsonwebtoken');

const { prisma } = require('../db');

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

            const refreshToken = sign(
                { userId: user.id, count: user.count },
                process.env.REFRESH_TOKEN_SECRET,
                { expiresIn: "7d" }
            );

            const accessToken = sign(
                { userId: user.id },
                process.env.ACCESS_TOKEN_SECRET,
                { expiresIn: "15min" }
            );

            res.cookie("refresh-token", refreshToken);
            res.cookie("access-token", accessToken);

            return user;
        }
    }
}

module.exports = resolvers;