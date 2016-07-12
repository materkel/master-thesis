'use strict';

var _redis = require('redis');

var _redis2 = _interopRequireDefault(_redis);

var _nodeRedisScripty = require('node-redis-scripty');

var _nodeRedisScripty2 = _interopRequireDefault(_nodeRedisScripty);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * LockManager Factory
 * @param  {Object} config
 * @param  {string} [config.redisClient = null] - redis client library (optional)
 * @param  {string} [config.redisOptions = {}] - redis configuration (optional)
 * @return {Object}
 */
module.exports = function () {
  var _ref = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

  var _ref$redisClient = _ref.redisClient;
  var redisClient = _ref$redisClient === undefined ? null : _ref$redisClient;
  var _ref$redisOptions = _ref.redisOptions;
  var redisOptions = _ref$redisOptions === undefined ? {} : _ref$redisOptions;

  var client = redisClient || _redis2.default.createClient(redisOptions);
  var scripty = new _nodeRedisScripty2.default(client);

  /**
   * Set a write lock
   * @param  {string} resource
   * @param  {string} id
   * @param  {number} ttl
   * @return {Promise}
   */
  function writeLock(resource, id, ttl) {
    ttl = ttl || 'null';
    return new Promise(function (resolve, reject) {
      scripty.loadScriptFile('setWriteLock', __dirname + '/lua/setWriteLock.lua', function (err, script) {
        if (!err) {
          script.run(1, resource, id, ttl, function (err, res) {
            if (!err) {
              resolve(res);
            } else {
              reject(err);
            }
          });
        } else {
          reject(err);
        }
      });
    });
  }

  /**
   * Remove a write lock
   * @param  {string} lock
   * @param  {string} id
   * @return {Promise}
   */
  function removeWriteLock(lock, id) {
    return new Promise(function (resolve, reject) {
      scripty.loadScriptFile('removeWriteLock', __dirname + '/lua/removeWriteLock.lua', function (err, script) {
        if (!err) {
          script.run(1, lock, id, function (err, res) {
            if (!err) {
              resolve(res);
            } else {
              reject(err);
            }
          });
        } else {
          reject(err);
        }
      });
    });
  }

  /**
   * Set a read lock
   * @param  {string} resource
   * @param  {string} id
   * @param  {number} ttl
   * @return {Promise}
   */
  function readLock(resource, id, ttl) {
    ttl = ttl || 'null';
    return new Promise(function (resolve, reject) {
      scripty.loadScriptFile('setReadLock', __dirname + '/lua/setReadLock.lua', function (err, script) {
        if (!err) {
          script.run(1, resource, id, ttl, function (err, res) {
            if (!err) {
              resolve(res);
            } else {
              reject(err);
            }
          });
        } else {
          reject(err);
        }
      });
    });
  }

  /**
   * Remove a read lock
   * @param  {string} lock
   * @param  {string} id
   * @return {Promise}
   */
  function removeReadLock(lock, id) {
    return new Promise(function (resolve, reject) {
      client.hdel(lock, id, function (err, res) {
        if (!err) {
          client.del(id);
          resolve(res);
        } else {
          reject(err);
        }
      });
    });
  }

  /**
   * Get lock info (type & resource)
   * @param  {string} id
   * @return {Promise}
   */
  function getLockInfo(id) {
    return new Promise(function (resolve, reject) {
      client.hgetall(id, function (err, res) {
        if (!err) {
          resolve(res);
        } else {
          reject();
        }
      });
    });
  }

  /**
   * Try to set a lock
   * @param  {function} fn - lock function which will be tried
   * @param  {number} retries - number of retries
   * @param  {array} parameters - function parameters
   * @return {Promise}
   */
  function tryLock(fn, retries) {
    for (var _len = arguments.length, parameters = Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
      parameters[_key - 2] = arguments[_key];
    }

    return Promise.resolve(fn.apply(undefined, parameters)).then(function (res) {
      return Promise.resolve(res);
    }).catch(function (err) {
      if (retries) {
        retries -= 1;
        return Promise.resolve(tryToSet(fn, parameters, retries));
      } else {
        return Promise.reject(err);
      }
    });
  }

  /**
   * Set a read or write lock
   * @param  {Object} config
   * @param  {string} [config.type]
   * @param  {string} [config.path]
   * @param  {string} [config.id]
   * @param  {number} [config.ttl]
   * @param  {number} [config.retries]
   * @return {Promise}
   */
  function lock(_ref2) {
    var type = _ref2.type;
    var path = _ref2.path;
    var id = _ref2.id;
    var ttl = _ref2.ttl;
    var retries = _ref2.retries;

    if (type === 'read') {
      return tryLock(readLock, retries, path, id, ttl);
    }
    return tryLock(writeLock, retries, path, id, ttl);
  }

  /**
   * Unlock a lock
   * @param  {string} id - lock id
   * @return {Promise}
   */
  function unlock(id) {
    return getLockInfo(id).then(function (res) {
      if (res.type === 'read') {
        return removeReadLock(res.key, id);
      }
      return removeWriteLock(res.key, id);
    });
  }

  return {
    lock: lock,
    unlock: unlock
  };
};