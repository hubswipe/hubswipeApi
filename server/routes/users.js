const express = require('express');
const router = express.Router();
const _ = require('lodash');
const bcrypt = require('bcryptjs');
const {ObjectID} = require('mongodb');

const {User} = require('../models/user');
const {Property} = require('../models/property');

const {authenticate} = require('../middleware/authenticate');
const {Email} = require('../utils');

router.route('/hubswipeuser')

  .get(authenticate, (req, res, next) => {
    //console.log(req.hello);
    res.send(req.user);
    /*let user = req.user;
    console.log(user);*/

  })
  .post((req, res, next) => {

    let body = _.pick(req.body, ['firstname', 'lastname', 'propertyowner', 'email', 'password', 'confirmpassword']);

    req.checkBody('firstname', 'firstname field is required').notEmpty();
    req.checkBody('lastname', 'lastname field is required').notEmpty();
    req.checkBody('propertyowner', 'are you a property owner?').notEmpty();
    req.checkBody('email', 'choose an email please').notEmpty();
    req.checkBody('email', "pls use a valid email address").isEmail();
    req.checkBody('password', "you didn't pick a password").notEmpty();
    req.checkBody('confirmpassword', 'passwords do not match').equals(req.body.password);

    let error = req.validationErrors();

    if(error) {
      return res.send(error);
    }

    let link = 'hello'

    Email.sendEmail(req.body.email, link)
      .then(response => {
        console.log('success', response)
      }).catch(err => {
        console.log('error', err)
      });

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

    req.checkBody('firstname', 'firstname field is required').notEmpty();
    req.checkBody('lastname', 'lastname field is required').notEmpty();
    req.checkBody('propertyowner', 'this field is required').notEmpty();
    req.checkBody('email', 'choose an email please').notEmpty();
    req.checkBody('email', "pls use a valid email address").isEmail();
    req.checkBody('password', "you didn't pick a password").notEmpty();
    req.checkBody('confirmpassword', 'passwords do not match').equals(req.body.password);

    let error = req.validationErrors();

    if(error) {
      return res.send(error);
    }

    if(body.email !== user.email) {
      let link = 'hello'

      Email.sendEmail(body.email, link)
        .then(response => {
          return res.send('please confirm your new email to finish updating your profile');
        }).catch(err => {
          return console.log('error', err)
        });
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

router.route('/hubswipeuser/property')

  .get(authenticate, (req, res, next) => {

    Property.find({
      owner: req.user._id
    }).then(property => {
      res.send({property})
    })
    .catch(e => {
      res.send(e)
    })
  })
  .post(authenticate, (req, res, next) => {

    let body = _.pick(req.body, ['description']);

    req.checkBody('description', 'this field is required').notEmpty();

    let error = req.validationErrors();

    if(error) {
      return res.send(error);
    }

    let property = new Property(body);
    property.owner = req.user._id;

    property.save().then(property => {
      res.send(property);
    }).catch(e => {
      res.send(e);
    });

  });

router.patch('/hubswipeuser/property/:id', authenticate, (req, res, next) => {
  let propertyId = req.params.id;
  let body = _.pick(req.body, ['description']);

  req.checkBody('description', 'this field is required').notEmpty();

  let error = req.validationErrors();

  if(error) {
    return res.send(error);
  }

  if(!ObjectID.isValid(propertyId)) {
    return res.status(404).send();
  }

  Property.findOneAndUpdate({
    _id: propertyId,
    owner: req.user._id
  }, {$set: body}, {new: true})
  .then(property => {
    if(!property) {
      return res.status(404).send();
    }
    res.send({property});
  })
  .catch(e => {
    res.status(400).send();
  });
});

router.delete('/hubswipeuser/property/:id', authenticate, (req, res, next) => {
  let propertyId = req.params.id;

  if(!ObjectID.isValid(propertyId)) {
    return res.status(404).send();
  }

  Property.findOneAndRemove({
    _id: propertyId,
    owner: req.user._id
  })
  .then(property => {
    if(!property) {
      return res.status(404).send();
    }
    res.send({property});
  })
  .catch(e => {
    res.status(400).send();
  });
})


module.exports = router;
