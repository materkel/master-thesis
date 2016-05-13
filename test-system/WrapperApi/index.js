'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const request = require('request-promise');
const log = require('./logger');
const app = express();
const port = process.env.PORT || process.env.port || 3002;

module.exports = app;

// For parsing application/json
app.use(bodyParser.json());
// For parsing application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

/**
 * REST Endpoint for creating an Event
 */
app.post('/events', (req, res) => {

});

/**
 * REST Endpoint for reading an Event
 */
app.get('/events/:id', (req, res) => {
  const eventId = req.params.id;
  if (eventId !== undefined) {

  } else {
    var err = new Error('id is not defined');
    res.status(400).json(err);
  }
});

/**
 * REST Endpoint for updating an Event
 */
app.put('/events/:id', (req, res) => {
  const eventId = req.params.id;
  if (eventId !== undefined) {

  } else {
    const err = new Error('id is not defined');
    res.status(400).json(err);
  }
});

/**
 * REST Endpoint for deleting an Event
 */
app.delete('/events/:id', (req, res) => {
  const eventId = req.params.id;
  if (eventId !== undefined) {

  } else {
    var err = new Error('id is not defined');
    res.status(400).json(err);
  }
});

app.listen(port);
log.info(`Wrapper API listening at ${port}`)