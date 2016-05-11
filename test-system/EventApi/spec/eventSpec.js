'use strict';

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
        expect(res).toBeDefined();
        expect(res.publishingDate).toEqual(publishingDate);
        expect(res._id).toBeDefined();
        id = res.id;
        done();
      })
      .catch(err => done.fail(err));
  });

  it('should be read successfully', done => {
    Event
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
    Event
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
    Event
      .delete(id)
      .then(res => {
        expect(res).toBeDefined();
        done();
      })
      .catch(err => done.fail(err));
  });
});
