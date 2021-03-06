let express = require('express');
let router = express.Router();

const util = require('util');
const cp = require('child_process');
const exec = util.promisify(cp.exec);

let dir = `${__dirname}/../`;
/* GET upload page. */
router.get('/', function (req, res, next) {
  let totalMsg = '';
  function renderMsg() {
    res.render('stdout', {
      message: totalMsg,
    });
  }
  async function runCmd(cmds = ['git status'], idx = 0) {
    totalMsg += `cmd: ${cmds[idx]} \n`;
    try {
      const { error, stdout, stderr } = await exec(cmds[idx], { cwd: dir }); // linux下需要带cwd选项，否则会报错：不是一个git repo
      // console.log(`\n cmd: ${cmds[idx]} \n error: \n ${error} \n stdout: \n ${stdout} \n stderr: \n ${stderr}`)

      if (error) {
        totalMsg += `${error}`;
        renderMsg(); // 当有错误时直接渲染，不执行后面的命令
      } else {
        // 当git push时，不显示push地址，仅显示最后的hash码即可
        if (idx === 3) {
          let pushHash = `${stderr}`.split('github.com/xmoyKing/QMCheck.git')[1];
          totalMsg += `stdout: \n ${stdout} \n stderr: \n ${pushHash} \n`;
        } else {
          totalMsg += `stdout: \n ${stdout} \n stderr: \n ${stderr} \n`;
        }

        if (
          (cmds[idx] === 'git status' && stdout.indexOf('nothing to commit, working tree clean') !== -1) ||
          idx === cmds.length - 1
        ) {
          // 执行最后一个命令后渲染页面
          renderMsg();
        } else {
          // 否则继续继续后续任务
          runCmd(cmds, idx + 1);
        }
      }
    } catch (e) {
      totalMsg += `Catch Exception: ${e}`;
      console.log(e);
      renderMsg();
    }
  }

  const cmds = ['git status', 'git add -A .', 'git commit -m "upload"', 'git push origin master'];
  runCmd(cmds);
});

module.exports = router;
