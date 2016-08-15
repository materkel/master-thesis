'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const request = require('request-promise');
const log = require('./logger');
const app = express();
const apiMonkey = require('api-monkey');
const port = process.env.PORT || process.env.port || 3008;

const nodeEnv = process.env.NODE_ENV;
const eventApiUrl = nodeEnv === 'production' ? 'event_api' : 'http://localhost:3004/event';
const jobApiUrl = nodeEnv === 'production' ? 'job_api' : 'http://localhost:3005/job';

const lockManager = require('../../modules/transaction-lock-redis')({db: 4});
const transactionUtil = require('../../modules/transaction-utility-amqp')();

process.title = process.argv[2];

module.exports = app;

app.use(apiMonkey());

function beginTransaction(req, res, next) {
  log.debug('Start Transaction');
  // generate transaction id
  const transactionId = transactionUtil.generateId();
  // set transaction header
  req.transactionHeader = { 'transaction_id': transactionId };
  // set transaction id
  req.transactionId = transactionId;
  next();
}

function aquireLock(req, res, next) {
  const type = req.method !== 'GET' ? 'write' : 'read';
  lockManager
    .lock({
      type,
      path: '/events',
      id: req.transactionId,
      ttl: 10000,
      retries: 500,
      backoff: {
        min: 30,
        max: 100
      }
    })
    .then(success => {
      next();
    })
    .catch(err => {
      res.status(500).json('Failed to aquire a lock for this resource');
    });
}

// For parsing application/json
app.use(bodyParser.json());
// For parsing application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

/**
 * REST Endpoint for creating an Event
 */
app.post('/events', beginTransaction, aquireLock, (req, res) => {
  if (req.body) {
    let headers = Object.assign(req.monkeyHeaders, req.transactionHeader);
    request
      .post({ uri: eventApiUrl, json: req.body, headers })
      .then(event => {
        log.debug('Created Event', event);
        return request
          .post({
            uri: jobApiUrl,
            json: { eventId: event._id, publishingDate: req.body.publishingDate },
            headers
          });
      })
      .then(job => {
        log.debug('Created Job', job);
        return request
          .put({
            uri: `${eventApiUrl}/${job.eventId}`,
            json: { jobId: job.id },
            headers
          });
      })
      .then(event => {
        log.debug('Updated Event', event);
        // COMMIT TRANSACTION
        log.debug('Commit transaction');
        transactionUtil.commit(req.transactionId)
          .then(() => lockManager.unlock(req.transactionId))
          .then(() => res.json(event));
      })
      .catch(err => {
        // ROLLBACK TRANSACTION
        log.debug('Rollback transaction');
        transactionUtil.rollback(req.transactionId)
          .then(() => lockManager.unlock(req.transactionId));
        res.status(err.status || 500).json(err);
      });
  } else {
    res.status(400).end();
  }
});

/**
 * REST Endpoint for reading an Event
 */
app.get('/events/:id', beginTransaction, aquireLock, (req, res) => {
  const eventId = req.params.id;
  if (eventId) {
    request.get({ uri: `${eventApiUrl}/${eventId}`, headers: req.monkeyHeaders })
      .then(event => {
        log.debug('Read Event', event);
        lockManager.unlock(req.transactionId)
          .then(() => res.json(JSON.parse(event)));
      })
      .catch(err => {
        log.debug(err);
        res.status(err.status || 500).json(err);
      });
  } else {
    var err = new Error('id is not defined');
    res.status(400).json(err);
  }
});

/**
 * REST Endpoint for updating an Event
 */
app.put('/events/:id', beginTransaction, aquireLock, (req, res) => {
  const eventId = req.params.id;
  if (eventId && req.body) {
    let headers = Object.assign(req.monkeyHeaders, req.transactionHeader);
    request
      .put({ uri: `${eventApiUrl}/${eventId}`, json: req.body, headers })
      .then(event => {
        // Only update the Job if a publishingDate is present in the original request
        if (req.body.publishingDate) {
          return request
            .put({
              uri: `${jobApiUrl}/${event.jobId}`,
              json: { publishingDate: req.body.publishingDate },
              headers
            })
            .then(job => event);
        } else {
          return Promise.resolve(event);
        }
      })
      .then(event => {
        // COMMIT TRANSACTION
        transactionUtil.commit(req.transactionId)
          .then(() => lockManager.unlock(req.transactionId))
          .then(() => res.json(event));
      })
      .catch(err => {
        // ROLLBACK TRANSACTION
        log.debug('Rollback transaction');
        transactionUtil.rollback(req.transactionId)
          .then(() => lockManager.unlock(req.transactionId));
        log.debug(err);
        res.status(err.status || 500).json(err);
      });
  } else {
    const err = new Error('id is not defined');
    res.status(400).json(err);
  }
});

/**
 * REST Endpoint for deleting an Event
 */
app.delete('/events/:id', beginTransaction, aquireLock, (req, res) => {
  const eventId = req.params.id;
  if (eventId !== undefined) {
    let headers = Object.assign(req.monkeyHeaders, req.transactionHeader);
    request
      .del({ uri: `${eventApiUrl}/${eventId}`, headers })
      .then(event => {
        log.debug('Deleted Event', event);
        return request
          .del({ uri: `${jobApiUrl}/${JSON.parse(event).jobId}`, headers });
      })
      .then(() => {
        // COMMIT TRANSACTION
        transactionUtil.commit(req.transactionId)
          .then(() => lockManager.unlock(req.transactionId))
          .then(() => res.status(200).end());
      })
      .catch(err => {
        // ROLLBACK TRANSACTION
        log.debug('Rollback transaction');
        transactionUtil.rollback(req.transactionId)
          .then(() => lockManager.unlock(req.transactionId));
        log.debug(err);
        res.status(err.status || 500).json(err);
      });
  } else {
    var err = new Error('id is not defined');
    res.status(400).json(err);
  }
});

app.listen(port);
log.info(`Wrapper API listening at ${port}`)
