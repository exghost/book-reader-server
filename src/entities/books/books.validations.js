const { prisma } = require('../../db');

const userOwnsBook = async (userId, bookId) => {
    const count = await prisma.book.count({
        where: { 
            id: Number(bookId),
            ownerId: Number(userId)
        }
    });

    return !!count;
};

module.exports = { userOwnsBook };