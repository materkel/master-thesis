# transaction-lock-redis

*In Development, proof of concept - currently does not support "fencing tokens" as [described by Martin Kleppmann](http://martin.kleppmann.com/2016/02/08/how-to-do-distributed-locking.html](http://martin.kleppmann.com/2016/02/08/how-to-do-distributed-locking.html), you need to take care of proper unlocking / setting comfortable TTLs / deadlocks*

Granular locking of resources via read and write locks

Example:

```javascript
import transactionLockLib from 'mfressdorf/transaction-lock-redis';

// Inject a node-redis redisClient, or supply redisOptions,
// if not provided, standard localhost settings are used instead
const lockManager = transactionLockLib({ redisOptions });

lockManager
  .lock({
    type: 'write',
    path: 'stories/15/events',
    id: 'transactionId123',
    ttl: 5000, // optional - in ms
    retries: 5, // optional
    backoff: 150 // optional - in ms
  })
  .then(res => {
    // Do stuff
  })
  .then(res => {
    lockManager.unlock('transactionId123');
  })

```
