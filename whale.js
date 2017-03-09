var superagent = require('superagent');
var cheerio = require('cheerio');
var async = require('async');
var fs = require('fs');
var path = require('path');
////////////////////////////////////////////////////////////////////////////////
var cookie = null;
check('recordFile');

function check(recordFile, cbfn) {
    cookie = fs.readFileSync(path.join(__dirname, 'cookie.txt'), 'utf-8');

    var flag = 0;
    var ids = [];

    for (var i = 14; i > 0; --i) {
        superagent.get('https://www.shanbay.com/team/thread/8854/1840480/?page=' + i + '#p1')
            .set('Accept', 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8')
            .set('Cookie', cookie)
            .end(function(err, res) {
                console.log(err, res.text);
                // return false;
                var $ = cheerio.load(res.text);
                ++flag;

                // var ids = [];
                $('#djangoForumThreadPosts').find('.post').each((idx, post) => {
                    let teamSrc = $(post).find('.team').find('a').attr('href');
                    // if (teamSrc != '/team/detail/8854/') return; // 跳过不在小组的

                    let user = $(post).find('.userinfo > .span3 > a');
                    let content = $(post).find('.post-content-todo').text();

                    // if (content.search('2017青梅鲸鱼') != -1)
                    if (user.text() != 'KING')
                        ids.push('[' + user.text() + '](https://www.shanbay.com' + user.attr('href') + ')');
                });
                // console.log(JSON.stringify(ids));

                if (flag === 14) {
                    fs.writeFile(path.join(__dirname, recordFile + '-log.txt'), ids.length + '\n' + JSON.stringify(ids) + '\n', { flag: 'a' }, function(err2) {
                        if (err2) console.log('fs writeFile err: ', err2);
                    });
                    console.log('end: whale');
                }
            });
    }
}