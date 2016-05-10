var winston = require('winston');
var ENV = process.env.NODE_ENV;

// can be much more flexible than that O_o
function getLogger(module) {
  return new winston.Logger({
    transports: [
      new winston.transports.Console({
        colorize: true,
//        level: ENV == 'development' ? 'debug' : 'error',
        level: 'info',
        label: module.filename.split('/').slice(-2).join('/')
      })
    ]
  });
}

module.exports = getLogger;
