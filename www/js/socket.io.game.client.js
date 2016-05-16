$(function(){
    var socket = io.connect('', { 'reconnect': false });
    $(".chat #text").keyup(function(e){
        if(e.ctrlKey || (e.keyCode == 0xA || e.keyCode == 0xD)){
            e.preventDefault();
            onmessage();
        }
    });
    $('form').submit(function(){
        onmessage();
        return false;
    });
    socket
        .on('message', function(u, m, t){
            printmessage(arguments);
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
                socket.connect();
            }, 500);
        });
    socket.emit('join', function(e){
        //join(e);
    });
    window.onbeforeunload = function () {
        socket.emit('leave', function(e){
            leave(e);
        });
    };
    function onmessage(){
        socket.emit('message', $('#text').val(), function(u,t){
            printmessage(arguments);
        });
        $('.chat #text').val('');
        $('.chat #text').focus();
    }
    function printmessage(e){
        var t = new Date()
          , d = t.getDate()
          , j = t.getMonth() + 1
          , y = t.getFullYear()
          , h = t.getHours()
          , m = t.getMinutes();
        if(d < 10) d = '0'+d;
        if(j < 10) j = '0'+j;
        if(h < 10) h = '0'+h;
        if(m < 10) m = '0'+m;
        $('#chat')
            .append('<div class="mess"><p class="chat-name">'+e[0]+'</p><p class="chat-time" title="'+d+'.'+j+'.'+y+'">'+h+':'+m+'</p><p class="chat-message">'+e[1]+'</p></div>')
            .scrollTop($(this).height());
        $('.mess:last').click(retweet);
    }
    function retweet(e){
            $('.chat #text').val($('.chat #text').val()+' '+$(this).find('.chat-name').text()+', ').focus();
        }
    function join(e){
        /* if(e!==''){
            leave(e);
            $('#online').append('<p id="'+e+'">'+e+'</p>');
        } */
    }
    function leave(e){
        //if(e!=='') $('#online p#'+e).remove();
    }
});