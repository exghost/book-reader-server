const process = require('process');
const path = require('path');
const { 
    createWriteStream,
    existsSync,
    mkdir,
    unlink
} = require('fs');
const { v4: uuidv4 } = require('uuid');
const mimeTypes = require('mime-types');
const { rejects } = require('assert');

const uploadFileToFS = async ( stream, { filename, mimetype }, userId) => {
    const userDirectory = path.join(process.cwd(), 'uploads', String(userId));

    try {
        await createDirectory(userDirectory);
    } catch (err) {
        throw err;
    }

    let newFilename = `${uuidv4()}.${mimeTypes.extension(mimetype)}`;

    const targetPath = path.join(userDirectory, newFilename);

    return  new Promise((resolve, reject) => {
        stream
            .pipe(createWriteStream(targetPath))
            .on("close", () => {
                resolve();
            })
            .on('error', (error) => {
                reject(error);
            })
    });
};

const createDirectory = async (dirPath) => {
    try {
        if(!existsSync(dirPath)) {
            await mkdir(dirPath, { recursive: true }, (err) => {
                if(err) throw err;
            });
        }
    } catch(err) {
        throw err;
    }
};

module.exports = { uploadFileToFS };