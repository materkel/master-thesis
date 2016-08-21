'use strict';

const microtime = require('microtime');
const chai = require('chai');
const expect = chai.expect;
chai.use(require('chai-datetime'));

const supertest = require('supertest');
const request = require('request-promise');

const publishingDate = new Date();
const publishingDate2 = new Date(publishingDate);
const publishingDate3 = new Date(publishingDate);
publishingDate2.setDate(publishingDate2.getDate() + 5);
publishingDate3.setDate(publishingDate3.getDate() + 10);

module.exports = (app, name) => {
  const performanceData = [];

  function calculateResults(requestCount, currentTime, endTime) {
    const result = endTime - currentTime;
    const average = result / requestCount;

    console.log(`Overall time: ${result}`);
    console.log(`Average: ${average}`);
    performanceData.push({
      n: requestCount,
      time: result,
      avg: average,
      success: requestCount,
      successRate: 1
    });
  }

  function postRequest(data) {
    return new Promise((resolve, reject) => {
      supertest(app)
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

  function doRequest(fn, data, times) {
    if (times > 0) {
      return fn(data).then(res => doRequest(fn, data, times-1));
    } else {
      Promise.resolve(true);
    }
  }

  return new Promise((resolve, reject) => {
    describe(`Run performance Specs for ${name}`, () => {
      describe('Performance tests for post requests', () => {
        after(function() {
          resolve(performanceData);
        });
        it('should perform 10 synchronous post requests', function(done) {
          this.timeout(1000000);
          const requestCount = 10;
          console.log(`Perform ${requestCount} synchronous post requests`)
          const currentTime = microtime.now();
          doRequest(postRequest, {publishingDate}, requestCount).then(res => {
            const endTime = microtime.now();
            calculateResults(requestCount, currentTime, endTime);
            done();
          });
        });
        it('should perform 50 synchronous post requests', function(done) {
          this.timeout(1000000);
          const requestCount = 50;
          console.log(`Perform ${requestCount} synchronous post requests`)
          const currentTime = microtime.now();
          doRequest(postRequest, {publishingDate}, requestCount).then(responses => {
            const endTime = microtime.now();
            calculateResults(requestCount, currentTime, endTime, responses);
            done();
          })
        });
        it('should perform 100 synchronous post requests', function(done) {
          this.timeout(1000000);
          const requestCount = 100;
          console.log(`Perform ${requestCount} synchronous post requests`)
          const currentTime = microtime.now();
          doRequest(postRequest, {publishingDate}, requestCount).then(responses => {
            const endTime = microtime.now();
            calculateResults(requestCount, currentTime, endTime, responses);
            done();
          })
        });
        it('should perform 150 synchronous post requests', function(done) {
          this.timeout(1000000);
          const requestCount = 150;
          console.log(`Perform ${requestCount} synchronous post requests`)
          const currentTime = microtime.now();
          doRequest(postRequest, {publishingDate}, requestCount).then(responses => {
            const endTime = microtime.now();
            calculateResults(requestCount, currentTime, endTime, responses);
            done();
          })
        });
        it('should perform 200 synchronous post requests', function(done) {
          this.timeout(1000000);
          const requestCount = 200;
          console.log(`Perform ${requestCount} synchronous post requests`)
          const currentTime = microtime.now();
          doRequest(postRequest, {publishingDate}, requestCount).then(responses => {
            const endTime = microtime.now();
            calculateResults(requestCount, currentTime, endTime, responses);
            done();
          })
        });
        it('should perform 250 synchronous post requests', function(done) {
          this.timeout(1000000);
          const requestCount = 250;
          console.log(`Perform ${requestCount} synchronous post requests`)
          const currentTime = microtime.now();
          doRequest(postRequest, {publishingDate}, requestCount).then(responses => {
            const endTime = microtime.now();
            calculateResults(requestCount, currentTime, endTime, responses);
            done();
          })
        });
        it('should perform 300 synchronous post requests', function(done) {
          this.timeout(1000000);
          const requestCount = 300;
          console.log(`Perform ${requestCount} synchronous post requests`)
          const currentTime = microtime.now();
          doRequest(postRequest, {publishingDate}, requestCount).then(responses => {
            const endTime = microtime.now();
            calculateResults(requestCount, currentTime, endTime, responses);
            done();
          })
        });
        it('should perform 350 synchronous post requests', function(done) {
          this.timeout(1000000);
          const requestCount = 350;
          console.log(`Perform ${requestCount} synchronous post requests`)
          const currentTime = microtime.now();
          doRequest(postRequest, {publishingDate}, requestCount).then(responses => {
            const endTime = microtime.now();
            calculateResults(requestCount, currentTime, endTime, responses);
            done();
          })
        });
        it('should perform 400 synchronous post requests', function(done) {
          this.timeout(1000000);
          const requestCount = 400;
          console.log(`Perform ${requestCount} synchronous post requests`)
          const currentTime = microtime.now();
          doRequest(postRequest, {publishingDate}, requestCount).then(responses => {
            const endTime = microtime.now();
            calculateResults(requestCount, currentTime, endTime, responses);
            done();
          })
        });
        it('should perform 450 synchronous post requests', function(done) {
          this.timeout(1000000);
          const requestCount = 450;
          console.log(`Perform ${requestCount} synchronous post requests`)
          const currentTime = microtime.now();
          doRequest(postRequest, {publishingDate}, requestCount).then(responses => {
            const endTime = microtime.now();
            calculateResults(requestCount, currentTime, endTime, responses);
            done();
          })
        });
        it('should perform 500 synchronous post requests', function(done) {
          this.timeout(1000000);
          const requestCount = 500;
          console.log(`Perform ${requestCount} synchronous post requests`)
          const currentTime = microtime.now();
          doRequest(postRequest, {publishingDate}, requestCount).then(responses => {
            const endTime = microtime.now();
            calculateResults(requestCount, currentTime, endTime, responses);
            done();
          })
        });
      });
    });
  });
}
