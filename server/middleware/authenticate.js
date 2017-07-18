const {User} = require('../models/user');

let authenticate = (req, res, next) => {
  let token = req.header('x-auth');

  User.findByToken(token).then( user => {
    if (!user) {
      return Promise.reject();
    }

    //modify the request object by adding user and token properties and setting them equals to the user and token we just found.
    req.user = user;
    req.token = token;
    //req.hello = 'hello';
    next();

  }).catch( e => {
      res.status(401).send('this is from the authenicate function');
  });
};

module.exports = {authenticate};
