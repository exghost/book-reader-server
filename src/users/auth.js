const { sign, verify } = require('jsonwebtoken');

const { prisma } = require('../db');

const createTokens = (user) => {
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

    return { accessToken, refreshToken  };
};

const verifyTokens = async (req, res, next) => {
    const refreshToken = req.cookies["refresh-token"];
    const accessToken  = req.cookies["access-token"];

    if(!accessToken && !refreshToken) return next();
    
    try {
        const data = verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
        req.userId = data.userId;
        return next();
    } catch {
    }

    if(!refreshToken) return next();

    let data;
    
    try {
        data = verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    } catch {
        return next();
    }

    const user = await prisma.user.findFirst( {
        where: { id: data.userId } 
    });

    if(!user || user.count !== data.count) return next();

    const { newAccessToken, newRefreshToken } = createTokens(user);

    res.cookie("refresh-token", newRefreshToken);
    res.cookie("access-token", newAccessToken);
    req.userId = user.id;

    next();
}

module.exports = { createTokens, verifyTokens };