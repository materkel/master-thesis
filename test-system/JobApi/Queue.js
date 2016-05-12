const kue = require('kue');
// const redis = require('redis');
// const client = redis.createClient();

/**
 * Create Queue; Setup Redis Connection
 */
const Queue = module.exports = kue.createQueue({
  redis: {
    host: process.env.NODE_ENV === 'production' ? 'redis' : 'localhost',
    port: 6379
  }
});

/**
 * Activate Kue User Interface in DEBUG environment
 */
if(process.env.DEBUG === 'true') {
  kue.app.listen(3333);
}
