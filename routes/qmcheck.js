var express = require('express');
var fs = require('fs');
var path = require('path');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
    var json = fs.readFileSync(path.join(__dirname, '../record.json'), 'utf-8');
    res.render('check', {
        title: '青梅煮酒小组 每日查卡 结果页面',
        record: json
    });
});

module.exports = router;