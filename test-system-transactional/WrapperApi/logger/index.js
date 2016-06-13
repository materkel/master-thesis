'use strict';

const bunyan = require('bunyan');
const PrettyStream = require('bunyan-prettystream');

const prettyStdOut = new PrettyStream();
prettyStdOut.pipe(process.stdout);

let config = {
  name: 'jobApi',
  streams: [
    {
      level: 'error',
      path: __dirname + '/tmp/wrapperApi-error.log' // Log ERROR and above to a file
    }
  ],
};

if(process.env.DEBUG) {

  config.streams.push({
    level: 'debug',
    type: 'raw',
    stream: prettyStdOut // Log DEBUG and above to stdout
  });

  config.src = true; // Add src file location

} else {

  config.streams.push({
    level: 'info',
    type: 'raw',
    stream: prettyStdOut // log INFO and above to stdout
  });

}

const logger = module.exports = bunyan.createLogger(config);
