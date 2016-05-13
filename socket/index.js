var log = require('../lib/#log')(module)
  , conf = require('../conf')
  , connect = require('connect')
  , cookieParser = require('cookie-parser')
  , async = require('async')
  , cookie = require('cookie')
  , sessionStore = require('../lib/#sessionStore')
  , HttpError = require('../error').HttpError
  , User = require('../models/user').User;
function loadSession(sid, callback){
    sessionStore.load(sid, function(err, session){
        if(arguments.length==0){
            return callback(null, null);
        } else{
            return callback(null, session);
        }
    });
}
function loadUser(session, callback){
    if(!session.user){
        log.debug('session %s is anonymous', session.id);
        return callback(null, null);
    }
    log.debug('retrievng user %s', session.user);
    User.findById(session.user, function(err, user){
        if(err) return callback(err);
        if(!user) return callback(null, null);
        log.debug('user findbyId result: %s', user);
        callback(null, user);
    });
}
module.exports = function(server){
    var io = require('socket.io').listen(server);
    io.set('origins', 'localhost:*');
    
    io.use(function(handshake, callback){
        async.waterfall([
            function (callback){
                handshake.request.cookies = cookie.parse(handshake.request.headers.cookie || '');
                var sidCookie = handshake.request.cookies[conf.get('session:key')]
                  , sid = cookieParser.signedCookie(sidCookie, conf.get('session:secret'));
                loadSession(sid, callback);
            }
          , function (session, callback){
                if(!session) return callback(new HttpError(401, 'No session'));
                handshake.request.session = session;
                loadUser(session, callback);
            }
          , function (user, callback){
                if(!user) return callback(new HttpError(403, 'Anonymous session may not connect'));
                handshake.request.user = user;
                callback(null);
            }
        ] , function(err){
            if(!err) return callback(null, true);
            if(err instanceof HttpError) return callback(null, false);
            callback(err);
        })
    });
    io.sockets.on('session:reload', function(sid){
        log.error('session:reload');
        var clients = io.sockets.clients();
        clients.forEach(function(client){
            if(client.request.session.id != sid) return;
            loadSession(sid, function(err, session){
                if(err){
                    client.emit('error', 'server error');
                    client.disconnect();
                    return;
                }
                if(!session){
                    client.emit('logout');
                    client.disconnect();
                    return;
                }
                client.request.session = session;
            });
        })
    });
    io.sockets.on('connection', function(s){
        var username = !!s.request.user?s.request.user.get('username'):'anonymous';
        //s.broadcast.emit('join', username);
        s.on('message', function(t, d){
            u = username;
            s.broadcast.emit('message', u, t);
            d && d(u, t);
        });
        s.on('join', function(d){
            u = username!='anonymous'?username:'';
            s.broadcast.emit('join', u);
            d && d(u);
        });
        s.on('leave', function(){
            u = username!='anonymous'?username:'';
            s.broadcast.emit('leave', u);
            d && d(u);
        });
    });
    return io;
}