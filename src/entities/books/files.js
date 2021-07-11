const glob = require('glob');
const process = require('process');
const path = require('path');
const { unlinkSync } = require('fs');

const { prisma } = require('../../db');

const cleanupDeletedBookFiles = async () => {
    const fileList = await new Promise((resolve, reject) => {
        glob(path.join(process.cwd(), 'uploads/**/*'), {nodir: true}, (err, res) => {
            if(err) {
                reject(err);
            } else {
                resolve(res);
            }
        });
    });

    let fileListMetadata = fileList.map((filePath) => {
        let pathArray = filePath.split('/');
        return {
            ownerId: Number(pathArray[pathArray.length - 2]),
            filename: pathArray[pathArray.length - 1],
            path: filePath
        }
    });

    const books = await prisma.book.findMany();

    fileListMetadata = fileListMetadata.map((file) => {
        if(books.some((book) => book.ownerId === file.ownerId && book.filename === file.filename)) {
            return { ...file, inDB: true }
        }

        return { ...file, inDB: false}
    });

    fileListMetadata.forEach(({path, inDB}) => {
        if(!inDB) unlinkSync(path);
    });

};

module.exports = { cleanupDeletedBookFiles };