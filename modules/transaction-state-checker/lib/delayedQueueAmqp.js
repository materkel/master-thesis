'use strict';

var _amqplib = require('amqplib');

var _amqplib2 = _interopRequireDefault(_amqplib);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * DelayedQueueAMQP Factory
 * @param  {Object} config
 * @param  {string} [config.url = 'amqp://localhost'] - amqp connection url
 * @param  {string} [config.exchange = 'transactions'] - name of the exchange the messages will be sent to
 * @param  {boolean} [config.ack = false] - if messages have to be acknowledged
 * @return {Object}
 */
module.exports = function () {
  var _ref = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

  var _ref$url = _ref.url;
  var url = _ref$url === undefined ? 'amqp://localhost' : _ref$url;
  var _ref$exchange = _ref.exchange;
  var exchange = _ref$exchange === undefined ? 'transactionChecks' : _ref$exchange;
  var _ref$ack = _ref.ack;
  var ack = _ref$ack === undefined ? false : _ref$ack;

  var open = _amqplib2.default.connect(url);
  var noAck = !ack;

  function consume(transactionCheckQueue, fn) {
    return open.then(function (conn) {
      return conn.createChannel();
    }).then(function (ch) {
      var args = { 'x-delayed-type': 'direct' };
      ch.assertExchange(exchange, 'x-delayed-message', { durable: true, arguments: args });
      return ch.assertQueue(transactionCheckQueue, { durable: true }).then(function () {
        return ch.bindQueue(transactionCheckQueue, exchange, transactionCheckQueue);
      }).then(function () {
        ch.consume(transactionCheckQueue, function (msg) {
          if (noAck) {
            fn(msg);
          } else {
            Promise.resolve(fn(msg)).then(function (res) {
              return ch.ack(msg);
            }).then(function (res) {
              return ch.close();
            }).catch(function (err) {
              return ch.nack(msg);
            });
          }
        }, { noAck: noAck });
      });
    });
  }

  function send(transactionCheckQueue, transactionId, delay) {
    var channel = null;
    return open.then(function (conn) {
      return conn.createChannel();
    }).then(function (ch) {
      channel = ch;
      var headers = { 'x-delay': delay };
      return ch.publish(exchange, transactionCheckQueue, new Buffer(transactionId), { headers: headers });
    }).then(function (res) {
      return channel.close();
    });
  }

  return {
    consume: consume,
    send: send
  };
};