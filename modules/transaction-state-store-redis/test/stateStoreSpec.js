import chai from 'chai';
import transactionStoreLib from '../index';
import redis from 'redis';

const db = redis.createClient();
const expect = chai.expect;

function clearUpDatabase(done) {
  db.flushdb((err, res) => {
    if (!err) {
      done();
    }
  });
}

before('Clear up databases', (done) => clearUpDatabase(done));

describe('The transaction-state-store library', () => {
  const transactionStore = transactionStoreLib();
  it('should be initialized', () => {
    expect(transactionStore).to.be.an('object');
  });

  it('should have the desired properties', () => {
    expect(transactionStore).to.have.property('add');
    expect(transactionStore).to.have.property('commit');
    expect(transactionStore).to.have.property('rollback');
    expect(transactionStore).to.have.property('get');
    expect(transactionStore).to.have.property('remove');
  });
});

describe('The transaction state store', () => {
  const transactionStore = transactionStoreLib();
  it('should store a "pending" status when a transaction added', done => {
    transactionStore
      .add('transaction1')
      .then(() => {
        db.get('transaction1', (err, res) => {
          expect(res).to.equal('pending');
          done();
        })
      })
  });
  it('should return a "pending" status when get is called on an added transaction', done => {
    transactionStore
      .add('transaction2')
      .then(() => {
        transactionStore
          .get('transaction2')
          .then(state => {
            expect(state).to.equal('pending');
            done();
          });
      });
  });
  it('should successfully update a "pending" state to "pending_commit"', done => {
    transactionStore
      .add('transaction3')
      .then(() => {
        transactionStore
          .commit('transaction3')
          .then(res => transactionStore.get('transaction3'))
          .then(state => {
            expect(state).to.equal('pending_commit');
            done();
          });
      });
  });
  it('should not update a "pending_commit" state, but return an error instead', done => {
    transactionStore
      .add('transaction4')
      .then(() => {
        transactionStore
          .commit('transaction4')
          .then(res => transactionStore.commit('transaction4'))
          .catch(err => {
            expect(err).to.exist;
            done();
          });
      });
  });
  it('should not update a "pending_rollback" state, but return an error instead', done => {
    transactionStore
      .add('transaction5')
      .then(() => {
        transactionStore
          .rollback('transaction5')
          .then(res => transactionStore.rollback('transaction5'))
          .catch(err => {
            expect(err).to.exist;
            done();
          });
      });
  });
  it('should remove an existing state', done => {
    transactionStore
      .add('transaction6')
      .then(() => {
        transactionStore
          .commit('transaction6')
          .then(res => transactionStore.remove('transaction6'))
          .then(res => transactionStore.get('transaction6'))
          .then(res => {
            expect(res).to.be.null;
            done();
          });
      });
  });
});
