let express = require('express');
let qm = require('../qm');
let router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {
  qm.check('crt', function (result) {
    res.render('check', {
      title: '青梅煮酒小组 当前不符合组员名单',
      msg: result.msg || '',
      record: result.record,
    });
  });
});

module.exports = router;
