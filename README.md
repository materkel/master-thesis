# master-thesis

This is the documentation for the code base of my master-thesis project.


## Setup

Clone this repository (including submodules)

```bash
git clone --recursive git@github.com:mfressdorf/master-thesis.git
```

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

// Run tests for the non transactional system
npm run test-nontransactional

// Run tests for the transactional system
npm run test-transactional

// Run tests for the transactional system with integrated locking
npm run test-transactional-locking
```

be sure to start up the relevant systems first (for individual tests - "npm test" starts up all the systems for you). You can either start services idependently (check out the system documentation for the relevant systems in /test-system or /test-system-transactional) or start them up like this:

```js
// This starts up the test-system
npm run start-nontransactional

// This starts up the test-system-transactional
npm run start-transactional

// This starts up both systems
npm run start-systems
```
