'use strict';

const chai = require('chai');
const expect = chai.expect;
chai.use(require('chai-datetime'));

const Event = require('../index').models.Event;
const publishingDate = new Date();
const publishingDate2 = new Date(publishingDate);
publishingDate2.setDate(publishingDate2.getDate() + 30);
let id = null;

describe('An Event', () => {
  it('should be created successfully', done => {
    Event
      .create({ publishingDate })
      .then(res => {
        expect(res).to.exist;
        expect(res.publishingDate).to.equalDate(publishingDate);
        expect(res._id).to.exist;
        id = res.id;
        done();
      })
      .catch(err => done(err));
  });

  it('should be read successfully', done => {
    Event
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
    Event
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
    Event
      .delete(id)
      .then(res => {
        expect(res).to.exist;
        done();
      })
      .catch(err => done(err));
  });
});
