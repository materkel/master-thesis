'use strict';

const supertest = require('supertest');
const app = require('../index');

const publishingDate = new Date();
// const publishingDate2 = new Date(publishingDate);
// publishingDate2.setDate(publishingDate2.getDate() + 30);

describe('A Event', () => {
  it('should be created successfully', done => {
    supertest(app)
      .post('/events')
      .send({ publishingDate })
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200)
      .end(function(err, res) {
        if (!err && res) {
          expect(res.body).toBeDefined();
          expect(res.body._id).toBeDefined();
          expect(new Date(res.body.publishingDate)).toEqual(publishingDate);
          done();
        }
        done.fail(err);
      });
  });

  // it('should be created successfully', done => {
  //   supertest(app)
  //     .post('/events')
  //     .send({ publishingDate })
  //     .set('Accept', 'application/json')
  //     .expect('Content-Type', /json/)
  //     .expect(200, err => {
  //       if (err !== null) {
  //         done.fail();
  //       }
  //       done();
  //     });
  // });
});
