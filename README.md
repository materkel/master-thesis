# master-thesis

This is the documentation for the code base of my master-thesis project.


## Setup

install [mongoDB](https://docs.mongodb.com/manual/tutorial/install-mongodb-on-os-x/), [redis](http://redis.io/download) and [rabbitMQ](https://www.rabbitmq.com/download.html)

On mac with Homebrew:

```js
brew update
brew install mongodb redis rabbitmq
```

Install dependencies

```js
// This installs the dependencies of all modules and test systems
npm install
```

## Tests

All modules and services of the independent test systems have individual unit-test suits. Check their documentation in the corresponding system folders.

You can run system integration tests with

```js
// This runs both tests for the non-transactional and the transactional system.
npm test

// Run tests regarding the non transactional system like this.
npm run test-nontransactional

// Run tests regarding the transactional system like this.
npm run test-transactional

```
