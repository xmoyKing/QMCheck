let express = require('express');
let fs = require('fs');
let path = require('path');
// var schedule = require('node-schedule');
// var mail = require('../mail');
let router = express.Router();
let config = JSON.parse(fs.readFileSync(path.join(__dirname, '../config.json'), 'utf-8'));

/* GET home page. */
router.get('/', function (req, res, next) {
  // var json = JSON.parse(fs.readFileSync(path.join(__dirname, '../record.json'), 'utf-8'));
  fs.stat(path.join(__dirname, '../config.json'), function (err, stats) {
    res.render('cookie', {
      title: '更新cookie',
      mtime: stats.mtime,
    });
  });
});

router.post('/upload', function (req, res, next) {
  console.log(req.body.cook);
  // 仅上传cookie
  config.cookie = req.body.cook;
  try {
    fs.writeFileSync(path.join(__dirname, '../config.json'), JSON.stringify(config));
    res.send('success');
  } catch (error) {
    res.send(JSON.stringify(error));
  }
});

module.exports = router;
