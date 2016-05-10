var nconf = require('nconf')
  , path = require('path');

nconf
    .argv()
    .env()
    .file({file:path.join(__dirname,'conf.json')});

module.exports = nconf;