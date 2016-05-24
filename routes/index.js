var User = require('../models/user').User
  , AuthErr = require('../models/user').AuthErr
  , HttpError = require('../error').HttpError
  , log = require('../lib/#log')(module)
  , auth = require('../lib/auth')
  , sec = require('../lib/#sec');
module.exports = function(app) {
    app.get('/', function(req, res){
        res.redirect('/user');
    });
    app.get('/game', auth, function(req, res, next) {
        require('fs').readFile(__dirname+'/../template/interface.svg', function (err, data) {
            if(err) next(new HttpError(500, err.message));
            res.render('game.html', {title:__('Containers')+' | Игра', interface: data.toString()});
        });
    });
    app.get('/user', auth, function(req, res, next){
        res.render('user.html', {title:__('Containers')+' | Профиль'});
    });
    app.get('/user/:id', auth, function(req, res, next){
        User.findOne({username:req.params.id}, function(err, user){
            if(err) return next(err);
            if(!user) return next(404);
            res.render('user.html', {title:__('Containers')+' | Профиль', user:user});
        });
    });
    app.post('/logout', function(req, res, next) {
        req.session.destroy(function(err){
            if(err) return next(err);
            res.redirect('/');
        });
    });
    app.get('/login', function(req, res) {
        if(req.session.user) res.redirect('/');
        else res.render('login.html', {title:__('Containers')+' | Вход', error:''});
    });
    app.post('/login', function(req, res, next) {
        var username = sec(req.body.username);
        var password = sec(req.body.password);
        User.authentification(username, password, function(err, user){
            if(err){
                if(err instanceof AuthErr)
                    return next(new HttpError(401, err.message));
                else
                    return next(err);
            }
            req.session.user = user._id;
            res.redirect('/');
        });
    });
    app.use(function(req, res, next) {
        err = res.status(404);
        next(new HttpError(err.statusCode));
    });
};