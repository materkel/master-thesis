'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _delayedQueueAmqp = require('./lib/delayedQueueAmqp');

var _delayedQueueAmqp2 = _interopRequireDefault(_delayedQueueAmqp);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var transactionChecker = function () {
  function transactionChecker(transactionName, delay, transactionStateStore, transactionUtility) {
    _classCallCheck(this, transactionChecker);

    this.transactionName = transactionName;
    this.delay = delay;

    var delayedQueueConfig = {
      exchange: transactionName + '-checker-exchange',
      ack: true
    };
    this.delayedQueue = (0, _delayedQueueAmqp2.default)(delayedQueueConfig);
    this.delayedQueue.consume(transactionName, function (msg) {
      // Get information on how many times the check failed before
      var checkRounds = msg.fields.deliveryTag;
      // Use the transaction store to get the current state of the transaction
      var transactionId = msg.content.toString();
      return transactionStateStore.get(transactionId).then(function (state) {
        console.log('STATE IS ', state);
        console.log('ROUND', checkRounds);
        if (state === null) {
          return Promise.resolve();
        }
        if (state === 'pending') {
          return transactionStateStore.rollback(transactionId).then(function () {
            return transactionUtility.rollback(transactionId);
          }).then(function () {
            return transactionStateStore.remove(transactionId);
          });
        }
        // Wait for some retries to handle pending_commit and pending_rollback cases
        if (checkRounds > 3) {
          return Promise.resolve(function () {
            if (state === 'pending_commit') {
              return transactionUtility.commit(transactionId);
            }
            return transactionUtility.rollback(transactionId);
          }).then(function () {
            return transactionStateStore.remove(transactionId);
          });
        }
        return Promise.reject('Retry');
      });
    });
  }

  _createClass(transactionChecker, [{
    key: 'check',
    value: function check(transactionId) {
      this.delayedQueue.send(this.transactionName, transactionId, this.delay);
    }
  }]);

  return transactionChecker;
}();

module.exports = transactionChecker;