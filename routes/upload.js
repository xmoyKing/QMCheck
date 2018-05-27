var express = require('express');
var fs = require('fs');
var path = require('path');
var cp = require('child_process');
var router = express.Router();

/* GET upload page. */
router.get('/', function(req, res, next) {
    cp.execFile('../upload.sh', [], (err, stdout, stderr) => {
        if(err){ console.error(err); }
      
        // console.log(`stdout: ${stdout}`);
        // console.log(`stderr: ${stderr}`);

        res.render('index', {
            title: err || `stdout: ${stdout}`
        });
    });
});

module.exports = router;