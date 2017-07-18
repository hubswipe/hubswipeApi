const {mongoose} = require('../db/mongoose');
const validator = require('validator');
const _ = require('lodash');
const mongooseAlgolia = require('mongoose-algolia');

const PropertySchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  description: {
    type: String,
    required: true,
    unique: false,
  },
  views: {
    type: String
    //review this
  },
  geoLocation: {
    type: String
    //review this
  }
});

const Property = mongoose.model('Property', PropertySchema);

module.exports = {Property};
