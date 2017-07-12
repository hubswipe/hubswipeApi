const express = require('express');
const router = express.Router();
const {User} = require('../models/user');


router.route('/')

  .get((req, res, next) => {
    res.json('hello from api');
  })
  .post((req, res, next) => {

  });

module.exports = router;
