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

function clearUpDatabases(done) {
  let promises = [];
  promises.push(Event.deleteAll());
  promises.push(Job.deleteAll());
  Promise.all(promises).then(res => {
    done();
  });
}

describe('Run Specs for the non transactional system', () => {

  // Simulate a common POST Request to the Wrapper Api of the non transactional system
  describe('Run POST requests', () => {
    /**
     * All 3 steps of the Operation should pass
     * (SUCCESS) 1: Create Event
     * (SUCCESS) 2: Create Job based on eventId
     * (SUCCESS) 3: Update Event with jobId
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
     * The Event API should throw an Error, immediately failing the Request
     * without creating an event, nor a job
     * (FAIL) 1: Create Event
     * (FAIL) 2: Create Job based on eventId
     * (FAIL) 3: Update Event with jobId
     */
    describe('A Event POST request (Event API fails on create)', () => {
      before('Clear up databases', (done) => clearUpDatabases(done));
      it('should fail', done => {
        supertest(nonTransactionalApp)
          .post('/events')
          .send({ publishingDate })
          .set('monkey_POST_event', 'none/500')
          .expect(500, done)
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

    /**
     * The Job API should throw an Error, while an Event was already created
     * (SUCCESS) 1: Create Event
     * (FAIL) 2: Create Job based on eventId
     * (FAIL) 3: Update Event with jobId
     */
    describe('A Event POST request (Job API fails)', () => {
      before('Clear up databases', (done) => clearUpDatabases(done));
      it('should fail', done => {
        supertest(nonTransactionalApp)
          .post('/events')
          .send({ publishingDate })
          .set('monkey_POST_job', 'none/500')
          .expect(500, done)
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

    /**
     * The Event API should throw an Error on the Update Operation,
     * while an Event and a Job were already created
     * (SUCCESS) 1: Create Event
     * (SUCCESS) 2: Create Job based on eventId
     * (FAIL) 3: Update Event with jobId
     */
    describe('A Event POST request (Event API fails on Update Operation)', () => {
      before('Clear up databases', (done) => clearUpDatabases(done));
      it('should fail', done => {
        supertest(nonTransactionalApp)
          .post('/events')
          .send({ publishingDate })
          .set('monkey_PUT_event', 'none/500')
          .expect(500, done)
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
  });

  // Simulate a common PUT Request to the Wrapper Api of the non transactional system
  describe('Run PUT requests', () => {
    /**
     * All 2 steps of the Operation should pass
     * (SUCCESS) 1: Update Event
     * (SUCCESS) 2: Update Job based on eventId
     */
    describe('A Event PUT request', () => {
      let eventId = null;
      let jobId = null;
      before('Clear up databases', (done) => clearUpDatabases(done));
      before('Create an Event', (done) => {
        supertest(nonTransactionalApp)
          .post('/events')
          .send({ publishingDate })
          .expect(200)
          .end((err, res) => {
            if (!err && res) {
              eventId = res.body._id;
              jobId = res.body.jobId
            }
            done(err);
          });
      });
      it('should be successful', done => {
        supertest(nonTransactionalApp)
          .put(`/events/${eventId}`)
          .send({ publishingDate: publishingDate2 })
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(200)
          .end((err, res) => {
            if (!err && res) {
              expect(res.body).to.exist;
              expect(res.body._id).to.exist;
              expect(res.body.jobId).to.exist;
              expect(new Date(res.body.publishingDate)).to.equalDate(publishingDate2);
            }
            done(err);
          });
      });
      it('should have updated the Event in MongoDB', done => {
        Event
          .read(eventId)
          .then(res => {
            expect(new Date(res.publishingDate)).to.equalDate(publishingDate2);
            done();
          })
          .catch(err => {
            done(err);
          });
      });
      it('should have updated the Job in Redis', done => {
        Job
          .read(jobId)
          .then(res => {
            expect(new Date(res.publishingDate)).to.equalDate(publishingDate2);
            done();
          })
          .catch(err => {
            done(err);
          });
      });
    });

    /**
     * The Event Api should throw an Error, both Operations fail
     * (FAIL) 1: Update Event
     * (FAIL) 2: Update Job based on eventId
     */
    describe('A Event PUT request (Event API fails on Update Operation)', () => {
      let eventId = null;
      let jobId = null;
      before('Clear up databases', (done) => clearUpDatabases(done));
      before('Create an Event', (done) => {
        supertest(nonTransactionalApp)
          .post('/events')
          .send({ publishingDate })
          .expect(200)
          .end((err, res) => {
            if (!err && res) {
              eventId = res.body._id;
              jobId = res.body.jobId
            }
            done(err);
          });
      });
      it('should fail', done => {
        supertest(nonTransactionalApp)
          .put(`/events/${eventId}`)
          .send({ publishingDate: publishingDate2 })
          .set('monkey_PUT_event', 'none/500')
          .expect(500, done)
      });
      it('should not have updated the Event in MongoDB', done => {
        Event
          .read(eventId)
          .then(res => {
            expect(new Date(res.publishingDate)).to.equalDate(publishingDate);
            done();
          })
          .catch(err => {
            done(err);
          });
      });
      it('should not have updated the Job in Redis', done => {
        Job
          .read(jobId)
          .then(res => {
            expect(new Date(res.publishingDate)).to.equalDate(publishingDate);
            done();
          })
          .catch(err => {
            done(err);
          });
      });
    });

    /**
     * The Job Api should throw an Error, the Job update operation fails
     * (SUCCESS) 1: Update Event
     * (FAIL) 2: Update Job based on eventId
     */
    describe('A Event PUT request (Job API fails on Update Operation)', () => {
      let eventId = null;
      let jobId = null;
      before('Clear up databases', (done) => clearUpDatabases(done));
      before('Create an Event', (done) => {
        supertest(nonTransactionalApp)
          .post('/events')
          .send({ publishingDate })
          .expect(200)
          .end((err, res) => {
            if (!err && res) {
              eventId = res.body._id;
              jobId = res.body.jobId
            }
            done(err);
          });
      });
      it('should fail', done => {
        supertest(nonTransactionalApp)
          .put(`/events/${eventId}`)
          .send({ publishingDate: publishingDate2 })
          .set('monkey_PUT_job', 'none/500')
          .expect(500, done)
      });
      it('should have updated the Event in MongoDB', done => {
        Event
          .read(eventId)
          .then(res => {
            expect(new Date(res.publishingDate)).to.equalDate(publishingDate2);
            done();
          })
          .catch(err => {
            done(err);
          });
      });
      it('should not have updated the Job in Redis', done => {
        Job
          .read(jobId)
          .then(res => {
            expect(new Date(res.publishingDate)).to.equalDate(publishingDate);
            done();
          })
          .catch(err => {
            done(err);
          });
      });
    });
  });
})

