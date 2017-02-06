var express = require('express');
var fs = require('fs');
var path = require('path');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
    var json = JSON.parse(fs.readFileSync(path.join(__dirname, '../record.json'), 'utf-8'));
    res.render('check', {
        title: '青梅煮酒小组 昨日请出组员名单',
        record: json.record
    });
});

module.exports = router;