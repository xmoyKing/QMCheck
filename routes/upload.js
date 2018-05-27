var express = require('express');
var fs = require('fs');
var path = require('path');
var router = express.Router();

const util = require('util');
const cp = require('child_process');
const exec = util.promisify(cp.exec);

let dir = __dirname;
/* GET upload page. */
router.get('/', function(req, res, next) {
    let totalMsg = '';
    const cmds = ['git status', 'git add .', 'git commit -m "upload"', 'git push origin master'];

    function renderMsg() {
        res.render('stdout', {
            message: totalMsg
        });
    }
    async function runCmd(cmds = ['git status'], idx = 0) {
        totalMsg += `cmd: ${cmds[idx]} \n`;
        try{
            const {error, stdout, stderr} = await exec(cmds[idx], {cwd: dir}); // linux下需要带cwd选项，否则会报错：不是一个git repo
            // console.log(`\n cmd: ${cmds[idx]} \n error: \n ${error} \n stdout: \n ${stdout} \n stderr: \n ${stderr}`)

            if(error){
                totalMsg += `${error}`;
                renderMsg(); // 当有错误时直接渲染，不执行后面的命令
            }else{
                totalMsg += `stdout: \n ${stdout} \n stderr: \n ${stderr} \n`;
                
                if((cmds[idx] == 'git status' && stdout.indexOf('nothing to commit, working tree clean') !== -1 || (idx == cmds.length - 1))){
                    // 执行最后一个命令后渲染页面
                    renderMsg();
                }else{ // 否则继续继续后续任务
                    runCmd(cmds, idx+1);
                }
            }
        }catch(e){
            totalMsg += `Catch Exception: ${e}`;
            renderMsg();
        }
    }

    runCmd(cmds);
});

module.exports = router;