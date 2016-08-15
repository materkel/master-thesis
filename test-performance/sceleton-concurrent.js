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

  function calculateResults(requestCount, currentTime, endTime, responses) {
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
    performanceData.push({
      n: requestCount,
      time: result,
      avg: average,
      success: successCount,
      successRate: successCount / requestCount
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

  return new Promise((resolve, reject) => {
    describe(`Run performance Specs for ${name}`, () => {
      describe('Performance tests for post requests', () => {
        after(function() {
          resolve(performanceData);
        });
        it('should perform 10 concurrent post requests', function(done) {
          this.timeout(1000000);
          const requestCount = 10;
          console.log(`Perform ${requestCount} concurrent post requests`)
          let promises = [];
          for (let i = 0; i < requestCount; i++) {
            promises.push(postRequest({ publishingDate }));
          }
          const currentTime = microtime.now();
          Promise.all(promises).then(responses => {
            const endTime = microtime.now();
            calculateResults(requestCount, currentTime, endTime, responses);
            done();
          }).catch(err => {
            const endTime = microtime.now();
            calculateResults(requestCount, currentTime, endTime, responses);
            done();
          });
        });
        it('should perform 50 concurrent post requests', function(done) {
          this.timeout(1000000);
          const requestCount = 50;
          console.log(`Perform ${requestCount} concurrent post requests`)
          let promises = [];
          for (let i = 0; i < requestCount; i++) {
            promises.push(postRequest({ publishingDate }));
          }
          const currentTime = microtime.now();
          Promise.all(promises).then(responses => {
            const endTime = microtime.now();
            calculateResults(requestCount, currentTime, endTime, responses);
            done();
          }).catch(err => {
            const endTime = microtime.now();
            calculateResults(requestCount, currentTime, endTime, responses);
            done();
          });
        });
        it('should perform 100 concurrent post requests', function(done) {
          this.timeout(1000000);
          const requestCount = 100;
          console.log(`Perform ${requestCount} concurrent post requests`)
          let promises = [];
          for (let i = 0; i < requestCount; i++) {
            promises.push(postRequest({ publishingDate }));
          }
          const currentTime = microtime.now();
          Promise.all(promises).then(responses => {
            const endTime = microtime.now();
            calculateResults(requestCount, currentTime, endTime, responses);
            done();
          }).catch(err => {
            const endTime = microtime.now();
            calculateResults(requestCount, currentTime, endTime, responses);
            done();
          });
        });
        it('should perform 150 concurrent post requests', function(done) {
          this.timeout(1000000);
          const requestCount = 150;
          console.log(`Perform ${requestCount} concurrent post requests`)
          let promises = [];
          for (let i = 0; i < requestCount; i++) {
            promises.push(postRequest({ publishingDate }));
          }
          const currentTime = microtime.now();
          Promise.all(promises).then(responses => {
            const endTime = microtime.now();
            calculateResults(requestCount, currentTime, endTime, responses);
            done();
          }).catch(err => {
            const endTime = microtime.now();
            calculateResults(requestCount, currentTime, endTime, responses);
            done();
          });
        });
        it('should perform 200 concurrent post requests', function(done) {
          this.timeout(1000000);
          const requestCount = 200;
          console.log(`Perform ${requestCount} concurrent post requests`)
          let promises = [];
          for (let i = 0; i < requestCount; i++) {
            promises.push(postRequest({ publishingDate }));
          }
          const currentTime = microtime.now();
          Promise.all(promises).then(responses => {
            const endTime = microtime.now();
            calculateResults(requestCount, currentTime, endTime, responses);
            done();
          }).catch(err => {
            const endTime = microtime.now();
            calculateResults(requestCount, currentTime, endTime, responses);
            done();
          });
        });
        it('should perform 250 concurrent post requests', function(done) {
          this.timeout(1000000);
          const requestCount = 250;
          console.log(`Perform ${requestCount} concurrent post requests`)
          let promises = [];
          for (let i = 0; i < requestCount; i++) {
            promises.push(postRequest({ publishingDate }));
          }
          const currentTime = microtime.now();
          Promise.all(promises).then(responses => {
            const endTime = microtime.now();
            calculateResults(requestCount, currentTime, endTime, responses);
            done();
          }).catch(err => {
            const endTime = microtime.now();
            calculateResults(requestCount, currentTime, endTime, responses);
            done();
          });
        });
        it('should perform 300 concurrent post requests', function(done) {
          this.timeout(1000000);
          const requestCount = 300;
          console.log(`Perform ${requestCount} concurrent post requests`)
          let promises = [];
          for (let i = 0; i < requestCount; i++) {
            promises.push(postRequest({ publishingDate }));
          }
          const currentTime = microtime.now();
          Promise.all(promises).then(responses => {
            const endTime = microtime.now();
            calculateResults(requestCount, currentTime, endTime, responses);
            done();
          }).catch(err => {
            const endTime = microtime.now();
            calculateResults(requestCount, currentTime, endTime, responses);
            done();
          });
        });
        it('should perform 350 concurrent post requests', function(done) {
          this.timeout(1000000);
          const requestCount = 350;
          console.log(`Perform ${requestCount} concurrent post requests`)
          let promises = [];
          for (let i = 0; i < requestCount; i++) {
            promises.push(postRequest({ publishingDate }));
          }
          const currentTime = microtime.now();
          Promise.all(promises).then(responses => {
            const endTime = microtime.now();
            calculateResults(requestCount, currentTime, endTime, responses);
            done();
          }).catch(err => {
            const endTime = microtime.now();
            calculateResults(requestCount, currentTime, endTime, responses);
            done();
          });
        });
        it('should perform 400 concurrent post requests', function(done) {
          this.timeout(1000000);
          const requestCount = 400;
          console.log(`Perform ${requestCount} concurrent post requests`)
          let promises = [];
          for (let i = 0; i < requestCount; i++) {
            promises.push(postRequest({ publishingDate }));
          }
          const currentTime = microtime.now();
          Promise.all(promises).then(responses => {
            const endTime = microtime.now();
            calculateResults(requestCount, currentTime, endTime, responses);
            done();
          }).catch(err => {
            const endTime = microtime.now();
            calculateResults(requestCount, currentTime, endTime, responses);
            done();
          });
        });
        it('should perform 450 concurrent post requests', function(done) {
          this.timeout(1000000);
          const requestCount = 450;
          console.log(`Perform ${requestCount} concurrent post requests`)
          let promises = [];
          for (let i = 0; i < requestCount; i++) {
            promises.push(postRequest({ publishingDate }));
          }
          const currentTime = microtime.now();
          Promise.all(promises).then(responses => {
            const endTime = microtime.now();
            calculateResults(requestCount, currentTime, endTime, responses);
            done();
          }).catch(err => {
            const endTime = microtime.now();
            calculateResults(requestCount, currentTime, endTime, responses);
            done();
          });
        });
        it('should perform 500 concurrent post requests', function(done) {
          this.timeout(1000000);
          const requestCount = 500;
          console.log(`Perform ${requestCount} concurrent post requests`)
          let promises = [];
          for (let i = 0; i < requestCount; i++) {
            promises.push(postRequest({ publishingDate }));
          }
          const currentTime = microtime.now();
          Promise.all(promises).then(responses => {
            const endTime = microtime.now();
            calculateResults(requestCount, currentTime, endTime, responses);
            done();
          }).catch(err => {
            const endTime = microtime.now();
            calculateResults(requestCount, currentTime, endTime, responses);
            done();
          });
        });
      });
    });
  });
}
