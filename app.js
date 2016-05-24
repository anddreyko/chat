var express = require('express')
  , http = require('http')
  , HttpError = require('./error').HttpError
  , log = require('./lib/#log')(module)
  , conf = require('./conf')
  , i18n = require('i18n')
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
  , app = express()
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
app.use(function(err, req, res, next) { log.info(req.headers.origin || req.headers.referer); next(); });
app.use(i18n.init);
app.use(express.bodyParser());
app.use(express.cookieParser());
app.use(express.session(sesionConf));
app.use(require('./lib/resExtensions'));
app.use(require('./lib/loadUser'));
require('./routes')(app);
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
require('./socket')(server);
server.listen(port, function(){
    log.info(port);
});