var express = require('express');
var fs = require('fs');
var path = require('path');
var qm = require('../qm');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
    qm.check('crt', function(json) {
        console.log(JSON.stringify(json));
        json = json; //|| JSON.parse(fs.readFileSync(path.join(__dirname, '../crt.json'), 'utf-8'));
        res.render('check', {
            title: '青梅煮酒小组 当前不符合组员名单',
            record: json.record
        });
    });
});

module.exports = router;