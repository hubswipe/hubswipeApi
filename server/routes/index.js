const express = require('express');
const router = express.Router();
const _ = require('lodash');

const {User} = require('../models/user');
const {Property} = require('../models/property');


router.route('/')

  .get((req, res, next) => {
    res.json('hello from api');
  })
  .post((req, res, next) => {

  });

module.exports = router;
