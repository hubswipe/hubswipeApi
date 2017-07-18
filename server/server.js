const express = require('express');
const bodyParser = require('body-parser');
const logger = require('morgan');
const expressValidator = require('express-validator');

const {mongoose} = require('./db/mongoose');
const {User} = require('./models/user');

const app = express();

app.use(bodyParser.json());

const index = require('./routes/index');
const users = require('./routes/users');
const property = require('./routes/property');

app.use(logger('dev'));
app.use(expressValidator({
  errorFormatter: (param, msg, value) => {
      let namespace = param.split('.')
      , root    = namespace.shift()
      , formParam = root;

    while(namespace.length) {
      formParam += '[' + namespace.shift() + ']';
    }
    return {
      param : formParam,
      msg   : msg,
      value : value
    };
  }
}));

app.use('/', index);
app.use('/users', users);
app.use('/property', property);

app.listen(3030, () => {
  console.log('Started on port 3030');
});
