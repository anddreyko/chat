var HttpError = require('../error').HttpError;
module.exports = function(req, res, next) {
    res.sendHttpError = function(err) {
    res.status(err.status);
        if (res.req.headers['x-requested-with'] == 'XMLHttpRequest') {
            res.json(err);
        } else {
            res.render('error.html', {title:__('Containers'), error:__(err)});
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