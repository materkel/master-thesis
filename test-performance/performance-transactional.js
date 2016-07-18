'use strict';

const microtime = require('microtime');
const chai = require('chai');
const expect = chai.expect;
chai.use(require('chai-datetime'));

const supertest = require('supertest');
const request = require('request-promise');

const transactionalApp = require('../test-system-transactional/WrapperApi/index');
const Event = require('../test-system-transactional/EventApi/models/Event');
const Job = require('../test-system-transactional/JobApi/models/Job');

const publishingDate = new Date();
const publishingDate2 = new Date(publishingDate);
const publishingDate3 = new Date(publishingDate);
publishingDate2.setDate(publishingDate2.getDate() + 5);
publishingDate3.setDate(publishingDate3.getDate() + 10);

function clearUpDatabases(done) {
  let promises = [];
  promises.push(Event.deleteAll());
  promises.push(Job.deleteAll());
  Promise.all(promises).then(res => {
    done();
  });
}

function postRequest(data) {
  return new Promise((resolve, reject) => {
    supertest(transactionalApp)
      .post('/events')
      .send(data)
      .end((err, res) => {
        if (!err && res) {
          resolve(res.status);
        } else {
          reject(err);
        }
      });
  });
}

describe('Run performance Specs for the transactional system', () => {
  before('Clear up databases', (done) => clearUpDatabases(done));
  describe('Performance tests for post requests', () => {
    it('should perform 10 concurrent post requests', function(done) {
      this.timeout(12000);
      const requestCount = 10;
      console.log(`Perform ${requestCount} concurrent post requests`)
      let promises = [];
      for (let i = 0; i < requestCount; i++) {
        promises.push(postRequest({ publishingDate }));
      }
      const currentTime = microtime.now();
      Promise.all(promises).then(responses => {
        const endTime = microtime.now();
        const result = endTime - currentTime;
        const average = result / requestCount;
        const errorCount = responses.reduce((x,y) => {
          if (y !== 200) {
            x++;
          }
          return x;
        }, 0);
        const successCount = requestCount - errorCount;
        console.log(`Overall time: ${result}`);
        console.log(`Average: ${average}`);
        console.log(`Success: ${successCount} / ${requestCount}`);
        done();
      });
    });
    it('should perform 50 concurrent post requests', function(done) {
      this.timeout(30000);
      const requestCount = 50;
      console.log(`Perform ${requestCount} concurrent post requests`)
      let promises = [];
      for (let i = 0; i < requestCount; i++) {
        promises.push(postRequest({ publishingDate }));
      }
      const currentTime = microtime.now();
      Promise.all(promises).then(responses => {
        const endTime = microtime.now();
        const result = endTime - currentTime;
        const average = result / requestCount;
        const errorCount = responses.reduce((x,y) => {
          if (y !== 200) {
            x++;
          }
          return x;
        }, 0);
        const successCount = requestCount - errorCount;
        console.log(`Overall time: ${result}`);
        console.log(`Average: ${average}`);
        console.log(`Success: ${successCount} / ${requestCount}`);
        done();
      });
    });
    it('should perform 100 concurrent post requests', function(done) {
      this.timeout(45000);
      const requestCount = 100;
      console.log(`Perform ${requestCount} concurrent post requests`)
      let promises = [];
      for (let i = 0; i < requestCount; i++) {
        promises.push(postRequest({ publishingDate }));
      }
      const currentTime = microtime.now();
      Promise.all(promises).then(responses => {
        const endTime = microtime.now();
        const result = endTime - currentTime;
        const average = result / requestCount;
        const errorCount = responses.reduce((x,y) => {
          if (y !== 200) {
            x++;
          }
          return x;
        }, 0);
        const successCount = requestCount - errorCount;
        console.log(`Overall time: ${result}`);
        console.log(`Average: ${average}`);
        console.log(`Success: ${successCount} / ${requestCount}`);
        done();
      });
    });
    it('should perform 150 concurrent post requests', function(done) {
      this.timeout(60000);
      const requestCount = 150;
      console.log(`Perform ${requestCount} concurrent post requests`)
      let promises = [];
      for (let i = 0; i < requestCount; i++) {
        promises.push(postRequest({ publishingDate }));
      }
      const currentTime = microtime.now();
      Promise.all(promises).then(responses => {
        const endTime = microtime.now();
        const result = endTime - currentTime;
        const average = result / requestCount;
        const errorCount = responses.reduce((x,y) => {
          if (y !== 200) {
            x++;
          }
          return x;
        }, 0);
        const successCount = requestCount - errorCount;
        console.log(`Overall time: ${result}`);
        console.log(`Average: ${average}`);
        console.log(`Success: ${successCount} / ${requestCount}`);
        done();
      });
    });
    it('should perform 200 concurrent post requests', function(done) {
      this.timeout(60000);
      const requestCount = 200;
      console.log(`Perform ${requestCount} concurrent post requests`)
      let promises = [];
      for (let i = 0; i < requestCount; i++) {
        promises.push(postRequest({ publishingDate }));
      }
      const currentTime = microtime.now();
      Promise.all(promises).then(responses => {
        const endTime = microtime.now();
        const result = endTime - currentTime;
        const average = result / requestCount;
        const errorCount = responses.reduce((x,y) => {
          if (y !== 200) {
            x++;
          }
          return x;
        }, 0);
        const successCount = requestCount - errorCount;
        console.log(`Overall time: ${result}`);
        console.log(`Average: ${average}`);
        console.log(`Success: ${successCount} / ${requestCount}`);
        done();
      });
    });
  });
});
