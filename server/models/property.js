const {mongoose} = require('../db/mongoose');
const mongooseAlgolia = require('mongoose-algolia');

const PropertySchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
});

const Property = mongoose.model('Property', PropertySchema);

module.exports = {Property};
