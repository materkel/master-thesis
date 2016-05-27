const mongoose = require('mongoose');

/**
 * Create DB; Setup MongoDB Connection
 */
const MongoDB = module.exports = (process.env.NODE_ENV === 'production') ?
  mongoose.connect('mongodb://mongo:27017/EventApi') :
  mongoose.connect('mongodb://localhost/EventApi');
