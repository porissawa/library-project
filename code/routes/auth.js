const express = require('express');
const passport = require('passport');
const ensureLogin = require('connect-ensure-login');

const authRoutes = express.Router();

// User model
const bcrypt = require('bcrypt');
const User = require('../models/user');

// Bcrypt to encrypt passwords
const bcryptSalt = 10;

authRoutes.get('/signup', (req, res) => {
  res.render('auth/signup');
});

authRoutes.post('/signup', (req, res, next) => {
  const { username, password, role, email } = req.body;

  if (username === '' || password === '') {
    res.render('auth/signup', { message: 'Indicate username and password' });
    return;
  }

  User.findOne({ username })
    .then((user) => {
      if (user !== null) {
        res.render('auth/signup', { message: 'The username already exists' });
        return;
      }

      const salt = bcrypt.genSaltSync(bcryptSalt);
      const hashPass = bcrypt.hashSync(password, salt);

      const newUser = new User({
        username,
        password: hashPass,
        role,
        email,
      });

      newUser.save((err) => {
        if (err) {
          res.render('auth/signup', { message: 'Something went wrong' });
        } else {
          res.redirect('/');
        }
      });
    })
    .catch((error) => {
      next(error);
    });
});

authRoutes.get('/login', (req, res) => {
  res.render('auth/login', { message: req.flash('error') });
});

authRoutes.post('/login', passport.authenticate('local', {
  successRedirect: '/books',
  failureRedirect: '/auth/login',
  failureFlash: true,
  passReqToCallback: true,
}));

authRoutes.get('/private-page', ensureLogin.ensureLoggedIn(), (req, res) => {
  res.render('private', { user: req.user });
});

authRoutes.get('/logout', (req, res) => {
  req.logout();
  res.redirect('/auth/login');
});

authRoutes.get('/slack', passport.authenticate('slack'));

authRoutes.get('/slack/callback', passport.authenticate('slack', {
  successRedirect: '/books',
  failureRedirect: '/auth/login',
}));

module.exports = authRoutes;
