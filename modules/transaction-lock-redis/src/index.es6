import redis from 'redis';
import Scripty from 'node-redis-scripty';

module.exports = ({ redisClient = null, redisOptions = {} } = {}) => {
  let client = redisClient || redis.createClient(redisOptions);
  let scripty = new Scripty(client);

  function writeLock(resource, transactionId, ttl) {
    ttl = ttl || 'null';
    return new Promise((resolve, reject) => {
      scripty.loadScriptFile('setWriteLock', __dirname + '/lua/setWriteLock.lua', (err, script) => {
        if (!err) {
          script.run(1, resource, transactionId, ttl, (err, res) => {
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
    return new Promise((resolve, reject) => {
      scripty.loadScriptFile('removeWriteLock', __dirname + '/lua/removeWriteLock.lua', (err, script) => {
        if (!err) {
          script.run(1, resource, transactionId, (err, res) => {
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
    return new Promise((resolve, reject) => {
      scripty.loadScriptFile('setReadLock', __dirname + '/lua/setReadLock.lua', (err, script) => {
        if (!err) {
          script.run(1, resource, transactionId, ttl, (err, res) => {
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
    return new Promise((resolve, reject) => {
      client.hdel(resource, transactionId, (err, res) => {
        if (!err) {
          resolve(res);
        } else {
          reject(err);
        }
      });
    });
  }

  function tryToSet(fn, retries, ...parameters) {
    return Promise.resolve(fn(...parameters))
      .then(res => {
        return Promise.resolve(res);
      })
      .catch(err => {
        if (retries) {
          retries -= 1
          return Promise.resolve(tryToSet(fn, parameters, retries));
        } else {
          return Promise.reject(err);
        }
      });
  }

  function lock(type, resource, transactionId, ttl, retries) {
    if (type === 'read') {
      return tryToSet(readLock, retries, resource, transactionId, ttl)
    }
    return tryToSet(writeLock, retries, resource, transactionId, ttl)
  }

  function unlock(type, resource, transactionId) {
    if (type === 'read') {
      return removeReadLock(resource, transactionId);
    }
    return removeWriteLock(resource, transactionId);
  }

  return {
    lock,
    unlock
  }
}
