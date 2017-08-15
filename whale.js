var superagent = require('superagent');
var cheerio = require('cheerio');
var async = require('async');
var fs = require('fs');
var path = require('path');
////////////////////////////////////////////////////////////////////////////////
var cookie = null;
Array.prototype.unique2 = function() {
    this.sort(); //先排序
    var res = [this[0]];
    for (var i = 1; i < this.length; i++) {
        if (this[i] !== res[res.length - 1]) {
            res.push(this[i]);
        }
    }
    return res;
}

check('whale2');

function check(recordFile, cbfn) {
    cookie = fs.readFileSync(path.join(__dirname, 'cookie.txt'), 'utf-8');

    var flag = 0;
    var ids = [];
    var str = '';

    for (var i = 17; i > 0; --i) {
        superagent.get('https://www.shanbay.com/team/thread/8854/2010079/?page=' + i + '#p1')
            .set('Accept', 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8')
            .set('Cookie', cookie)
            .end(function(err, res) {
                var $ = cheerio.load(res.text);
                ++flag;

                $('#djangoForumThreadPosts').find('.post').each((idx, post) => {
                    let teamSrc = $(post).find('.team').find('a').attr('href') || '';
                    let user = $(post).find('.userinfo > .span3 > a');
                    let content = $(post).find('.post-content-todo').text();

                    if(user.text().match('五月')){
                        console.log(flag, '五月のMay', content)
                    }
                    // if (user.text() != 'KING' && teamSrc == '/team/detail/8854/' && content.search('2017青梅鲸鱼') != -1)
                    //     ids.push('[' + user.text() + '](https://www.shanbay.com' + user.attr('href') + ')');
                });

                if (flag === 17) {
                    // fs.writeFile(path.join(__dirname, recordFile + '-log.txt'), ids.length + '\n' + JSON.stringify(ids.unique2()) + '\n', { flag: 'a' }, function(err2) {
                    //     if (err2) console.log('fs writeFile err: ', err2);
                    // });
                    console.log('end: whale');


                    // ids.forEach(function(e) {
                    //     str += ' 1. '+ e + '\n';
                    // }, this);

                    // fs.writeFile(path.join(__dirname, 'whale2-list.txt'), '\n' + str + '\n', { flag: 'a' }, function(err2) {
                    //     if (err2) console.log('fs writeFile err: ', err2);
                    // });
                }
            });
    }
}