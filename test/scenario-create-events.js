'use strict';

const chai = require('chai');
const expect = chai.expect;
chai.use(require('chai-datetime'));

const supertest = require('supertest');
const request = require('request-promise');

const nonTransactionalApp = require('../test-system/WrapperApi/index');
const Event = require('../test-system/EventApi/models/Event');
const Job = require('../test-system/JobApi/models/Job');

const publishingDate = new Date();
const publishingDate2 = new Date(publishingDate);
publishingDate2.setDate(publishingDate2.getDate() + 5);
let eventId = null;

function clearUpDatabases(done) {
  let promises = [];
  promises.push(Event.deleteAll());
  promises.push(Job.deleteAll());
  Promise.all(promises).then(res => {
    done();
  });
}

describe('Run Specs for the non transactional system', () => {

  /**
   * Simulate a common Request to the Wrapper Api of the non transactional system
   * All 3 steps of the Operation should pass
   * 1: Create Event
   * 2: Create Job based on eventId
   * 3: Update Event with jobId
   */

  describe('A Event POST request', () => {
    before('Clear up databases', (done) => clearUpDatabases(done));
    it('should be successful', done => {
      supertest(nonTransactionalApp)
        .post('/events')
        .send({ publishingDate })
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200)
        .end((err, res) => {
          if (!err && res) {
            expect(res.body).to.exist;
            expect(res.body._id).to.exist;
            expect(res.body.jobId).to.exist;
            expect(new Date(res.body.publishingDate)).to.equalDate(publishingDate);
          }
          done(err);
        });
    });

    it('should have created an Event in MongoDB', done => {
      Event
        .count()
        .then(res => {
          expect(res).to.be.equal(1);
          done();
        })
        .catch(err => {
          done(err);
        });
    });

    it('should have created a Job in Redis', done => {
      Job
        .count()
        .then(res => {
          expect(res).to.be.equal(1);
          done();
        })
        .catch(err => {
          done(err);
        });
    });
  });

  /**
   * Simulate a common Request to the Wrapper Api of the non transactional system
   * The Event API should throw an Error, immediately failing the Request
   * without creating an event, nor a job
   */

  describe('A failed Event POST request', () => {
    before('Clear up databases', (done) => clearUpDatabases(done));
    it('should fail', done => {
      supertest(nonTransactionalApp)
        .post('/events')
        .send({ publishingDate })
        .set('monkey_POST_event', 'none/500')
        .expect(200, done)
    });

    it('should not have created an Event in MongoDB', done => {
      Event
        .count()
        .then(res => {
          expect(res).to.be.equal(0);
          done();
        })
        .catch(err => {
          done(err);
        });
    });

    it('should not have created a Job in Redis', done => {
      Job
        .count()
        .then(res => {
          expect(res).to.be.equal(0);
          done();
        })
        .catch(err => {
          done(err);
        });
    });
  });
})

