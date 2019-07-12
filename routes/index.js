const express = require('express');
const ensureLogin = require('connect-ensure-login');
const uploadCloud = require('../config/cloudinary.js');
const Book = require('../models/book');
const Author = require('../models/author');

const router = express.Router();

router.get('/', (req, res) => {
  res.redirect('/books');
});

router.get('/books', (req, res) => {
  Book.find()
    .then((books) => {
      // books.forEach((book) => {
      //   // console.log(book.owner === req.user.id);
      //   book.owner && book.owner.equals(req.user._id) ? book.isOwner = true : book.isOwner = false;
      //   return book;
      // });
      res.render('books', { books, user: req.user });
    })
    .catch(err => res.send(err));
});

router.get('/book/:bookID', (req, res) => {
  const book = req.params.bookID;
  Book.findById(book)
    .populate('author')
    .then((book) => {
      res.render('book-details', book);
    })
    .catch(err => res.send(err));
});

router.get('/books/add', ensureLogin.ensureLoggedIn('/auth/login'), (req, res) => {
  Author.find({}, null, { sort: { name: 1 } })
    .then((authors) => {
      res.render('book-add', { authors, user: req.user });
    });
});

router.get('/books/edit', ensureLogin.ensureLoggedIn('/auth/login'), (req, res, next) => {
  res.render('book-edit');
});

router.post('/books/add', uploadCloud.single('image'), (req, res, next) => {
  const { title, author, description, rating, owner } = req.body;
  const imgPath = req.file.url;
  const imgName = req.file.originalname;
  const newBook = new Book({ title, author, description, rating, owner, imgPath, imgName });
  newBook.save()
    .then((book) => {
      // o book da callback é o objeto que criamos.
      // Aqui não é usado pra nada mas pode ser para retornar ID/Título ou outra info pra quem usar
      res.redirect('/books');
    })
    .catch((error) => {
      console.log(error);
    });
});

router.get('/books/edit/:bookID', ensureLogin.ensureLoggedIn('/auth/login'), (req, res, next) => {
  Book.findById(req.params.bookID)
    .then((book) => {
      Author.find().then((authors) => {
        res.render('book-edit', { book, authors });
      });
    })
    .catch((error) => {
      console.log(error);
    });
});

router.post('/books/edit/:bookID', (req, res, next) => {
  const { title, author, description, rating } = req.body;
  Book.update({ _id: req.params.book_id }, { $set: { title, author, description, rating }}, { new: true })
    .then((book) => {
      res.redirect('/books');
    })
    .catch((error) => {
      console.log(error);
    });
});

router.get('/authors/add', (req, res, next) => {
  res.render('author-add');
});

router.post('/authors/add', (req, res, next) => {
  const { name, lastName, nationality, birthday, pictureUrl } = req.body;
  const newAuthor = new Author({ name, lastName, nationality, birthday, pictureUrl });
  newAuthor.save()
    .then((book) => {
      res.redirect('/books');
    })
    .catch((error) => {
      console.log(error);
    });
});

router.post('/reviews/add/:bookID', (req, res, next) => {
  const { user, comments } = req.body;
  Book.update({ _id: req.body.bookID }, { $push: { reviews: { user, comments } } })
    .then((book) => {
      res.redirect('/books');
    })
    .catch((error) => {
      console.log(error);
    });
});

const checkRoles = (role) => {
  return (req, res, next) => {
    if (req.isAuthenticated() && req.user.role === role) {
      next();
    } else {
      res.redirect('/auth/login');
    }
  };
};

const isAdmin = checkRoles('ADMIN');

router.get('/dashboard', isAdmin, (req, res) => {
  res.render('dashboard');
});

module.exports = router;
