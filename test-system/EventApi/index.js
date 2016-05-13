'use strict';

const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const log = require('./logger');
const Event = require('./models/Event');
const app = express();
const port = process.env.PORT || process.env.port || 3000;

module.exports = app;

app.models = { Event };

// For parsing application/json
app.use(bodyParser.json());
// For parsing application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

// Connect to MongoDB
if (process.env.NODE_ENV === 'production') {
  mongoose.connect('mongodb://mongo:27017/EventApi');
} else {
  mongoose.connect('mongodb://localhost/EventApi');
}

/**
 * REST Endpoint for creating an Event
 */
app.post('/event', (req, res) => {
  Event.create(req.body)
    .then(response => {
      res.json(response);
    })
    .catch(err => {
      log.error(err);
      res.status(400).json(err);
    });
});

/**
 * REST Endpoint for reading an Event
 */
app.get('/event/:id', (req, res) => {
  const eventId = req.params.id;
  if (eventId !== undefined) {
    Event.read(eventId)
      .then(response => {
        res.status(200).json(response);
      })
      .catch(err => {
        log.error(err);
        res.status(400).json(err);
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
      .then(res => {
        res.json(res);
      })
      .catch(err => {
        log.error(err);
        res.status(400).json(err);
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
      .then(response => {
        res.status(200).end();
      })
      .catch(err => {
        log.error(err);
        res.status(400).json(err);
      });
  } else {
    var err = new Error('id is not defined');
    res.status(400).json(err);
  }
});

app.listen(port);
log.info(`Event API listening at ${port}`)
