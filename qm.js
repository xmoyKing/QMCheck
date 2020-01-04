let superagent = require('superagent');
let cheerio = require('cheerio'); // nodejs中的jquery
let fs = require('fs');
let path = require('path');
let events = require("events");
// let mongoose = require('mongoose');
// let Record = require('./db');
////////////////////////////////////////////////////////////////////////////////
let config = JSON.parse(fs.readFileSync(path.join(__dirname, 'config.json'), 'utf-8'));

function dispel(ids, cookie) {  //踢除
    cookie = cookie || config.cookie;
    let data = {
        ids: ids.join(),
        action: 'dispel'
    };

    superagent.put('https://www.shanbay.com/api/v1/team/member/')
    .set('Accept', '*/*')
    .set('Host', 'www.shanbay.com')
    .set('Referer', 'https://www.shanbay.com/team/manage/')
    .set('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/56.0.2924.87 Safari/537.36')
    .set('Connection', 'keep-alive')
    .set('Cache-Control', 'no-cache')
    .set('X-Requested-With', 'XMLHttpRequest')
    .set('Cookie', cookie)
    .send(data)
    .end(function(err2, res2) {
        let oRes = JSON.parse(res2.text);
        console.log(oRes);
        if (oRes.msg !== 'SUCCESS') {
            fs.writeFile(path.join(__dirname, 'log.txt'), Date() + '\n' + res2.text + '\n', { flag: 'a' }, function(err2) {
                if (err2) console.log('fs writeFile err: ', err2);
            });
        }
    });
}

