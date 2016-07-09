'use strict';

var _redis = require('redis');

var _redis2 = _interopRequireDefault(_redis);

var _nodeRedisScripty = require('node-redis-scripty');

var _nodeRedisScripty2 = _interopRequireDefault(_nodeRedisScripty);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

module.exports = function () {
  var _ref = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

  var _ref$redisClient = _ref.redisClient;
  var redisClient = _ref$redisClient === undefined ? null : _ref$redisClient;
  var _ref$redisOptions = _ref.redisOptions;
  var redisOptions = _ref$redisOptions === undefined ? {} : _ref$redisOptions;

  var client = redisClient || _redis2.default.createClient(redisOptions);
  var scripty = new _nodeRedisScripty2.default(client);

  function writeLock(resource, transactionId, ttl) {
    ttl = ttl || 'null';
    return new Promise(function (resolve, reject) {
      scripty.loadScriptFile('setWriteLock', __dirname + '/lua/setWriteLock.lua', function (err, script) {
        if (!err) {
          script.run(1, resource, transactionId, ttl, function (err, res) {
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

  function removeWriteLock(resource, transactionId) {
    return new Promise(function (resolve, reject) {
      scripty.loadScriptFile('removeWriteLock', __dirname + '/lua/removeWriteLock.lua', function (err, script) {
        if (!err) {
          script.run(1, resource, transactionId, function (err, res) {
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

  function readLock(resource, transactionId, ttl) {
    ttl = ttl || 'null';
    return new Promise(function (resolve, reject) {
      scripty.loadScriptFile('setReadLock', __dirname + '/lua/setReadLock.lua', function (err, script) {
        if (!err) {
          script.run(1, resource, transactionId, ttl, function (err, res) {
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

  function removeReadLock(resource, transactionId) {
    return new Promise(function (resolve, reject) {
      client.hdel(resource, transactionId, function (err, res) {
        if (!err) {
          resolve(res);
        } else {
          reject(err);
        }
      });
    });
  }

  function tryToSet(fn, retries) {
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

  function lock(type, resource, transactionId, ttl, retries) {
    if (type === 'read') {
      return tryToSet(readLock, retries, resource, transactionId, ttl);
    }
    return tryToSet(writeLock, retries, resource, transactionId, ttl);
  }

  function unlock(type, resource, transactionId) {
    if (type === 'read') {
      return removeReadLock(resource, transactionId);
    }
    return removeWriteLock(resource, transactionId);
  }

  return {
    lock: lock,
    unlock: unlock
  };
};