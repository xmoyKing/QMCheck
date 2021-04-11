let express = require('express');
let path = require('path');
let favicon = require('serve-favicon');
let logger = require('morgan');
let cookieParser = require('cookie-parser');
let bodyParser = require('body-parser');
let fs = require('fs');
let qm = require('./qm');
let schedule = require('node-schedule');

// QMCheck Routes tmpl page
let index = require('./routes/index');
let users = require('./routes/users');
let cook = require('./routes/cookie');
let qmcheck = require('./routes/qmcheck');
let upload = require('./routes/upload');

// //////////////////////////////////////////////////////////////////////////////
let config = JSON.parse(fs.readFileSync(path.join(__dirname, 'config.json'), 'utf-8'));
let crontable = config.crotable;
// 定时器
let j = schedule.scheduleJob(crontable, function () {
  console.log('start to exec schedule job');
  qm.check('record', function (result, cookie) {
    qm.disple(result.ids, cookie);
  });
});

// //////////////////////////////////////////////////////////////////////////////

let app = express();
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

// Use Routes
app.use('/', index);
app.use('/users', users);
app.use('/qmcheck', qmcheck);
app.use('/upload', upload);
app.use('/cookie', cook);
// catch 404 and forward to error handler
app.use(function (req, res, next) {
  let err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
