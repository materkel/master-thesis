const express = require('express');
const bodyParser = require('body-parser');
const log = require('./logger');
const Job = require('./models/Job');
const apiMonkey = require('api-monkey');
const app = express();
const port = process.env.PORT || process.env.port || 3001;

module.exports = app;

app.models = { Job };

app.use(apiMonkey());

// for parsing application/json
app.use(bodyParser.json());
// for parsing application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

/**
 * REST Endpoint for creating a job
 */
app.post('/job', (req, res) => {
  Job.create(req.body)
    .then(job => {
      res.json(job);
    })
    .catch(err => {
      log.debug(err);
      res.status(400).json(err);
    });
});

/**
 * REST Endpoint for reading a job
 */
app.get('/job/:id', (req, res) => {
  const jobId = req.params.id;
  if (jobId !== undefined) {
    Job.read(jobId)
      .then(job => {
        res.status(200).json(job);
      })
      .catch(err => {
        log.debug(err);
        res.status(400).json(err);
      });
  } else {
    var err = new Error('id is not defined');
    res.status(400).json(err);
  }
});

/**
 * REST Endpoint for updating a job
 */
app.put('/job/:id', (req, res) => {
  const jobId = req.params.id;
  if (jobId !== undefined) {
    Job.update(jobId, req.body)
      .then(job => {
        res.json(job);
      })
      .catch(err => {
        log.debug(err);
        res.status(400).json(err);
      });
  } else {
    const err = new Error('id is not defined');
    log.error(err);
    res.status(400).json(err);
  }
});

/**
 * REST Endpoint for deleting a job
 */
app.delete('/job/:id', (req, res) => {
  const jobId = req.params.id;
  if (jobId !== undefined) {
    Job.delete(jobId)
      .then(job => {
        res.status(200).end();
      })
      .catch(err => {
        log.debug(err);
        res.status(400).json(err);
      });
  } else {
    const err = new Error('id is not defined');
    res.status(400).json(err);
  }
});

app.listen(port);
log.info(`Job API listening at ${port}`)
