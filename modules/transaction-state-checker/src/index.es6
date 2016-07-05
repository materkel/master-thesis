import amqp from 'amqplib';

/**
 * TransactionStateChecker Factory
 * @param  {Object} config
 * @param  {string} [config.url = 'amqp://localhost'] - amqp connection url
 * @param  {string} [config.exchange = 'transactions'] - name of the exchange the messages will be sent to
 * @param  {boolean} [config.ack = false] - if messages have to be acknowledged
 * @return {Object}
 */
module.exports = ({ url: url = 'amqp://localhost', exchange: exchange = 'transactionChecks', ack: ack = false } = {}) => {
  const open = amqp.connect(url);
  const noAck = !ack;

  function consume(transactionCheckQueue, fn) {
    return open
      .then(conn => conn.createChannel())
      .then(ch => {
        const args = { 'x-delayed-type': 'direct' };
        ch.assertExchange(exchange, 'x-delayed-message', { durable: true, arguments: args });
        return ch.assertQueue(transactionCheckQueue, { durable: true })
          .then(() => ch.bindQueue(transactionCheckQueue, exchange, transactionCheckQueue))
          .then(() => {
            ch.consume(transactionCheckQueue, (msg) => {
              if (noAck) {
                fn(msg);
              } else {
                Promise.resolve(fn(msg))
                  .then(res => ch.ack(msg))
                  .catch(err => ch.nack(msg));
              }
            }, { noAck });
          });
      });
  }

  function send(transactionCheckQueue, transactionId, delay) {
    return open
      .then(conn => conn.createChannel())
      .then(ch => {
        const headers = { 'x-delay': delay };
        ch.publish(exchange, transactionCheckQueue, new Buffer(transactionId), { headers });
      });
  }

  return {
    consume,
    send
  }
}
