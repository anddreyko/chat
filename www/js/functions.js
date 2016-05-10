var screen = $(window);
var screenHeight = screen.height();
var screenWidth = screen.width();
var picWidth = 1920;
var k = picWidth/screenWidth;
var scrollTop;
var scrollBottom;
var frameTop;
var frameBottom;
var frameHeight;
var wrap;

$(function(){
    Resize();
    Scroll();
    $('.start').removeClass('start');
    screen.resize(function(){
    	Resize();
    });
    screen.scroll(function(){
    	Scroll();
    });
    
});

function Resize(){
    screenHeight = screen.height();
    screenWidth = screen.width();
    wrap = $('.wrap');
    wrap.css('width','100%');
    k = picWidth/wrap.width();
    $('.header').css({'font-size':(90/k)+'px'});
    $('.text h2').css({'font-size':(40/k)+'px'});
    $('.text p').css({'font-size':(22/k)+'px'});
    $('.text-final h2').css({'font-size':(60/k)+'px'});
    $('.text-final p').css({'font-size':(32/k)+'px'});
    $('.text-vote').width('100%');
    $('.text-vote').width($('.text-vote h2').css({'font-size':(50/k)+'px'}).width());
    $('.text-skill h3').css({'font-size':(24/k)+'px'});
    $('.text-skill p').css({'font-size':(18/k)+'px'});
    $('.text-vote p').css({'font-size':(18/k)+'px'});
    $('.text-button').css({'font-size':(28/k)+'px','border-radius':(30/k)+'px','border':(8/k)+'px #ffffff solid'});
    $('.text-footer p').css({'font-size':(20/k)+'px'});
    $('.text-footer small').css({'font-size':(16/k)+'px'});
    $('.frame').each(function(i, e){
        $(e).css({'height': $(e).attr('height')/k+'px'});
    });
}

function Scroll(){
    scrollTop = screen.scrollTop();
    scrollBottom = scrollTop + screenHeight;
    frameTop = 0;
    frameHeight = $('.f1').height();
    frameBottom = frameHeight;
    if (scrollTop <= frameBottom && scrollBottom >= frameTop) {
        $('.f1l1').css({'top':Path(24,32) +'%'});
        $('.f1l3').css({'top':Path(24,13) +'%'});
    }
    frameTop = frameBottom;
    frameHeight = $('.f2').height();
    frameBottom += frameHeight;
    if (scrollTop <= frameBottom && scrollBottom >= frameTop) {
        $('.f2l1').css({'top':Path(-9,-27) +'%'});
    }
    frameTop = frameBottom;
    frameHeight = $('.f3').height();
    frameBottom += frameHeight;
    if (scrollTop <= frameBottom && scrollBottom >= frameTop) {
        $('.f3l1').css({'top':Path(-1,-17) +'%'});
    }    
    frameTop = frameBottom;
    frameHeight = $('.f4').height();
    frameBottom += frameHeight;
    if (scrollTop <= frameBottom && scrollBottom >= frameTop) {
        $('.f4l2').css({'top':Path(-9,-30) +'%'});
        $('.f4l1').css({'top':Path(-20,20) +'%'});
    }
    frameTop = frameBottom;
    frameHeight = $('.f5').height();
    frameBottom += frameHeight;
    if (scrollTop <= frameBottom && scrollBottom >= frameTop) {
        $('.f5l1').css({'top':Path(13,29) +'%'});
    }
    frameTop = frameBottom;
    frameHeight = $('.f6').height();
    frameBottom += frameHeight;
    if (scrollTop <= frameBottom && scrollBottom >= frameTop) {
        $('.f6l1').css({'left':Path(55,60) +'%'});
        $('.f6l2').css({'left':Path(36,32) +'%'});
    }
}

function Path(pathEnd,pathBegin){
    return pathBegin+(scrollBottom-frameTop)*(pathEnd-pathBegin)/(frameHeight + screenHeight);
}