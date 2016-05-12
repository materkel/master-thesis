const express = require('express');
const bodyParser = require('body-parser');
const log = require('./logger');
const Job = require('./Job');
const app = express();

module.exports = app;

app.models = { Job };

// for parsing application/json
app.use(bodyParser.json());
// for parsing application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

/**
 * REST Endpoint for creating a job
 */
app.post('/job', (req, res) => {
  Job.create(req.body)
    .then(response => {
      res.json(response);
    })
    .catch(err => {
      log.error(err);
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
 * REST Endpoint for updating a job
 */
app.put('/job/:id', (req, res) => {
  const jobId = req.params.id;
  if (jobId !== undefined) {
    Job.update(jobId, req.body)
      .then(res => {
        res.json(res);
      })
      .catch(err => {
        log.error(err);
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
      .then(response => {
        res.status(200).end();
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

app.listen(process.env.PORT || process.env.port || 3001);
log.info(`Job API listening at ${process.env.PORT || process.env.port || 3001}`)
