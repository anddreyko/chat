var crypto = require('crypto')
  , async = require('async')
  , mongoose = require('lib/#mongoose')
  , Schema = mongoose.Schema
  , HttpError = require('error').HttpError;
var util = require('util');
var schema = new mongoose.Schema({
    username: {
        type: String
      , unique: true
      , required: true
    }
  , hashedPassword: {
        type: String
      , required: true
    }
  , salt: {
        type: String
      , required: true
    }
  , created: {
        type: Date
      , default: Date.now
    }
});

schema.methods.encryptPassword = function(password) {
    return crypto.createHmac('sha1', this.salt).update(password).digest('hex');
};

schema.virtual('password')
    .set(function(password) {
        this._plainPassword = password;
        this.salt = Math.random() + '';
        this.hashedPassword = this.encryptPassword(password);
    })
    .get(function() { return this._plainPassword; });


schema.methods.checkPassword = function(password) {
    return this.encryptPassword(password) === this.hashedPassword;
};

schema.methods.getPublicFields = function() {
    return {
        username: this.username
      , created: this.created
      , id: this.id
    };
};

schema.statics.authentification = function(username, password, callback){
    var User = this;
    async.waterfall(
        [
            function (callback){
                User.findOne({ username: username }, callback);
            }
          , function (user, callback){
                if(user){
                    if(user.checkPassword(password)){
                        callback(null, user);
                    }
                    else{
                        callback(new AuthErr('err Password'));
                    }
                }
                else{
                    var user = new User({username: username, password: password});
                    user.save(function(err){
                        if(err) return callback(err);
                        callback(null, user);
                    });
                }
                
            }
        ]
      , callback
    );
    /*
    if (!user) {
        user = new User({
            username: req.body.username
          , password: req.body.password
        });
        // если просто user.save(callback), то будет лишний аргумент у следующей функции
        user.save(function(err, user, affected) {
            callback(err, user);
        });
        log.info('new user');
    } else {
        log.info(req.body.username);
        if (user.checkPassword(req.body.password)) {
            callback(null, user);
            log.info('password');
        } else {
            log.info('404');
            //res.send(404, 'Логин или пароль неверен.');
        }
    }*/
}

exports.User = mongoose.model('User', schema);

function AuthErr(message){
    Error.apply(this, arguments);
    Error.captureStackTrace(this, AuthErr);
    this.message = message;
}

util.inherits(AuthErr, Error);
AuthErr.prototype.name = 'AuthErr';
exports.AuthErr = AuthErr;
exports.HttpError = HttpError;
