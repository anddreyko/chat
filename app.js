var express = require('express')
  , http = require('http')
  , User = require('./models/user').User
  , HttpError = require('./error').HttpError
  , AuthErr = require('./models/user').AuthErr
  , log = require('./lib/#log')(module)
  , conf = require('./conf')
  , i18n = require('i18n')
  , async = require('async')
  , mongoose = require('./lib/#mongoose')
  , mongoStore = require('connect-mongostore')(express)
  , sessionStore = require('./lib/#sessionStore')
  , sesionConf = {
        secret: conf.get('session:secret')
      , cookie: {
            path: "/",
            maxAge: conf.get('session:maxAge'),
            httpOnly: true
        }
      , key: "sid"
      , store: sessionStore
    }
  , ObjectID = require('mongodb').ObjectID
  , app = express()
  , sec = require('./lib/#sec')
  , auth = require('./lib/auth')
  , server = http.createServer(app)
  , io = require('socket.io').listen(server)
  , port = process.env.PORT || conf.get('port');
app.configure(function() {
    app.engine('html', require('uinexpress').__express);
    app.set('view engine', 'html');
    app.set('views', __dirname + "/template");
    app.set("view options", {layout: 'layout.html'});
    app.use(express.static(__dirname + "/www"));
});
i18n.configure({
    locales:['en', 'ru']
  , directory: __dirname + '/lang'
  , defaultLocale: 'en'
  , cookie: 'kontainer-game'
  , register: global
});
app.use(i18n.init);
app.use(express.bodyParser());
app.use(express.cookieParser());
app.use(express.session(sesionConf));
app.use(require('./lib/resExtensions'));
app.use(require('./lib/loadUser'));
app.get('/', function(req, res){
    res.redirect('/chat');
});
app.get('/user', function(req, res, next){
    res.render('user.html', {title:__('Containers')+' | Профиль', id:req.session.user});
});
app.get('/user-:id', function(req, res, next){
    try{
        var id = new ObjectID(req.params.id);
    }catch(e){
        return next(new HttpError(404));
    }
    User.findOne({_id:id}, function(err, user){
        if(err) return next(err);
        if(!user) return next(404);
        res.render('user.html', {title:__('Containers')+' | Профиль', id:user});
    });
});
app.get('/login', function(req, res) {
    if(req.session.user) res.redirect('/');
    else res.render('login.html', {title:__('Containers')+' | Вход', error:['']});
});
app.get('/logout', function(req, res, next) {
    var sid = req.session.id
      , io = req.app.get('io');
    req.session.destroy(function(err){
        io.sockets.emit('session:reload', sid);
        if(err) return next(err);
        res.redirect('/');
    });
});
app.get('/chat', auth, function(req, res, next) {
    require('fs').readFile(__dirname+'/template/interface.svg', function (err, data) {
        if(err) next(new HttpError(500, err.message));
        res.render('chat.html', {title:__('Containers')+' | Игра', interface: data.toString()});
    });
});
app.post('/login', function(req, res, next) {
    var username = sec(req.body.username);
    var password = sec(req.body.password);
    User.authentification(username, password, function(err, user){
        if(err){
            if(err instanceof AuthErr)
                return next(new HttpError(403, err.message));
            else
                return next(err);
        }
        req.session.user = user._id;
        res.redirect('/');
        res.send();
    });
});
app.use(function(req, res, next) {
  var err = res.status(404);
  next(new HttpError(err));
});
app.use(function(req, res, next) {
  res.status(403).render('error.html', {title:__('Containers')+' | Доступ запрещен', error:['true','403']});
});
app.use(function(req, res, next) {
  res.status(500).render('error.html', {title:__('Containers')+' | Ошибка', error:['true','500']});
});
app.use(function(err, req, res, next) {
    if (typeof err == 'number') {
        err = new HttpError(err);
    }
    if (err instanceof HttpError) {
        log.error(err);
        res.sendHttpError(err);
    } else {
        if (app.get('env') == 'development') {
            express.errorHandler()(err, req, res, next);
        } else {
            err = new HttpError(500);
            log.error(err);
            res.sendHttpError(err);
        }
    }
});

server.listen(port, function(){
    log.info(port);
});
require('./socket')(server);
app.set('io', io);