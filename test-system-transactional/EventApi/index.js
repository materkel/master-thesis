'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const log = require('./logger');
const Event = require('./models/Event');
const apiMonkey = require('api-monkey');
const app = express();
const port = process.env.PORT || process.env.port || 3004;

const transactionUtil = require('../../modules/transaction-utility-amqp')();
const compensationLib = require('../../modules/compensation-js');

process.title = process.argv[2];

module.exports = app;

app.models = { Event };

app.use(apiMonkey());

const compensations = {
  'create': Event.create,
  'update': Event.update,
  'delete': Event.delete
}
const redisOptions = {
  host: process.env.NODE_ENV === 'production' ? 'redis' : 'localhost',
  port: 6379,
  db: 2
}
const compensationConfig = { compensations, redisOptions, id: 'EventApi', multiple: true };
const compensation = compensationLib(compensationConfig);

// Set up transaction listeners for the event API
transactionUtil.listener('event', data => {
  log.debug(`Receive 'end of transaction' message ${data}`);
  let { id, action } = data;
  if (action === 'r') {
    log.debug(`Run compensating action (rollback transaction) for id ${id}`);
    return compensation.run(id);
  } else {
    log.debug(`Remove compensating action (commit transaction) for id ${id}`);
    return compensation.remove(id);
  }
});

// Transaction middleware
function handleTransaction(req, res, next) {
  if (req.get('transaction_id')) {
    log.debug('Handle Transaction');
    const transactionId = req.get('transaction_id');
    req.transactionId = transactionId;
    // listen for commit/rollback
    transactionUtil.listen('event', transactionId);
  }
  next();
}

// For parsing application/json
app.use(bodyParser.json());
// For parsing application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

/**
 * REST Endpoint for creating an Event
 */
app.post('/event', handleTransaction, (req, res) => {
  Event
    .create(req.body)
    .then(event => {
      if (req.transactionId) {
        log.debug('Add compensation');
        compensation.add(req.transactionId, 'delete', event.id)
      }
      res.json(event);
    })
    .catch(err => {
      log.debug(err);
      res.status(500).json(err);
    });
});

/**
 * REST Endpoint for reading an Event
 */
app.get('/event/:id', (req, res) => {
  const eventId = req.params.id;
  if (eventId !== undefined) {
    Event.read(eventId)
      .then(event => {
        res.json(event);
      })
      .catch(err => {
        log.debug(err);
        res.status(500).json(err);
      });
  } else {
    var err = new Error('id is not defined');
    res.status(400).json(err);
  }
});

/**
 * REST Endpoint for updating an Event
 */
app.put('/event/:id', handleTransaction, (req, res) => {
  const eventId = req.params.id;
  if (eventId !== undefined) {
    if (req.transactionId) {
      // fetch previous version to add its data to the update compensation
      Event
        .read(eventId)
        .then(origEvent => {
          return Event
            .update(eventId, req.body)
            .then(event => {
              log.debug('Add compensation');
              compensation.add(req.transactionId, 'update', eventId, origEvent);
              res.json(event);
            });
        })
        .catch(err => {
          log.debug(err);
          res.status(500).json(err);
        });
    } else {
      Event
        .update(eventId, req.body)
        .then(event => {
          res.json(event);
        })
        .catch(err => {
          log.debug(err);
          res.status(500).json(err);
        });
    }
  } else {
    const err = new Error('id is not defined');
    res.status(400).json(err);
  }
});

/**
 * REST Endpoint for deleting an Event
 */
app.delete('/event/:id', handleTransaction, (req, res) => {
  const eventId = req.params.id;
  if (eventId !== undefined) {
    if (req.transactionId) {
      // fetch previous version to add its data to the create compensation
      Event
        .read(eventId)
        .then(origEvent => {
          return Event
            .delete(eventId)
            .then(event => {
              log.debug('Add compensation');
              compensation.add(req.transactionId, 'create', origEvent);
              res.json(event);
            });
        })
        .catch(err => {
          log.debug(err);
          res.status(500).json(err);
        });
    } else {
      Event
        .delete(eventId)
        .then(event => {
          res.json(event);
        })
        .catch(err => {
          log.debug(err);
          res.status(500).json(err);
        });
    }
  } else {
    var err = new Error('id is not defined');
    res.status(400).json(err);
  }
});

app.listen(port);
log.info(`Event API listening at ${port}`)
