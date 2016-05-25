'use strict';

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
        expect(res).toBeDefined();
        expect(res.publishingDate).toEqual(publishingDate);
        expect(res.id).toBeDefined();
        id = res.id;
        done();
      })
      .catch(err => done.fail(err));
  });

  it('should be read successfully', done => {
    Job
      .read(id)
      .then(res => {
        expect(res).toBeDefined();
        expect(res.id).toEqual(id);
        expect(res.publishingDate).toEqual(publishingDate);
        done();
      })
      .catch(err => done.fail(err));
  });

  it('should be updated successfully', done => {
    Job
      .update(id, { publishingDate: publishingDate2 })
      .then(res => {
        expect(res).toBeDefined();
        expect(res.id).toEqual(id);
        expect(res.publishingDate).toEqual(publishingDate2);
        done();
      })
      .catch(err => done.fail(err));
  });

  it('should be deleted successfully', done => {
    Job
      .delete(id)
      .then(res => {
        expect(res).toBeDefined();
        done();
      })
      .catch(err => done.fail(err));
  });
});
