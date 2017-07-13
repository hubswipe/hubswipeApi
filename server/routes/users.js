const express = require('express');
const router = express.Router();
const _ = require('lodash');
const {User} = require('../models/user');

router.route('/hubswipeuser')

  .get((req, res, next) => {

  })
  .post((req, res, next) => {

    let body = _.pick(req.body, ['firstname', 'lastname', 'propertyowner', 'email', 'password', 'confirmpassword']);

    let user = new User(body);

    user.save().then(() => {
      return user.generateAuthToken();
      
    }).then(token => {
      res.header('x-auth', token).send(user);
    }).catch(e => {
      res.status(400).send(e);
    });
  });


module.exports = router;
