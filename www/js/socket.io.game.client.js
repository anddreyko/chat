$(function(){
    var socket = io.connect('', {
        'reconnect': false
    });
    $('form').submit(function(){
        socket.emit('message', $('#text').val(), function(u,t){
            printmessage(u+' > '+t);
            $('#text').val('');
        });
        return false;
    });
    socket
        .on('message', function(u, t){
            printmessage(u+' > '+t);
        })
        .on('leave', function(u){
            leave(u);
        })
        .on('join', function(u){
            join(u);
        })
        .on('connect', function(){
            //printmessage('соединение установлено');
        })
        .on('disconnect', function(){
            //printmessage('соединение потеряно');
        })
        .on('logout', function(){
            location.href='/';
        })
        .on('error', function(){
            setTimeout(function(){
                socket.socket.connect();
            }, 500);
        });
    socket.emit('join', function(e){
        join(e);
    });
    window.onbeforeunload = function () {
        socket.emit('leave', function(e){
            leave(e);
        });
    };
    function printmessage(e){
        $('#chat').append('<p>'+e+'</p>');
    }
    function join(e){
        if(e!==''){
            leave(e);
            $('#online').append('<p id="'+e+'">'+e+'</p>');
        }
    }
    function leave(e){
        if(e!=='') $('#online p#'+e).remove();
    }
});