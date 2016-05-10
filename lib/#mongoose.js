var log = require('./#log')(module)
  , mongoose = require('mongoose')
  , conf = require('../conf');
mongoose.connect(conf.get('mongoose:uri'), conf.get('mongoose:options'));
mongoose.connection.on('connected', function() {
    log.info('connected');
});
mongoose.connection.on('error', function(err)  {
    log.error("Mongoose error", err);
});
log.info("DB initialized");
module.exports = mongoose;