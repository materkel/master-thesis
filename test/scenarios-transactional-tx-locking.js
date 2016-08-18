'use strict';

const chai = require('chai');
const expect = chai.expect;
chai.use(require('chai-datetime'));

const supertest = require('supertest');
const request = require('request-promise');

const transactionalApp = require('../test-system-transactional/WrapperApi/index_txLock');
const Event = require('../test-system-transactional/EventApi/models/Event');
const Job = require('../test-system-transactional/JobApi/models/Job');

const publishingDate = new Date();
const publishingDate2 = new Date(publishingDate);
const publishingDate3 = new Date(publishingDate);
publishingDate2.setDate(publishingDate2.getDate() + 5);
publishingDate3.setDate(publishingDate3.getDate() + 10);

function clearUpDatabases(done) {
  let promises = [];
  promises.push(Event.deleteAll());
  promises.push(Job.deleteAll());
  Promise.all(promises).then(res => {
    done();
  });
}

describe('Run Specs for the transactional system with locking', () => {

  // Simulate common POST Requests to the Wrapper Api of the non transactional system
  describe('Run POST requests', () => {
    /**
     * All 3 steps of the Operation should pass
     * (SUCCESS) 1: Create Event
     * (SUCCESS) 2: Create Job based on eventId
     * (SUCCESS) 3: Update Event with jobId
     */
    describe('An Event POST request', () => {
      before('Clear up databases', (done) => clearUpDatabases(done));
      it('should be successful', done => {
        supertest(transactionalApp)
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
        setTimeout(() => {
          Event
            .count()
            .then(res => {
              expect(res).to.be.equal(1);
              done();
            })
            .catch(err => {
              done(err);
            });
        }, 500);
      });
      it('should have created a Job in Redis', done => {
        setTimeout(() => {
          Job
            .count()
            .then(res => {
              expect(res).to.be.equal(1);
              done();
            })
            .catch(err => {
              done(err);
            });
        }, 500);
      });
    });

    describe('Multiple Event POST requests', () => {
      before('Clear up databases', (done) => clearUpDatabases(done));
      it('should be successful', done => {
        function req() {
          return new Promise((resolve, reject) => {
            supertest(transactionalApp)
            .post('/events')
            .send({ publishingDate })
            .end((err, res) => {
              if (!err && res) {
                resolve(res);
              } else {
                reject(err);
              }
            });
          })
        }

        let promises = [];
        promises.push(req());
        promises.push(req());
        promises.push(req());
        Promise.all(promises).then(res => {
          done();
        });
      });
      it('should have created 3 Events in MongoDB', done => {
        setTimeout(() => {
          Event
            .count()
            .then(res => {
              expect(res).to.be.equal(3);
              done();
            })
            .catch(err => {
              done(err);
            });
        }, 800);
      });
      it('should have created 3 Jobs in Redis', done => {
        setTimeout(() => {
          Job
            .count()
            .then(res => {
              expect(res).to.be.equal(3);
              done();
            })
            .catch(err => {
              done(err);
            });
        }, 800);
      });
    });
  });

  // Simulate common PUT Requests to the Wrapper Api of the non transactional system
  describe('Run PUT requests', () => {
  /**
   * 2 requests from user interactions produce a "lost update"
   * request a -> Update Event
   * request b -> Update Event
   * request b -> Update Job
   * request a -> Update Job
   * the updated data from request b gets lost, despite originally starting later
   * Event and Job data are corrupted (not matching anymore)
   */
    describe('When issuing 2 conflicting Event PUT request (one part of the request is too slow)', () => {
      let eventId = null;
      let jobId = null;
      before('Clear up databases', (done) => clearUpDatabases(done));
      before('Create an Event', (done) => {
        supertest(transactionalApp)
          .post('/events')
          .send({ publishingDate })
          .expect(200)
          .end((err, res) => {
            if (!err && res) {
              eventId = res.body._id;
              jobId = res.body.jobId;
              done();
            } else {
              done(err);
            }
          });
      });
      it('the requests should succeed', done => {
        function requestA() {
          return new Promise((resolve, reject) => {
            supertest(transactionalApp)
              .put(`/events/${eventId}`)
              .send({ publishingDate: publishingDate2 })
              .set('monkey_PUT_job', '500/none')
              .expect(200)
              .end((err, res) => {
                if (!err && res) {
                  resolve();
                } else {
                  reject(err);
                }
              });
          });
        }
        function requestB() {
          return new Promise((resolve, reject) => {
            supertest(transactionalApp)
              .put(`/events/${eventId}`)
              .send({ publishingDate: publishingDate3 })
              .set('monkey_PUT_event', '10/none')
              .end((err, res) => {
                if (!err && res) {
                  resolve();
                } else {
                  reject(err);
                }
              });
          });
        }
        let promises = [];
        promises.push(requestA());
        promises.push(requestB());
        Promise
          .all(promises)
          .then(res => {
            done()
          })
          .catch(err => done(err));
      });
      it('the Event in MongoDB should contain data from Request B', done => {
        Event
          .read(eventId)
          .then(res => {
            expect(new Date(res.publishingDate)).to.equalDate(publishingDate3);
            done();
          })
          .catch(err => {
            done(err);
          });
      });
      it('The Job in Redis should contain data from Request B', done => {
        Job
          .read(jobId)
          .then(res => {
            expect(new Date(res.publishingDate)).to.equalDate(publishingDate3);
            done();
          })
          .catch(err => {
            done(err);
          });
      });
    });
  });
  // Simulate common READ Requests to the Wrapper Api of the non transactional system
  describe('Run READ requests', () => {
    describe('When issuing multiple reads while a write transaction is processing, requests should not return uncommitted data', () => {
      let eventId = null;
      let jobId = null;
      let dataRequestA = null;
      let dataRequestC = null;
      before('Clear up databases', (done) => clearUpDatabases(done));
      before('Create an Event', (done) => {
        supertest(transactionalApp)
          .post('/events')
          .send({ publishingDate })
          .expect(200)
          .end((err, res) => {
            if (!err && res) {
              eventId = res.body._id;
              jobId = res.body.jobId;
              done();
            } else {
              done(err);
            }
          });
      });
      it('the requests should succeed', done => {
        function requestA() {
          return new Promise((resolve, reject) => {
            supertest(transactionalApp)
              .get(`/events/${eventId}`)
              .end((err, res) => {
                if (!err && res) {
                  resolve(res.body);
                } else {
                  reject(err);
                }
              });
          })
        }
        function requestB() {
          return new Promise((resolve, reject) => {
            supertest(transactionalApp)
              .put(`/events/${eventId}`)
              .send({ publishingDate: publishingDate2 })
              .set('monkey_PUT_events', '10/none')
              .set('monkey_PUT_event', '150/none')
              .set('monkey_PUT_job', '500/none')
              .expect(200)
              .end((err, res) => {
                if (!err && res) {
                  resolve();
                } else {
                  reject(err);
                }
              });
          });
        }
        function requestC() {
          return new Promise((resolve, reject) => {
            supertest(transactionalApp)
              .get(`/events/${eventId}`)
              .set('monkey_GET_events', '250/none')
              .end((err, res) => {
                if (!err && res) {
                  resolve(res.body);
                } else {
                  reject(err);
                }
              });
          })
        }
        let promises = [];
        promises.push(requestA());
        promises.push(requestB());
        promises.push(requestC());
        Promise
          .all(promises)
          .then(res => {
            dataRequestA = res[0];
            dataRequestC = res[2];
            done()
          })
          .catch(err => done(err));
      });
      it('Data of Request A should contain the Event before Request B', done => {
        expect(new Date(dataRequestA.publishingDate)).to.equalDate(publishingDate);
        done();
      });
      it('Data of Request C should contain the Event after Request B', done => {
        expect(new Date(dataRequestC.publishingDate)).to.equalDate(publishingDate2);
        done();
      });
    });
  });
});

