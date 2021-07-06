const { 
    AuthenticationError,
    UserInputError
 } = require('apollo-server-express');
 const { unlink } = require('fs');

const { prisma } = require('../../db');
const { uploadFileToFS } = require('./upload');
const { userOwnsBook } = require('./books.validations');
const { IgnorePlugin } = require('webpack');

const resolvers = {
    Query: {
        book: (parent, args) => {
            return prisma.book.findFirst({
                where: { id: Number(args.id) }
            });
        },
        allBooks: (parent, args) => {
            return prisma.book.findMany({
                include: { authors: true }
            });
        },
        booksByOwner: (parent, args) => {
            return prisma.book.findMany({
                where: { ownerId: Number(args.id) },
                include: { authors: true }
            });
        },
        booksByCurrentUser: (parent, args, { res, req }) => {
            if(!req.userId) return null;

            return prisma.book.findMany({
                where: { ownerId: req.userId },
                include: { authors: true }
            });
        }
    },
    Mutation: {
        addBook: async (_,  { data, file }, { req }) => {
            const { userId } = req; 
            if(!userId) throw new AuthenticationError('Must be logged in to make this change');
            if(!file) throw new UserInputError('File must be included with query');
            console.log(data);
            const { createReadStream, mimetype } = await file;

            const stream = await createReadStream();
            let result;

            try {
                result = await uploadFileToFS(stream, mimetype, userId);
            } catch(err) {
                throw err;
            }

            let newBook

            try {
                newBook = await prisma.book.create({
                    data: {
                        title: data.title,
                        isbn: data.isbn, 
                        publishYear: Number(data.publishYear),
                        edition: Number(data.edition),
                        filename: result.filename, 
                        ownerId: req.userId
                    }
                });
            } catch(err) {
                unlink(result.targetPath);
            }

            if(!data.authors) data.authors = [];
            if(!data.genres) data.genres = [];
            if(!data.tags) data.tags = [];
            
            return await prisma.book.update({
                where: { id: newBook.id },
                data: {
                    authors: {
                        connectOrCreate: data.authors.map((authorName) => {
                            return {
                                where: {
                                    name: authorName
                                },
                                create: {
                                    name: authorName
                                }
                            }
                        })
                    },
                    genres: {
                        connectOrCreate: data.genres.map((genreLabel) => {
                            return {
                                where: {
                                    label: genreLabel
                                },
                                create: {
                                    label: genreLabel
                                }
                            }
                        })
                    },
                    tags: {
                        connectOrCreate: data.tags.map((tagLabel) => {
                            return {
                                where: {
                                    label: tagLabel
                                },
                                create: {
                                    label: tagLabel
                                }
                            }
                        })
                    }
                }
            });
        },
        addAuthorToBook: async (parent, {id, authorName}, { req }) => {
            if(!req.userId) 
                throw new AuthenticationError('Must be logged in to make this change');
            if(!(await userOwnsBook(req.userId, id))) 
                throw new UserInputError(`Cannot edit book you do not own`);

            return await prisma.book.update({
                where: { id: Number(id) },
                data: {
                    authors: {
                        connectOrCreate: {
                            where: { name: authorName },
                            create: { name: authorName }
                        }
                    }
                }
            });
        },
        addAuthorsToBook: async (parent, { id, authors }, { req }) => {
            if(!req.userId) 
                throw new AuthenticationError('Must be logged in to make this change');
            if(!(await userOwnsBook(req.userId, id))) 
                throw new UserInputError(`Cannot edit book you do not own`);

            return await prism.book.update({
                where: { id: Number(id) },
                data: {
                    authors: {
                        connectOrCreate: authors.map((author) => {
                            return {
                                where: {
                                    name: author
                                },
                                create: {
                                    name: author
                                }
                            }
                        })
                    }
                }
            });
        },
        removeAuthorFromBook: async (parent, { id, authorId }, { req }) => {
            if(!req.userId) 
                throw new AuthenticationError('Must be logged in to make this change');
            if(!(await userOwnsBook(req.userId, id))) 
                throw new UserInputError(`Cannot edit book you do not own`);

            return await prisma.book.update({
                where: { id: Number(id) },
                data: {
                    authors: {
                        disconnect: {
                            id: Number(authorId)
                        }
                    }
                }
            })
        },
        addGenreToBook: async (parent, { id, genreLabel }, { req }) => {
            if(!req.userId) 
                throw new AuthenticationError('Must be logged in to make this change');
            if(!(await userOwnsBook(req.userId, id))) 
                throw new UserInputError(`Cannot edit book you do not own`);

            return await prisma.book.update({
                where: { id: Number(id) },
                data: {
                    genres: {
                        connectOrCreate: {
                            where: { label: genreLabel },
                            create: { label: genreLabel }
                        }
                    }
                }
            });
        },
        removeGenreFromBook: async (parent, { id, genreLabel }, { req }) => {
            if(!req.userId) 
                throw new AuthenticationError('Must be logged in to make this change');
            if(!(await userOwnsBook(req.userId, id))) 
                throw new UserInputError(`Cannot edit book you do not own`);

            return await prisma.book.update({
                where: { id: Number(id) },
                data: {
                    genres: {
                        disconnect: {
                            label: genreLabel
                        }
                    }
                }
            })
        },
        addTagToBook: async (parent, { id, tagLabel }, { req }) => {
            if(!req.userId) 
                throw new AuthenticationError('Must be logged in to make this change');
            if(!(await userOwnsBook(req.userId, id))) 
                throw new UserInputError(`Cannot edit book you do not own`);

            return await prisma.book.update({
                where: { id: Number(id) },
                data: {
                    tags: {
                        connectOrCreate: {
                            where: { label: tagLabel },
                            create: { label: tagLabel }
                        }
                    }
                }
            });
        },
        removeTagFromBook: async (parent, { id, tagLabel }, { req }) => {
            if(!req.userId) 
                throw new AuthenticationError('Must be logged in to make this change');
            if(!(await userOwnsBook(req.userId, id))) 
                throw new UserInputError(`Cannot edit book you do not own`);

            return await prisma.book.update({
                where: { id: Number(id) },
                data: {
                    tags: {
                        disconnect: {
                            label: tagLabel
                        }
                    }
                }
            })
        },
    },
    Book: {
        owner: (parent, args) => {
            return prisma.user.findFirst({
                where: { id: parent.ownerId }
            });
        },
        authors: async (parent, args) => {
            return await prisma.book.findFirst({
                where: { id: parent.id }
            }).authors();
        },
        genres: async(parent, args) => {
            return await prisma.book.findUnique({
                where: { id: parent.id }
            }).genres();
        },
        tags: async(parent, args) => {
            return await prisma.book.findUnique({
                where: { id: parent.id }
            }).tags();
        }
    }
}

module.exports = resolvers;