function check(recordFile, cbfn) {
    let date = Date();
    let cookie =  config.cookie;
    let record = { 'date': date, 'dispel': [] };
    let ids = [];

    console.log('begin : ' + date);

    getTeamManage(3);

    // 遍历管理页面
    function getIds(res) {
        let $ = cheerio.load(res.text); // res是请求对的响应，text是html文本

        for (let j = 0; j < 15; ++j) {
            let member = $($(res.text).find('#members .member')[j]);
            let days = Number(member.find('.days').text());
            let rate = parseFloat(member.find('.rate span').text());
            let check0 = $(member.find('.checked span')[0]).text().trim();
            let check1 = $(member.find('.checked span')[1]).text().trim();
            let name = member.attr('data-name');
            let dataid = member.attr('data-id');
            let role = Number(member.attr('role'));
            //若没有找到相应的dataid则表示没能正常登录,此时直接返回
            if (dataid == '' || dataid == undefined || dataid == null) return;

            if (rate >= 97) { //打卡率大于97则表示当前页都合格
                return;
            } else if (check1 === '已打卡' && check0 === '已打卡') {
                continue;
            } else if (days >= 30 && check0 === '已打卡') {
                continue;
            } else if (rate >= 96 && check1 === '已打卡') {
                continue;
            } else if (role === 1 || role === 3) { //3为小助手，2为组员
                continue;
            } else { //若打卡率低于97%,且组龄小与30天
                ids.push(dataid); //将id计入ids

                let allInfo = {};
                allInfo['avatar'] = $(member.find('img')).attr('src'); //用户头像
                allInfo['dataid'] = dataid;
                allInfo['name'] = name; //用户昵称
                allInfo['link'] = member.find('.nickname').attr('href'); //用户首页
                allInfo['points'] = Number(member.find('.points').text()); //用户积分
                allInfo['days'] = days; //用户组龄
                allInfo['rate'] = rate; //用户打卡率
                allInfo['check0'] = check0; //前一天是否打卡
                allInfo['check1'] = check1; //当日是否打卡

                record.dispel.push(allInfo);
            }
        }
    }

    // 写入记录 / 踢人回调函数
    function wtFileAndDispel() {
        let rst = { ids: ids, record: record };
        fs.writeFile(path.join(__dirname, recordFile + '-log.txt'), '\n' + JSON.stringify(rst) + '\n', { flag: 'a' }, function(err2) {
            if (err2) console.log('fs writeFile err: ', err2);
        });
        fs.writeFile(path.join(__dirname, recordFile + '.json'), JSON.stringify(rst), function(err2) {
            if (err2) console.log('fs writeFile err: ', err2);

            cbfn && cbfn(rst, cookie); //执行回掉函数
        });
        console.log('end: check');
    }

    // 进入管理页面,page为第几页
    function getTeamManage(page) {
        superagent.get('https://www.shanbay.com/team/manage/?page=' + page + '#p1')
        .set('Accept', 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8')
        .set('Host', 'www.shanbay.com')
        .set('Referer', 'https://www.shanbay.com/team/manage/')
        .set('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/56.0.2924.87 Safari/537.36')
        .set('Connection', 'keep-alive')
        .set('Cache-Control', 'no-cache')
        .set('X-Requested-With', 'XMLHttpRequest')
        .set('Cookie', cookie)
        .end(function(err, res) {
            if (err || res.status !== 200) { 
                console.log(err, res);
                let errlog = `err-log-${date.getTime()}.js`;
                record.dispel.push({ days: errlog }); // 将错误日志反馈到页面上，写在组龄单元格内
                wtFileAndDispel(); // 直接执行回掉函数，然后将错误日志写入到文件内
                fs.writeFileSync(path.join(__dirname, errlog), 'ERR: \n' + JSON.stringify(err) + '\n' + 'RES: \n' + JSON.stringify(res) );
                return false; 
            }

            if( res.req.path.indexOf('/account/login') > 0 ){
                console.log('Need Login');
                // console.log(JSON.stringify(res));
                // console.log(JSON.stringify(res.header));
                
                // 获取登录页面csrftoken
                let csrfs = res.header['set-cookie'].map(el => el.startsWith('csrftoken=')&&el);
                let lastCsrf = csrfs[csrfs.length - 1]; // 结果形如："csrftoken=jyDh61ZqIPOormwSSGseueR80E3p8XOS; Max-Age=31536000; Domain=.shanbay.com; Path=/; Expires=Tue, 22 Sep 2020 13:48:15 GMT"
                let csrftoken = lastCsrf.split(';')[0].replace('csrftoken=','')

                // 同步登录，
                login(csrftoken);
                cookie = JSON.parse(fs.readFileSync(path.join(__dirname, 'config.json'), 'utf-8')).cookie;
                getTeamManage(page);
            }else{
                getIds(res);
                page == 1 ? wtFileAndDispel() : getTeamManage(--page);
            }
        });
    }
}

function login(csrftoken){
    let user = config.user;
    superagent.post('https://apiv3.shanbay.com/bayuser/login')
        .set('Referer', 'https://web.shanbay.com/web/account/login')
        .set('Origin', 'https://web.shanbay.com')
        .set('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/56.0.2924.87 Safari/537.36')
        .set('Sec-Fetch-Mode', 'cors')
        .set('Content-Type', 'application/json')
        .set('X-CSRFToken', csrftoken)
        .send(user)
        .end((err, res)=>{
            setCookie(res); // 设置cookie并发送事件
        })
    

    function setCookie(res) {
        console.log(res);

        let cookie = '';
        res.header["set-cookie"].forEach((e, i)=>{
            let csrftoken = e.indexOf('csrftoken=');
            let auth_token = e.indexOf('auth_token=');
            let sessionid = e.indexOf('sessionid=');
            let start = null;
            let end = e.indexOf(';')+1;
        
            if( csrftoken >= 0 ){
                start = csrftoken;
            }else if( auth_token >= 0){
                start = auth_token;
            }else if( sessionid >= 0){
                start = sessionid;
            }
    
            if(start != null){
                cookie += e.substring(start, end) + ' ';
            }
        });

        config.cookie = cookie;

        fs.writeFileSync(path.join(__dirname, 'config.json'), JSON.stringify(config) );
    }
}

let qm = {
    disple: dispel,
    check: check
}
module.exports = qm;