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
  , sessionConfig = {
        secret: conf.get('session:secret')
      , cookie: {
            path: "/",
            maxAge: conf.get('session:maxAge'),
            httpOnly: true
        }
      , key: "sid"
      , store: new mongoStore({'db': 'sessions'})
    }
  , app = express()
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
app.use(express.session(sessionConfig));
app.use(require('./lib/resExtensions'));
app.use(require('./lib/loadUser'));
app.get('/', auth, function(req, res){
    res.render('index.html', {title:__('Containers')});
});
app.get('/login', function(req, res) {
    res.render('login.html', {title:__('Containers')});
});
app.get('/logout', function(req, res) {
    req.session.destroy();
    res.redirect('/login');
});
app.get('/chat', function(req, res) {
    res.render('chat.html', {title:__('Containers')});
});
app.post('/login', function(req, res, next) {
    var username = req.body.username;
    var password = req.body.password;
    User.authentification(username, password, function(err, user){
        if(err){
            //res.redirect('/login');
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
io.sockets.on('connection', function(s){
    s.on('message', function(t, d){
        s.broadcast.emit('message', t);
        d && d(t);
    });
});

