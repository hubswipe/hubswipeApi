var mongoose = require('mongoose');

mongoose.Promise = global.Promise;
mongoose.connect(process.env.MONGODB_URI || "mongodb://heroku_c0kn6lpq:t1kicllp34t2nakklovmhfq261@ds163612.mlab.com:63612/heroku_c0kn6lpq" ||"mongodb://localhost:27017/hubswipe");

module.exports = {mongoose};
