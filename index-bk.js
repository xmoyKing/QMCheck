var superagent = require('superagent');
var cheerio = require('cheerio');
var async = require('async');
var fs = require('fs');
var path = require('path');
var jsdom = require('jsdom');
var $ = require('jquery')(jsdom.jsdom().defaultView);
var schedule = require('node-schedule');
////////////////////////////////////////////////////////////////////////////////
var cookie = null;
check(); //当前cookie日期为：2017.1.25
// var data = { //发消息，content为消息内容，due_at为消息有效期,id会变动
//     ids: ids.join(),
//     action: 'notify',
//     due_at: '2017-01-07',
//     content: ''
// };
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

function check() {
    console.log('begin : ' + Date());
    fs.writeFile(path.join(__dirname, 'log.txt'), '\n' + Date() + '\n', { flag: 'a' }, function(err2) {
        if (err2) console.log('fs writeFile err: ', err2);
    });
    cookie = null;
    cookie = fs.readFileSync(path.join(__dirname, 'cookie.txt'), 'utf-8');
    if (cookie === null) return false;

    for (var i = 5; i > 0; --i) {
        superagent.get('https://www.shanbay.com/team/manage/?page=' + i + '#p1')
            .set('Accept', 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8')
            .set('Cookie', cookie)
            .end(function(err, res) {
                //console.log(res.text); //正常返回html

                var ids = [],
                    allInfo = [];
                for (var j = 0; j < 15; ++j) {
                    var member = $($(res.text).find('#members .member')[j]);
                    var days = Number(member.find('.days').text());
                    var rate = parseInt(member.find('.rate span').text());
                    var check0 = $.trim($(member.find('.checked span')[0]).text());
                    var check1 = $.trim($(member.find('.checked span')[1]).text());
                    var name = member.attr('data-name');

                    //if(name == '') continue;

                    if (rate >= 97) {
                        continue;
                    } else if (days >= 30 && check0 == '已打卡') {
                        continue;
                        //} else if (rate >= 96 && check1 == '已打卡') {
                        continue;
                    } else if (days >= 700) { //组龄大于700天，
                        continue;
                    } else { //若打卡率低于97%,且组龄小与30天
                        ids.push(member.attr('data-id')); //将id计入ids

                        allInfo.push(name) //用户昵称
                        ;
                        allInfo.push(member.find('.nickname').attr('href')) //用户首页
                        ;
                        allInfo.push(member.find('.points').text()) //用户积分
                        ;
                        allInfo.push(days) //用户组龄
                        ;
                        allInfo.push(rate) //用户打卡率
                        ;
                        allInfo.push(check0) //前一天是否打卡
                        ;
                        allInfo.push(check1 + '\n') //当日是否打卡
                        ;
                    }
                }
                //console.log(allInfo.join());
                if (ids.length > 0) { //若没有要踢的人则跳过此页 写入内容为 ids + 响应体 + 写入时间 flag:'a'表示追加内容
                    fs.writeFile(path.join(__dirname, 'log.txt'), allInfo.join(), { flag: 'a' }, function(err2) {
                        if (err2) console.log('fs writeFile err: ', err2);
                    });
                    dispel(ids); //执行踢人ajax
                }
            })
    }
}
//////////////////////////////////////////////////////

var rule = new schedule.RecurrenceRule();
rule.hour = 23; //每天23点
rule.minute = 55; //55分
var j = schedule.scheduleJob(rule, function() {
    check(); // 执行check
});