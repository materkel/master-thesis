import delayedQueueLib from 'lib/delayedQueueAmqp';

class transactionChecker {
  constructor(transactionName, delay, transactionStateStore, transactionUtility) {
    this.transactionName = transactionName;
    this.delay = delay;

    const delayedQueueConfig = {
      exchange: `${transactionName}-checker-exchange`,
      ack: true
    };
    this.delayedQueue = delayedQueueLib(delayedQueueConfig)
    this.delayedQueue.consume(transactionName, msg => {
      // Handle msg & use transaction store
      const transactionId = msg.content.toString();
      transactionStateStore
        .get(transactionId)
        .then(state => {
          if (state === null) {
            return Promise.Resolve();
          }
          if (state === 'pending') {
            return transactionStateStore
              .rollback(transactionId)
              .then(() => transactionUtility.rollback(transactionId))
              .then(() => transactionStateStore.remove(transactionId));
          }

          // Implement repeated checking if pending_commit or pending_rollback is set
        })
    });
  }

  check(transactionId) {
    this.delayedQueue.send(this.transactionName, transactionId, this.delay);
  }
}

module.exports = transactionChecker;
