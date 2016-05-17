var HttpError = require('../error').HttpError;
module.exports = function(req, res, next) {
    res.sendHttpError = function(err) {
    res.status(err.status);
        if (res.req.headers['x-requested-with'] == 'XMLHttpRequest') {
            res.json(err);
        } else {
            if(err.status==403)
                res.render('login.html', {title:__('Containers')+' | Вход', error:['true',__(err.message)]});
            if(err.status==404)
                res.render('error.html', {title:__('Containers')+' | Не найдено', error:['true',__(err.message)]});
            if(err.status==500)
                res.render('error.html', {title:__('Containers')+' | Фатальная ошибка =(', error:['true', __(err.message)]});
            else
                res.render('error.html', {title:__('Containers'), error:__(err.message)});
            //res.render("error", {error: });
        }
    };
    res.locals.helpers = {
        now: function() {
            return new Date().toString();
        }
    };
    next();
};