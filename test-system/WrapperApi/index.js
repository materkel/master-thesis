'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const request = require('request-promise');
const log = require('./logger');
const app = express();
const port = process.env.PORT || process.env.port || 3002;

const nodeEnv = process.env.NODE_ENV;
const eventApiUrl = nodeEnv === 'production' ? 'event_api' : 'http://localhost:3000/event';
const jobApiUrl = nodeEnv === 'production' ? 'job_api' : 'http://localhost:3001/job';

module.exports = app;

// For parsing application/json
app.use(bodyParser.json());
// For parsing application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

/**
 * REST Endpoint for creating an Event
 */
app.post('/events', (req, res) => {
  if (req.body) {
    request
      .post({ uri: eventApiUrl, json: req.body })
      .then(event => {
        log.debug('Created Event', event._id);
        return request.post({ uri: jobApiUrl, json: { eventId: event._id, publishingDate: req.body.publishingDate } })
      })
      .then(job => {
        log.debug('Created Job', job);
        return request.put({ uri: `${eventApiUrl}/${job.eventId}`, json: { jobId: job.id } })
      })
      .then(event => {
        log.debug('Updated Event', event);
        res.json(event);
      })
      .catch(err => {
        log.error(err);
        res.status(err.status || 500).json(err);
      });
  }
});

/**
 * REST Endpoint for reading an Event
 */
app.get('/events/:id', (req, res) => {
  const eventId = req.params.id;
  if (eventId) {
    request({ uri: eventApiUrl })
      .then(event => res.json(event))
      .catch(err => {
        log.error(err);
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
app.put('/events/:id', (req, res) => {
  const eventId = req.params.id;
  if (eventId && req.body) {
    request
      .put({ uri: `${eventApiUrl}/${eventId}`, json: req.body })
      .then(event => {
        if (req.body.publishingDate) {
          return request
            .put({ uri: `${jobApiUrl}/${event.jobId}`, json: { publishingDate: req.body.publishingDate } })
            .then(job => event);
        } else {
          return Promise.resolve(event);
        }
      })
      .then(event => res.json(event))
      .catch(err => {
        log.error(err);
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
app.delete('/events/:id', (req, res) => {
  const eventId = req.params.id;
  if (eventId !== undefined) {
    request
      .del({ uri: `${eventApiUrl}/${eventId}` })
      .then(event => request.del({ uri: `${jobApiUrl}/${event.jobId}` }))
      .then(job => res.status(200))
      .catch(err => {
        log.error(err);
        res.status(err.status || 500).json(err);
      });
  } else {
    var err = new Error('id is not defined');
    res.status(400).json(err);
  }
});

app.listen(port);
log.info(`Wrapper API listening at ${port}`)
