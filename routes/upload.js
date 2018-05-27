var express = require('express');
var fs = require('fs');
var path = require('path');
var router = express.Router();

const util = require('util');
const cp = require('child_process');
const exec = util.promisify(cp.exec);


/* GET upload page. */
router.get('/', function(req, res, next) {
    let totalMsg = '';

    async function runCmd(cmd) {
        const {error, stdout, stderr} = await exec(cmd);
        console.log('\n', error, stdout, stderr)

        if(error){
            totalMsg += `${error}`;
            return false;
        }else{
            totalMsg += `${stdout}`;
            return true;
        }
    }

    const cmds = ['git add .', 'git commit -m "upload"', 'git status'];

    runCmd(cmds[0]) && runCmd(cmds[1]) && runCmd(cmds[2]);

    console.log(`\n totalMsg: ${totalMsg} \n`);

    res.render('index', {
        title: totalMsg
    });

});

module.exports = router;