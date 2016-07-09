import chai from 'chai';
import transactionLockLib from '../index';
import redis from 'redis';

const db = redis.createClient();
const expect = chai.expect;
const lockManager = transactionLockLib();

function clearUpDatabase(done) {
  db.flushdb((err, res) => {
    if (!err) {
      done();
    }
  });
}

before('Clear up databases', (done) => clearUpDatabase(done));

describe('The lock Manager', () => {
  it('should expose the desired properties', () => {
    expect(lockManager).to.have.property('lock');
    expect(lockManager).to.have.property('unlock');
  });
});

describe('The lock Manager', () => {
  it('should aquire a write lock', done => {
    lockManager.lock('write', 'stories/1/events', 'transaction1')
      .then(res => {
        done();
      });
  });

  it('should fail when trying aquire a second write lock on the same resource', done => {
    lockManager.lock('write', 'stories/1/events', 'transaction2')
      .catch(err => {
        done();
      });
  });

  it('should fail when trying to aquire a read lock on the same resource', done => {
    lockManager.lock('read', 'stories/1/events', 'transaction3')
      .catch(err => {
        done();
      });
  });
});

describe('The lock Manager', () => {
  it('should remove a write lock', done => {
    lockManager.lock('write', 'stories/2/events', 'transaction1')
      .then(res => lockManager.unlock('write', 'stories/2/events', 'transaction1'))
      .then(res => {
        db.exists('stories/2/events:lock:write', (err, res) => {
          if (!err) {
            expect(res).to.equal(0);
            done();
          }
        });
      });
  });

  it('should aquire a read lock', done => {
    lockManager.lock('read', 'stories/2/events', 'transaction3')
      .then(res => {
        done();
      });
  });

  it('should fail when trying to aquire a write lock on the same resource', done => {
    lockManager.lock('write', 'stories/2/events', 'transaction4')
      .catch(err => {
        done();
      });
  });

  it('should aquire a second read lock', done => {
    lockManager.lock('read', 'stories/2/events', 'transaction5')
      .then(res => {
        done();
      });
  });

  it('should remove a read lock', done => {
    lockManager.unlock('read', 'stories/2/events', 'transaction3')
      .then(res => {
        done();
      });
  });
});
