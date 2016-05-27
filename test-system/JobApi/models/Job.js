'use strict';

const log = require('../logger');
const kue = require('kue');
const Queue = require('./Queue');

const redis = require('redis');
const client = redis.createClient({
  host: process.env.NODE_ENV === 'production' ? 'redis' : 'localhost',
  port: 6379
});

module.exports = {
  /**
   * Create Job
   */
  create: data => {
    return new Promise((resolve, reject) => {
      try {
        const eventId = data.eventId || data.id;
        const publishingDate = data.publishingDate;
        const delay = new Date(publishingDate) - new Date();

        let job = Queue.create('event', {
          eventId,
          publishingDate
        })
        .delay(delay)
        .removeOnComplete(true)
        .ttl(10000)
        .attempts(5)
        .backoff({ delay: 10 * 1000, type: 'fixed' })
        .save(err => {
          if (!err) {
            log.debug(`Kue Job created with id ${job.id} and delay ${delay}`);
            resolve({id: job.id, eventId, publishingDate, delay });
          } else {
            reject(err);
          }
        });
      } catch (e) {
        reject(e);
      }
    });
  },

  /**
   * Read Job
   */
  read: id => {
    return new Promise((resolve, reject) => {
      try {
        kue.Job.get(id, (err, job) => {
          if (!err) {
            resolve({
              id: job.id,
              publishingDate: new Date(job.data.publishingDate),
              eventId: job.data.eventId
            });
          } else {
            reject(err);
          }
        });
      } catch(e) {
        reject(e);
      }
    });
  },

  /**
   * Update Job
   */
  update: (id, data) => {
    return new Promise((resolve, reject) => {
      try {
        const publishingDate = data.publishingDate;
        const delay = new Date(publishingDate) - new Date();

        kue.Job.get(id, (err, job) => {
          if (err || job === undefined) {
            reject(err);
          }
          job.publishingDate = publishingDate;
          job
            .delay(delay)
            .save(err => {
              if (!err) {
                log.debug(`Updated delay for job ${id}`);
                resolve({ id: job.id, publishingDate: publishingDate, delay: delay });
              } else {
                log.error(err);
                reject(err);
              }
            });
        });
      } catch(err) {
        reject(err);
      }
    });
  },

  /**
   * Delete Job
   */
  delete: id => {
    return new Promise((resolve, reject) => {
      try {
        kue.Job.get(id, (err, job) => {
          if (!err) {
            job.remove(err => {
              if (!err) {
                log.debug(`Removed job #${id}`);
                resolve(true);
              } else {
                reject(err);
              }
            });
          } else {
            reject(err);
          }
        });
      } catch(e) {
        reject(e);
      }
    });
  },

  /**
   * Get all Jobs
   */
  findAll: () => {
    // todo
  },

  /**
   * Count all Jobs
   */
  count: () => {
    return new Promise((resolve, reject) => {
      client.dbsize((err, count) => {
        if (!err) {
          resolve(count);
        }
        reject(err);
      });
    });
  },

  /**
   * Delete all Jobs
   */
  deleteAll: () => {
    return new Promise((resolve, reject) => {
      client.flushdb((err, res) => {
        if (!err) {
          resolve(res);
        }
        reject(err);
      });
    });
  }
}
