var express = require('express');
var fs = require('fs');
var path = require('path');
var schedule = require('node-schedule');
var mail = require('../mail');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
    //var json = JSON.parse(fs.readFileSync(path.join(__dirname, '../record.json'), 'utf-8'));
    fs.stat(path.join(__dirname, '../cookie.txt'),function(err, stats){
        res.render('cookie', {
            title: '更新cookie',
            mtime: stats.mtime
        });
    });
});

router.post('/upload', function(req, res, next) {
    console.log(req.body);
    fs.writeFile(path.join(__dirname, '../cookie.txt'), req.body.cook, function(err) {
        var msg = 'error';
        if (!err) msg = 'succss';

        var now = new Date;
        now.setDate(now.getDate() + 9); // 9天后的此时发送提醒邮件
        // var date = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), now.getMinutes(), 0);  

        var j = schedule.scheduleJob(now, function() {
            mail.send();
            j.cancel();
        });

        res.send(msg)
    });
})

module.exports = router;