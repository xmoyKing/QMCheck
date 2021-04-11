let fs = require('fs');
let path = require('path');
let fetch = require('node-fetch');
// // //////////////////////////////////////////////////////////////////////////////

function dispel(ids, cookie) {
  const body = JSON.stringify({ user_ids: ids });

  fetch('https://apiv3.shanbay.com/team/group/manage/members', {
    headers: {
      accept: '*/*',
      'accept-language': 'en-US,en;q=0.9,zh-CN;q=0.8,zh;q=0.7',
      'cache-control': 'no-cache',
      'content-type': 'application/json',
      pragma: 'no-cache',
      'sec-ch-ua': '"Google Chrome";v="89", "Chromium";v="89", ";Not A Brand";v="99"',
      'sec-ch-ua-mobile': '?0',
      'sec-fetch-dest': 'empty',
      'sec-fetch-mode': 'cors',
      'sec-fetch-site': 'same-site',
      'x-csrftoken': '34cdb66556d51897e64d63d69fdc77f2',
      'x-referrer-app': 'client/team',
      cookie,
    },
    referrer: 'https://web.shanbay.com/',
    referrerPolicy: 'strict-origin-when-cross-origin',
    body,
    method: 'DELETE',
    mode: 'cors',
  })
    .then(r => r.json())
    .then(r => {
      console.log(r);
    })
    .catch(e => {
      fs.writeFile(path.join(__dirname, 'log.txt'), `${Date()}\n${e.toString()}\n`, { flag: 'a' });
    });
}

// 检查结果，过滤出应踢出的userid ==> { ids, record: { date, dispel: [{userInfo}] } }
function filterUserIds(r) {
  console.log(r);
  let date = Date();
  const ids = [];
  const record = { date, dispel: [] };
  r.objects.forEach(i => {
    i.checkin_rate *= 100;
    if (i.checkin_rate >= 97) {
      // 打卡率大于97则表示当前页都合格
    } else if (i.checkin_today && i.checkin_yesterday) {
    } else if (i.age >= 30 && i.checkin_yesterday) {
    } else if (i.checkin_rate >= 96 && i.checkin_today) {
    } else {
      // 若打卡率低于97%,且组龄小与30天
      ids.push(i.user_id); // 将id计入ids

      let allInfo = {};
      allInfo.avatar = i.user_info.avatar_url; // 用户头像
      allInfo.dataid = i.user_id;
      allInfo.name = i.user_info.nickname; // 用户昵称
      allInfo.link = `https://web.shanbay.com/web/users/${i.user_id}/zone`; // 用户首页
      allInfo.points = i.points; // 用户积分
      allInfo.days = i.age; // 用户组龄
      allInfo.rate = i.checkin_rate.toFixed(2); // 用户打卡率
      allInfo.check0 = i.checkin_yesterday ? '已打卡' : '-'; // 前一天是否打卡
      allInfo.check1 = i.checkin_today ? '已打卡' : '-'; // 当日是否打卡

      record.dispel.push(allInfo);
    }
  });
  return { ids, record };
}

// 写入记录 / 执行回调函数（users为展示当前不合格的组员，crontab则为真正执行踢人函数）
function wtFileAndCallback(result, recordFile, callbackFunction, cookie) {
  fs.writeFile(
    path.join(__dirname, `${recordFile}-log.txt`),
    `\n${JSON.stringify(result)}\n`,
    { flag: 'a' },
    function (err2) {
      if (err2) {
        console.log('fs writeFile err: ', err2);
      }
    }
  );
  fs.writeFile(path.join(__dirname, `${recordFile}.json`), JSON.stringify(result), function (err2) {
    if (err2) {
      console.log('fs writeFile err: ', err2);
    }

    callbackFunction && callbackFunction(result, cookie); // 执行回掉函数
  });
  console.log('end: check');
}

function check(recordFile, callbackFunction) {
  console.log('OY-check-start:');
  // 每次都需要取最新的cookie
  const { cookie } = JSON.parse(fs.readFileSync(path.join(__dirname, 'config.json'), 'utf-8'));
  fetch('https://apiv3.shanbay.com/team/group/manage/members?ipp=50&page=1&rank_type=CHECKIN_RATE&order=POSITIVE', {
    headers: {
      accept: '*/*',
      'accept-language': 'en-US,en;q=0.9,zh-CN;q=0.8,zh;q=0.7',
      'cache-control': 'no-cache',
      'content-type': 'application/json',
      pragma: 'no-cache',
      'sec-ch-ua': '"Google Chrome";v="89", "Chromium";v="89", ";Not A Brand";v="99"',
      'sec-ch-ua-mobile': '?0',
      'sec-fetch-dest': 'empty',
      'sec-fetch-mode': 'cors',
      'sec-fetch-site': 'same-site',
      'x-csrftoken': '34cdb66556d51897e64d63d69fdc77f2',
      'x-referrer-app': 'client/team',
      cookie,
    },
    referrer: 'https://web.shanbay.com/',
    referrerPolicy: 'strict-origin-when-cross-origin',
    body: null,
    method: 'GET',
    mode: 'cors',
  })
    .then(r => r.json())
    .then(r => {
      if (!r.objects && r.msg) {
        throw new Error(r.msg);
      }

      const result = filterUserIds(r);
      wtFileAndCallback(result, recordFile, callbackFunction, cookie);
    })
    .catch(e => {
      console.error('OY-check-error:', e.toString());
      let date = new Date();
      fs.writeFileSync(path.join(__dirname, 'log.txt'), `${date.toString()} \n ERR: ${e.toString()}\n`, {
        flag: 'a',
      });
      // 若是crt，则表示是查询当前不合格用户，即/users路由
      if (recordFile === 'crt') {
        callbackFunction({ msg: e.toString(), record: { date, dispel: [] } });
      }
    });
}

const qm = {
  disple: dispel,
  check,
};
module.exports = qm;
