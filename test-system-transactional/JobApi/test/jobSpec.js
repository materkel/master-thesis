'use strict';

const chai = require('chai');
const expect = chai.expect;
chai.use(require('chai-datetime'));

const Job = require('../index').models.Job;
const publishingDate = new Date();
const publishingDate2 = new Date(publishingDate);
publishingDate2.setDate(publishingDate2.getDate() + 30);
const eventId = 'EVENT_ID_TEST_XYZ';
let id = null;

describe('A Job', () => {
  it('should be created successfully', done => {
    Job
      .create({ eventId, publishingDate })
      .then(res => {
        expect(res).to.exist;
        expect(res.publishingDate).to.equalDate(publishingDate);
        expect(res.id).to.exist;
        id = res.id;
        done();
      })
      .catch(err => done(err));
  });

  it('should be read successfully', done => {
    Job
      .read(id)
      .then(res => {
        expect(res).to.exist;
        expect(res.id).to.equal(id);
        expect(res.publishingDate).to.equalDate(publishingDate);
        done();
      })
      .catch(err => done(err));
  });

  it('should be updated successfully', done => {
    Job
      .update(id, { publishingDate: publishingDate2 })
      .then(res => {
        expect(res).to.exist;
        expect(res.id).to.equal(id);
        expect(res.publishingDate).to.equalDate(publishingDate2);
        done();
      })
      .catch(err => done(err));
  });

  it('should be deleted successfully', done => {
    Job
      .delete(id)
      .then(res => {
        expect(res).to.exist;
        done();
      })
      .catch(err => done(err));
  });
});
