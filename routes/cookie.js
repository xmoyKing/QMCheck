var express = require('express');
var fs = require('fs');
var path = require('path');
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
        res.send(msg)
    });
})

module.exports = router;