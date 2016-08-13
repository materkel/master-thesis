import delayedQueueLib from './lib/delayedQueueAmqp';

class transactionChecker {
  constructor(transactionName, delay, transactionStateStore, lockManager, transactionUtility) {
    this.transactionName = transactionName;
    this.delay = delay;

    const delayedQueueConfig = {
      exchange: `${transactionName}-checker-exchange`,
      ack: true
    };
    this.delayedQueue = delayedQueueLib(delayedQueueConfig)
    this.delayedQueue.consume(transactionName, msg => {
      // Get information on how many times the check failed before
      const checkRounds = msg.fields.deliveryTag;
      // Use the transaction store to get the current state of the transaction
      const transactionId = msg.content.toString();
      return transactionStateStore
        .get(transactionId)
        .then(state => {
          if (state === null) {
            return Promise.resolve();
          }
          if (state === 'pending') {
            return transactionStateStore
              .rollback(transactionId)
              .then(() => transactionUtility.rollback(transactionId))
              .then(() => lockManager.unlock(transactionId))
              .then(() => transactionStateStore.remove(transactionId));
          }
          // Wait for some retries to handle pending_commit and pending_rollback cases
          if (checkRounds > 3) {
            return Promise.resolve(() => {
              if (state === 'pending_commit') {
                return transactionUtility.commit(transactionId);
              }
              return transactionUtility.rollback(transactionId);
            })
            .then(() => lockManager.unlock(transactionId))
            .then(() => transactionStateStore.remove(transactionId));
          }
          return Promise.reject('Retry');
        });
    });
  }

  check(transactionId) {
    this.delayedQueue.send(this.transactionName, transactionId, this.delay);
  }
}

module.exports = transactionChecker;
