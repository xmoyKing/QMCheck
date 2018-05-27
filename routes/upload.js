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
    const cmds = ['git status'] //, 'git add .', 'git commit -m "upload"', 'git push'];

    function renderMsg() {
        // console.log(`\n totalMsg: ${totalMsg} \n`);
        res.render('stdout', {
            message: totalMsg
        });
    }
    async function runCmd(cmds = ['git status'], idx = 0) {
        const {error, stdout, stderr} = await exec(cmds[idx]);
        console.log('\n cmd: \n', error, stdout, stderr)

        if(error){
            totalMsg += `${error}`;
            renderMsg(); // 当有错误时直接渲染，不执行后面的命令
        }else{
            totalMsg += `${stdout}`;
            // 执行最后一个命令后渲染页面
            if(idx == cmds.length - 1){
                renderMsg();
            }else{ // 否则继续继续后续任务
                runCmd(cmds, idx+1);
            }
        }
    }

    runCmd(cmds);
});

module.exports = router;