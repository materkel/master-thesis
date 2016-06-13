const express = require('express');
const bodyParser = require('body-parser');
const log = require('./logger');
const Job = require('./models/Job');
const apiMonkey = require('api-monkey');
const app = express();
const port = process.env.PORT || process.env.port || 3005;

const transactionUtil = require('../../modules/transaction-utility-amqp')();
const compensationLib = require('../../modules/compensation-js');

process.title = process.argv[2];

module.exports = app;

app.models = { Job };

app.use(apiMonkey());

// Set up compensating action method mapping
const compensations = {
  'create': Job.create,
  'update': Job.update,
  'delete': Job.delete
}

const redisOptions = {
  host: process.env.NODE_ENV === 'production' ? 'redis' : 'localhost',
  port: 6379
}

const compensation = compensationLib(compensations, redisOptions);

// Set up transaction listener for the job API
transactionUtil.listener('job', msg => {
  let { id, action } = JSON.parse(msg.content.toString());
  if (action === 'r') {
    log.debug('Run compensating action (rollback transaction)');
    compensation.run(id, 'job');
  } else {
    log.debug('Remove compensating action (commit transaction)');
    compensation.remove(id, 'job');
  }
});

// Transaction middleware
function handleTransaction(req, res, next) {
  if (req.get('transaction_id')) {
    log.debug('Handle Transaction');
    // get transaction id
    const transactionId = req.get('transaction_id');
    // listen for commit/rollback
    transactionUtil.listen('job', transactionId);
  }
  next();
}

// for parsing application/json
app.use(bodyParser.json());
// for parsing application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

/**
 * REST Endpoint for creating a job
 */
app.post('/job', handleTransaction, (req, res) => {
  Job
    .create(req.body)
    .then(job => {
      if (req.get('transaction_id')) {
        compensation.add(req.get('transaction_id'), 'delete', job.id);
      }
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
app.put('/job/:id', handleTransaction, (req, res) => {
  const jobId = req.params.id;
  if (jobId !== undefined) {
    if (req.get('transaction_id')) {
      // fetch previous version to add its data to the update compensation
      Job
        .read(jobId)
        .then(origJob => {
          log.info('Add compensation');
          compensation.add(req.get('transaction_id'), 'update', jobId, origJob);
          return Job
            .update(jobId, req.body)
            .then(job => {
              res.json(job);
            });
        })
        .catch(err => {
          log.debug(err);
          res.status(400).json(err);
        });
    } else {
      Job
        .update(jobId, req.body)
        .then(job => {
          res.json(job);
        })
        .catch(err => {
          log.debug(err);
          res.status(400).json(err);
        });
    }
  } else {
    const err = new Error('id is not defined');
    log.error(err);
    res.status(400).json(err);
  }
});

/**
 * REST Endpoint for deleting a job
 */
app.delete('/job/:id', handleTransaction, (req, res) => {
  const jobId = req.params.id;
  if (jobId !== undefined) {
    if (req.get('transaction_id')) {
      // fetch previous version to add its data to the create compensation
      Job
        .read(jobId)
        .then(origJob => {
          log.info('Add compensation');
          compensation.add(req.get('transaction_id'), 'create', origJob);
          return Job
            .delete(jobId)
            .then(job => {
              res.status(200).end();
            });
        })
        .catch(err => {
          log.debug(err);
          res.status(400).json(err);
        });
    } else {
      Job
        .delete(jobId)
        .then(job => {
          res.status(200).end();
        })
        .catch(err => {
          log.debug(err);
          res.status(400).json(err);
        });
    }
  } else {
    const err = new Error('id is not defined');
    res.status(400).json(err);
  }
});

app.listen(port);
log.info(`Job API listening at ${port}`)
