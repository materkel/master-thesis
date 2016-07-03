import redis from 'redis';
import Scripty from 'node-redis-scripty';

module.exports = (redisOptions = {}) => {
  let client = redis.createClient(redisOptions);
  let scripty = new Scripty(client);

  function add(transactionId) {
    return new Promise((resolve, reject) => {
      client.set(transactionId, 'pending', (err, res) => {
        if (!err) {
          resolve();
        } else {
          reject();
        }
      });
    });
  }

  function setNewState(transactionId, state) {
    return new Promise((resolve, reject) => {
      scripty.loadScriptFile('checkAndSetState', __dirname + '/lua/checkAndSetState.lua', (err, script) => {
        if (!err) {
          script.run(1, transactionId, state, (err, res) => {
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
    return new Promise((resolve, reject) => {
      client.get(transactionId, (err, res) => {
        if (!err) {
          resolve(res);
        } else {
          reject(err);
        }
      });
    });
  }

  function remove(transactionId) {
    return new Promise((resolve, reject) => {
      client.del(transactionId, (err, res) => {
        if (!err) {
          resolve(res);
        } else {
          reject(err);
        }
      });
    });
  }

  return {
    add,
    get,
    remove,
    commit,
    rollback
  }
}
