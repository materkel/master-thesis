'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const log = require('./logger');
const Event = require('./models/Event');
const apiMonkey = require('api-monkey');
const app = express();
const port = process.env.PORT || process.env.port || 3000;

module.exports = app;

app.models = { Event };

app.use(apiMonkey());

// For parsing application/json
app.use(bodyParser.json());
// For parsing application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

/**
 * REST Endpoint for creating an Event
 */
app.post('/event', (req, res) => {
  Event.create(req.body)
    .then(event => {
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
app.put('/event/:id', (req, res) => {
  const eventId = req.params.id;
  if (eventId !== undefined) {
    Event.update(eventId, req.body)
      .then(event => {
        res.json(event);
      })
      .catch(err => {
        log.debug(err);
        res.status(500).json(err);
      });
  } else {
    const err = new Error('id is not defined');
    res.status(400).json(err);
  }
});

/**
 * REST Endpoint for deleting an Event
 */
app.delete('/event/:id', (req, res) => {
  const eventId = req.params.id;
  if (eventId !== undefined) {
    Event.delete(eventId)
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

app.listen(port);
log.info(`Event API listening at ${port}`)
