var HttpError = require('../error').HttpError;
module.exports = function(req, res, next) {
    res.sendHttpError = function(err) {
        res.status(err.status);
        if (res.req.headers['x-requested-with'] == 'XMLHttpRequest') {
            res.json(err);
        } else {
            switch(err.status){
                case 401:
                    res.render('login.html', {title: __('Containers'), error: err});
                    break;
                default:
                    res.render('error.html', {title: __('Containers'), error: err});
            }
        }
    };
    res.locals.helpers = {
        now: function() {
            return new Date().toString();
        }
    };
    next();
};