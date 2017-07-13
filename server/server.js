const express = require('express');
const bodyParser = require('body-parser');
const logger = require('morgan');

const {mongoose} = require('./db/mongoose');
const {User} = require('./models/user');

const app = express();

app.use(bodyParser.json());

const index = require('./routes/index');
const users = require('./routes/users');
const property = require('./routes/property');

app.use(logger('dev'));

app.use('/', index);
app.use('/users', users);
app.use('/property', property);

app.listen(3030, () => {
  console.log('Started on port 3030');
});
