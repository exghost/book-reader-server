const { 
    AuthenticationError,
    UserInputError
 } = require('apollo-server-express');
 const { unlink } = require('fs');

const { prisma } = require('../../db');
const { uploadFileToFS } = require('./upload');
const { userOwnsBook } = require('./books.validations');

const resolvers = {
    Query: {
        book: (parent, args) => {
            return prisma.book.findUnique({
                where: { id: Number(args.id) },
                include: {
                    authors: true,
                    owner: true,
                    genres: true,
                    tags: true
                }
            });
        },
        allBooks: (parent, args) => {
            return prisma.book.findMany({
                include: {
                    authors: true,
                    owner: true,
                    genres: true,
                    tags: true
                }
            });
        },
        booksByOwner: (parent, args) => {
            return prisma.book.findMany({
                where: { ownerId: Number(args.id) },
                include: {
                    authors: true,
                    owner: true,
                    genres: true,
                    tags: true
                }
            });
        },
        booksByCurrentUser: (parent, args, { res, req }) => {
            if(!req.userId) return null;

            return prisma.book.findMany({
                where: { ownerId: req.userId },
                include: {
                    authors: true,
                    owner: true,
                    genres: true,
                    tags: true
                }
            });
        }
    },
    Mutation: {
        addBook: async (_,  { data, file }, { req }) => {
            const { userId } = req; 
            if(!userId) throw new AuthenticationError('Must be logged in to make this change');
            if(!file) throw new UserInputError('File must be included with query');
            
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
        updateBook: async (_, { data }, { req }) => {
            const {
                id,
                title,
                isbn,
                edition,
                publishYear,
                authors,
                genres,
                tags,
            } = data;

            if(!req.userId) 
                throw new AuthenticationError('Must be logged in to make this change');
            if(!(await userOwnsBook(req.userId, id))) 
                throw new UserInputError(`Cannot edit book you do not own`);

            const book = await prisma.book.findUnique({
                where: { id: Number(id) },
                include: {
                    authors: true,
                    genres: true,
                    tags: true
                }
            });

            let removedAuthors = book.authors.filter((author) => {
                return !authors.includes(author.name);
            });
            
            let removedGenres = book.genres.filter((genre) => {
                return !genres.includes(genre.label);
            });
            
            let removedTags = book.tags.filter((tag) => {
                return !tags.includes(tag.label);
            });
            
            return await prisma.book.update({
                where: { id: Number(id) },
                data: {
                    title,
                    isbn,
                    edition,
                    publishYear,
                    authors: {
                        connectOrCreate: authors.map((name) => {
                            return {
                                where: { name },
                                create: { name }
                            }
                        }),
                        disconnect: removedAuthors.map(({name}) => {
                            return { name }
                        })
                    },
                    genres: {
                        connectOrCreate: genres.map((label) => {
                            return {
                                where: { label: label.toLowerCase() },
                                create: { label: label.toLowerCase() }
                            }
                        }),
                        disconnect: removedGenres.map(({label}) => {
                            return { label: label.toLowerCase() }
                        })
                    },
                    tags: {
                        connectOrCreate: tags.map((label) => {
                            return {
                                where: { label: label.toLowerCase() },
                                create: { label: label.toLowerCase() }
                            }
                        }),
                        disconnect: removedTags.map(({label}) => {
                            return { label: label.toLowerCase() }
                        })
                    },
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
        addGenresToBook: async (parent, { id, genres }, { req }) => {
            if(!req.userId) 
                throw new AuthenticationError('Must be logged in to make this change');
            if(!(await userOwnsBook(req.userId, id))) 
                throw new UserInputError(`Cannot edit book you do not own`);

            return await prism.book.update({
                where: { id: Number(id) },
                data: {
                    genres: {
                        connectOrCreate: genres.map((genre) => {
                            return {
                                where: {
                                    name: genre
                                },
                                create: {
                                    name: genre
                                }
                            }
                        })
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
        addTagsToBook: async (parent, { id, tags }, { req }) => {
            if(!req.userId) 
                throw new AuthenticationError('Must be logged in to make this change');
            if(!(await userOwnsBook(req.userId, id))) 
                throw new UserInputError(`Cannot edit book you do not own`);

            return await prism.book.update({
                where: { id: Number(id) },
                data: {
                    tags: {
                        connectOrCreate: tags.map((tag) => {
                            return {
                                where: {
                                    name: tag
                                },
                                create: {
                                    name: tag
                                }
                            }
                        })
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
            return prisma.user.findUnique({
                where: { id: parent.ownerId }
            });
        },
        authors: async (parent, args) => {
            return await prisma.book.findUnique({
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