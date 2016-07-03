'use strict';

var _redis = require('redis');

var _redis2 = _interopRequireDefault(_redis);

var _nodeRedisScripty = require('node-redis-scripty');

var _nodeRedisScripty2 = _interopRequireDefault(_nodeRedisScripty);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

module.exports = function () {
  var redisOptions = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

  var client = _redis2.default.createClient(redisOptions);
  var scripty = new _nodeRedisScripty2.default(client);

  function add(transactionId) {
    return new Promise(function (resolve, reject) {
      client.set(transactionId, 'pending', function (err, res) {
        if (!err) {
          resolve();
        } else {
          reject();
        }
      });
    });
  }

  function setNewState(transactionId, state) {
    return new Promise(function (resolve, reject) {
      scripty.loadScriptFile('checkAndSetState', __dirname + '/lua/checkAndSetState.lua', function (err, script) {
        if (!err) {
          script.run(1, transactionId, state, function (err, res) {
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

  function commit(transactionId) {
    return setNewState(transactionId, 'pending_commit');
  }

  function rollback(transactionId) {
    return setNewState(transactionId, 'pending_rollback');
  }

  function get(transactionId) {
    return new Promise(function (resolve, reject) {
      client.get(transactionId, function (err, res) {
        if (!err) {
          resolve(res);
        } else {
          reject(err);
        }
      });
    });
  }

  function remove(transactionId) {
    return new Promise(function (resolve, reject) {
      client.del(transactionId, function (err, res) {
        if (!err) {
          resolve(res);
        } else {
          reject(err);
        }
      });
    });
  }

  return {
    add: add,
    get: get,
    remove: remove,
    commit: commit,
    rollback: rollback
  };
};