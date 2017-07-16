const express = require('express');
const router = express.Router();
const validator = require('validator');
const _ = require('lodash');
const bcrypt = require('bcryptjs');

const {User} = require('../models/user');
const {Property} = require('../models/property');

const {authenticate} = require('../middleware/authenticate');

router.route('/hubswipeuser')

  .get(authenticate, (req, res, next) => {
    //console.log(req.hello);
    res.send(req.user);
    /*let user = req.user;
    console.log(user);*/

  })
  .post((req, res, next) => {

    let body = _.pick(req.body, ['firstname', 'lastname', 'propertyowner', 'email', 'password', 'confirmpassword']);

    let user = new User(body);

    bcrypt.genSalt(10, (err, salt) => {
      bcrypt.hash(user.password, salt, (err, hash) => {
        user.password = hash;
        user.save().then(() => {
          return user.generateAuthToken();

        }).then(token => {
          res.header('x-auth', token).send(user);
        }).catch(e => {
          res.status(400).send(e);
        });
      });
    });
  });

  router.route('/hubswipeuser/account/login')

    .get((req, res, next) => {

    })
    .post((req, res, next) => {

      let body = _.pick(req.body, ['email', 'password']);

      User.findByCredentials(body.email, body.password).then(user => {
        //res.send(user);
        return user.generateAuthToken().then( token => {
          res.header('x-auth', token).send(user);
        });
      })
      .catch(e => {
        res.status(400).send();
      });
    });

router.route('/hubswipeuser/account/update')
  .get(authenticate, (req, res, next) => {
    res.json(req.user);
  })
  .post(authenticate, (req, res, next) => {
    let body = _.pick(req.body, ['firstname', 'lastname', 'propertyowner', 'email', 'password', 'confirmpassword']);
    let user = req.user;

    if(body.firstname.includes(' ') || body.firstname.includes(',') || body.firstname.includes(';') || body.firstname === "") {
      return res.json('stop!');
    }

    if(body.lastname.includes(' ') || body.lastname.includes(',') || body.lastname.includes(';') || body.lastname === "") {
      return res.json('stop!');
    }

    if(body.confirmpassword !== body.password) {
      return res.json('your new passwords do not match');
    }

    User.findOneAndUpdate(
      {_id: user._id},
      {
        email: body.email,
        firstname: body.firstname,
        lastname: body.lastname,
        propertyowner: body.propertyowner,
        password: body.password
      },
      {
        new: true
      }, function(err, user) {
        if(err) {
          return console.log(err);
        }

        bcrypt.genSalt(10, (err, salt) => {
          bcrypt.hash(user.password, salt, (err, hash) => {
            user.password = hash;
            user.save();
          });
        });
        res.json(user);

  }
);
  });

router.delete('/hubswipeuser/account/logout', authenticate, (req, res, next) => {
  req.user.removeToken(req.token).then(() => {
    res.status(200).send();
  }, () => {
    res.status(400).send();
  });
});

router.route('/hubswipeuser/account/delete')

  .get(authenticate, (req, res, next) => {
    res.send(req.user);
  })
  .post(authenticate, (req, res, next) => {
    //the email will be passed in from a hidden form field
    let body = _.pick(req.body, ['email', 'password', 'confirmpassword']);

    if(body.password !== body.confirmpassword) {
      return res.json('your passwords do not match');
    }

    User.findByCredentials(body.email, body.password)
      .then(user => {
        User.findByIdAndRemove({_id: user._id}, (user) => {
          res.json('your account was successfully deleted');
        });
      })
      .catch(e => {
        res.json('your credentials are incorrect; please try again');
      });
    });

router.route('/hubswipeuser/addproperty')

  .get((req, res, next) => {
    res.json('hello from property route');
  })
  .post((req, res, next) => {

    let body = _.pick(req.body, ['description']);

    let property = new Property(body);

    property.save().then(property => {
      res.send(property);
    }).catch(e => {
      res.send(e);
    });

  });


module.exports = router;
