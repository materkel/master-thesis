import redis from 'redis';
import Scripty from 'node-redis-scripty';

/**
 * LockManager Factory
 * @param  {Object} config
 * @param  {string} [config.redisClient = null] - redis client library (optional)
 * @param  {string} [config.redisOptions = {}] - redis configuration (optional)
 * @return {Object}
 */
module.exports = ({ redisClient = null, redisOptions = {} } = {}) => {
  let client = redisClient || redis.createClient(redisOptions);
  let scripty = new Scripty(client);

  /**
   * Set a write lock
   * @param  {string} resource
   * @param  {string} id
   * @param  {number} ttl
   * @return {Promise}
   */
  function writeLock(resource, id, ttl) {
    ttl = ttl || 'null';
    return new Promise((resolve, reject) => {
      scripty.loadScriptFile('setWriteLock', __dirname + '/lua/setWriteLock.lua', (err, script) => {
        if (!err) {
          script.run(1, resource, id, ttl, (err, res) => {
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
    return new Promise((resolve, reject) => {
      scripty.loadScriptFile('removeWriteLock', __dirname + '/lua/removeWriteLock.lua', (err, script) => {
        if (!err) {
          script.run(1, lock, id, (err, res) => {
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
    return new Promise((resolve, reject) => {
      scripty.loadScriptFile('setReadLock', __dirname + '/lua/setReadLock.lua', (err, script) => {
        if (!err) {
          script.run(1, resource, id, ttl, (err, res) => {
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
    return new Promise((resolve, reject) => {
      client.hdel(lock, id, (err, res) => {
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
    return new Promise((resolve, reject) => {
      client.hgetall(id, (err, res) => {
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
  function tryLock(fn, retries, ...parameters) {
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
  function lock({ type, path, id, ttl, retries }) {
    if (type === 'read') {
      return tryLock(readLock, retries, path, id, ttl)
    }
    return tryLock(writeLock, retries, path, id, ttl)
  }

  /**
   * Unlock a lock
   * @param  {string} id - lock id
   * @return {Promise}
   */
  function unlock(id) {
    return getLockInfo(id)
      .then(res => {
        if (res.type === 'read') {
          return removeReadLock(res.key, id);
        }
        return removeWriteLock(res.key, id);
      });
  }

  return {
    lock,
    unlock
  }
}
