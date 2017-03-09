var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var fs = require('fs');

var index = require('./routes/index');
var users = require('./routes/users');
var cook = require('./routes/cookie');
// QMCheck page
var qmcheck = require('./routes/qmcheck');
var qm = require('./qm');
var schedule = require('node-schedule');
////////////////////////////////////////////////////////////////////////////////
//定时器
var j = schedule.scheduleJob('55 23 * * *', function() {
    qm.check('record', function(json) {
        let crtDate = new Date();
        if (crtDate.getHours() === 23 && crtDate.getMinutes() >= 55)
            qm.disple(json.ids);
        else console.log('时间不在23:55~59之内 : ' + crtDate);
    });
});

////////////////////////////////////////////////////////////////////////////////

var app = express();
var accessLogfile = fs.createWriteStream('access.log', { flags: 'a' });
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('common')); // 更改morgan的内置输出日志格式
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);
app.use('/users', users);

// Shanbay QMCheck & result page
app.use('/qmcheck', qmcheck);
app.use('/cookie', cook);
// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handler
app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

module.exports = app;