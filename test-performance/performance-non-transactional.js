'use strict';

const microtime = require('microtime');
const chai = require('chai');
const expect = chai.expect;
chai.use(require('chai-datetime'));

const supertest = require('supertest');
const request = require('request-promise');

const nonTransactionalApp = require('../test-system/WrapperApi/index');
const Event = require('../test-system/EventApi/models/Event');
const Job = require('../test-system/JobApi/models/Job');

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
    supertest(nonTransactionalApp)
      .post('/events')
      .send(data)
      .expect(200)
      .end((err, res) => {
        if (!err && res) {
          resolve(res.body);
        } else {
          reject(err);
        }
      });
  });
}

describe('Run performance Specs for the non transactional system', () => {
  before('Clear up databases', (done) => clearUpDatabases(done));
  describe('Performance tests for post requests', () => {
    it('should perform 10 concurrent post requests', function(done) {
      this.timeout(10000);
      console.log(`Perform 10 concurrent post requests`)
      let promises = [];
      for (let i = 0; i < 10; i++) {
        promises.push(postRequest({ publishingDate }));
      }
      const currentTime = microtime.now();
      Promise.all(promises).then(x => {
        const endTime = microtime.now();
        const result = endTime - currentTime;
        const average = result / 10;
        console.log(`Overall time: ${result}; Average: ${average}`);
        done();
      });
    });
    it('should perform 100 concurrent post requests', function(done) {
      this.timeout(10000);
      console.log(`Perform 100 concurrent post requests`)
      let promises = [];
      for (let i = 0; i < 100; i++) {
        promises.push(postRequest({ publishingDate }));
      }
      const currentTime = microtime.now();
      Promise.all(promises).then(x => {
        const endTime = microtime.now();
        const result = endTime - currentTime;
        const average = result / 100;
        console.log(`Overall time: ${result}; Average: ${average}`);
        done();
      });
    });
    it('should perform 500 concurrent post requests', function(done) {
      this.timeout(20000);
      console.log(`Perform 500 concurrent post requests`)
      let promises = [];
      for (let i = 0; i < 500; i++) {
        promises.push(postRequest({ publishingDate }));
      }
      const currentTime = microtime.now();
      Promise.all(promises).then(x => {
        const endTime = microtime.now();
        const result = endTime - currentTime;
        const average = result / 500;
        console.log(`Overall time: ${result}; Average: ${average}`);
        done();
      });
    });
    it('should perform 1000 concurrent post requests', function(done) {
      this.timeout(30000);
      console.log(`Perform 1000 concurrent post requests`)
      let promises = [];
      for (let i = 0; i < 1000; i++) {
        promises.push(postRequest({ publishingDate }));
      }
      const currentTime = microtime.now();
      Promise.all(promises).then(x => {
        const endTime = microtime.now();
        const result = endTime - currentTime;
        const average = result / 1000;
        console.log(`Overall time: ${result}; Average: ${average}`);
        done();
      });
    });
    it('should perform 2000 concurrent post requests', function(done) {
      this.timeout(80000);
      console.log(`Perform 2000 concurrent post requests`)
      let promises = [];
      for (let i = 0; i < 2000; i++) {
        promises.push(postRequest({ publishingDate }));
      }
      const currentTime = microtime.now();
      Promise.all(promises).then(x => {
        const endTime = microtime.now();
        const result = endTime - currentTime;
        const average = result / 2000;
        console.log(`Overall time: ${result}; Average: ${average}`);
        done();
      });
    });
  });
});
