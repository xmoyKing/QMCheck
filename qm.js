var superagent = require('superagent');
var cheerio = require('cheerio');
var async = require('async');
var fs = require('fs');
var path = require('path');
////////////////////////////////////////////////////////////////////////////////
var cookie = null;
//check(); //当前cookie日期为：2.5; 2017.1.25

function dispel(ids) {
    var data = { //踢除
        ids: ids.join(),
        action: 'dispel'
    };

    superagent.put('https://www.shanbay.com/api/v1/team/member/')
        .set('Accept', '*/*')
        .set('Cookie', cookie)
        .send(data)
        .end(function(err2, res2) {
            var oRes = JSON.parse(res2.text);
            if (oRes.msg !== 'SUCCESS') {
                fs.writeFile(path.join(__dirname, 'log.txt'), '\n' + res2.text + '\n', { flag: 'a' }, function(err2) {
                    if (err2) console.log('fs writeFile err: ', err2);
                });
            }
        });
}

function check(recordFile, cbfn) {
    var date = Date();
    console.log('begin : ' + date);
    cookie = fs.readFileSync(path.join(__dirname, 'cookie.txt'), 'utf-8');
    //if (cookie === null) return false;

    var record = { 'date': date, 'dispel': [] };
    var flag = 0;
    var ids = [];

    for (var i = 5; i > 0; --i) {
        superagent.get('https://www.shanbay.com/team/manage/?page=' + i + '#p1')
            .set('Accept', 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8')
            .set('Cookie', cookie)
            .end(function(err, res) {
                //console.log(err, res.text); return false;
                var $ = cheerio.load(res.text);
                ++flag;
                for (var j = 0; j < 15; ++j) {
                    var member = $($(res.text).find('#members .member')[j]);
                    var days = Number(member.find('.days').text());
                    var rate = parseFloat(member.find('.rate span').text());
                    var check0 = $(member.find('.checked span')[0]).text().trim();
                    var check1 = $(member.find('.checked span')[1]).text().trim();
                    var name = member.attr('data-name');
                    var dataid = member.attr('data-id');
                    var role = Number(member.attr('role'));
                    //if(dateid === '') continue;

                    if (rate >= 97) { //打卡率大于97则表示当前页的
                        continue;
                    } else if (check1 === '已打卡' && check0 === '已打卡') {
                        continue;
                    } else if (days >= 30 && check0 === '已打卡') {
                        continue;
                    } else if (rate >= 96 && check1 === '已打卡') {
                        continue;
                    } else if (role === 3) { //3为小助手，2为组员
                        continue;
                    } else { //若打卡率低于97%,且组龄小与30天
                        ids.push(dataid); //将id计入ids

                        var allInfo = {};
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

                if (flag === 4) {
                    var rst = { ids: ids, record: record };
                    fs.writeFile(path.join(__dirname, 'log.txt'), '\n' + JSON.stringify(rst) + '\n', { flag: 'a' }, function(err2) {
                        if (err2) console.log('fs writeFile err: ', err2);
                    });
                    fs.writeFile(path.join(__dirname, recordFile + '.json'), JSON.stringify(rst), function(err2) {
                        if (err2) console.log('fs writeFile err: ', err2);
                        if (cbfn) cbfn(rst); //执行回掉函数
                    });
                    console.log('end: check');
                }
            });
    }
}

var qm = {
    disple: dispel,
    check: check
}
module.exports = qm;