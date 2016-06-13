'use strict';

const chai = require('chai');
const expect = chai.expect;
chai.use(require('chai-datetime'));

const supertest = require('supertest');
const app = require('../index');

const publishingDate = new Date();
const publishingDate2 = new Date(publishingDate);
publishingDate2.setDate(publishingDate2.getDate() + 5);
let eventId = null;

describe('A Event', () => {
  it('should be created successfully', done => {
    supertest(app)
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
          eventId = res.body._id;
        }
        done(err);
      });
  });

  it('should be updated successfully', done => {
    supertest(app)
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

  it('should be read successfully', done => {
    supertest(app)
      .get(`/events/${eventId}`)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200)
      .end((err, res) => {
        if (!err && res) {
          expect(res.body).to.exist;
          expect(res.body._id).to.exist;
          expect(res.body.publishingDate).to.exist;
          expect(res.body.jobId).to.exist;
          expect(new Date(res.body.publishingDate)).to.equalDate(publishingDate2);
        }
        done(err);
      });
  });

  it('should be deleted successfully', done => {
    supertest(app)
      .del(`/events/${eventId}`)
      .expect(200, done);
  });
});


