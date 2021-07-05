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
            if(!userId) throw new AuthenticationError('Must be logged in to add book');
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

            try {
                const newBook = await prisma.book.create({
                    data: {
                        title: data.title,
                        isbn: data.isbn, 
                        publishYear: Number(data.publishYear),
                        edition: Number(data.edition),
                        filename: result.filename, 
                        ownerId: req.userId
                    }
                });

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
                        }
                    }
                })
            } catch(err) {
                unlink(result.targetPath);
            }
        },
        addAuthorToBook: async (parent, {id, authorName}, { req }) => {
            if(!req.userId) 
                throw new AuthenticationError('Must be logged in to add author to book');
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
            if(!req.userId) throw new AuthenticationError('Must be logged in to add author to book');

            let book = await prisma.book.findFirst({
                where: { id: Number(id), ownerId: req.userId },
                include: { authors: true }
            });

            if(!book) throw new UserInputError(`Cannot edit book you do not own`);

            let newAuthors = authors
                                .filter(({ id }) => !id)
                                .map(({ name }) => { return { name }});
            let existingAuthors = authors
                                .filter(({ id }) => id)
                                .map(({ id }) =>  {
                                    return { id: Number(id) };
                                });

            let existingNewAuthors = await prisma.author.findMany({
                where: { 
                    name: {
                        in:  newAuthors.map((author) => author.name)
                    }
                }
            });

            newAuthors = newAuthors.reduce((acc, author) => {
                if(existingNewAuthors
                    .map(newAuthor => newAuthor.name)
                    .includes(author.name)) {
                    return acc;
                }

                return [...acc, author];
            }, []);

            existingNewAuthors = existingNewAuthors
                                    .map(({ id }) => { return { id: Number(id) } });

            existingAuthors = [...existingAuthors, ...existingNewAuthors];

            let currentAuthors = book.authors;
            currentAuthors = currentAuthors.map(({ id }) => { return { id }});

            return await prisma.book.update({
                where: { id: Number(id) },
                data: {
                    authors: { set: [...currentAuthors, ...existingAuthors], create: [...newAuthors] }
                }
            });
        },
        removeAuthorFromBook: async (parent, { bookId, authorId }, { req }) => {
            if(!req.userId) 
                throw new AuthenticationError('Must be logged in to add author to book');
            if(!(await userOwnsBook(req.userId, bookId))) 
                throw new UserInputError(`Cannot edit book you do not own`);

            return await prisma.book.update({
                where: { id: Number(bookId) },
                data: {
                    authors: {
                        disconnect: {
                            id: Number(authorId)
                        }
                    }
                }
            })
        },
        addGenreToBook: async (parent, { bookId, genreLabel }, { req }) => {
            if(!req.userId) 
                throw new AuthenticationError('Must be logged in to add author to book');
            if(!(await userOwnsBook(req.userId, bookId))) 
                throw new UserInputError(`Cannot edit book you do not own`);

            return await prisma.book.update({
                where: { id: Number(bookId) },
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
        removeGenreFromBook: async (parent, { bookId, genreLabel }, { req }) => {
            if(!req.userId) 
                throw new AuthenticationError('Must be logged in to add author to book');
            if(!(await userOwnsBook(req.userId, bookId))) 
                throw new UserInputError(`Cannot edit book you do not own`);

            return await prisma.book.update({
                where: { id: Number(bookId) },
                data: {
                    genres: {
                        disconnect: {
                            label: genreLabel
                        }
                    }
                }
            })
        },
        addTagToBook: async (parent, { bookId, tagLabel }, { req }) => {
            if(!req.userId) 
                throw new AuthenticationError('Must be logged in to add author to book');
            if(!(await userOwnsBook(req.userId, bookId))) 
                throw new UserInputError(`Cannot edit book you do not own`);

            return await prisma.book.update({
                where: { id: Number(bookId) },
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
        removeTagFromBook: async (parent, { bookId, tagLabel }, { req }) => {
            if(!req.userId) 
                throw new AuthenticationError('Must be logged in to add author to book');
            if(!(await userOwnsBook(req.userId, bookId))) 
                throw new UserInputError(`Cannot edit book you do not own`);

            return await prisma.book.update({
                where: { id: Number(bookId) },
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