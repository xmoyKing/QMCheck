let express = require('express');
let fs = require('fs');
let path = require('path');
let router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {
  let json = JSON.parse(fs.readFileSync(path.join(__dirname, '../record.json'), 'utf-8'));
  res.render('check', {
    title: '青梅煮酒小组 昨日请出组员名单',
    record: json.record,
  });
});

module.exports = router;
