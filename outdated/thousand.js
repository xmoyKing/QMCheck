var superagent = require("superagent");
var cheerio = require("cheerio");
var async = require("async");
var fs = require("fs");
var path = require("path");
////////////////////////////////////////////////////////////////////////////////

check("points-active-v3-replys.js");

function check(recordFile) {
  var ids = [];
  var str = "";
  var page = 5;
  var joinUsers = {};

  getContennt(1);

  function trimContent(content) {
    return content.trim().replace(/\s/g, '').replace('回复KING:!#一千分の约定#2019第2季version.20190607!...', '')
  }

  function getContennt(i) {
    if (i > page) {
      fs.writeFile(
        path.join(__dirname, recordFile),
        "\nvar js = " + JSON.stringify(joinUsers) + "\n",
        { flag: "a" },
        function(err2) {
          if (err2) console.log("fs writeFile err: ", err2);
        }
      );
      console.log("end: thousand");
      return;
    }
    superagent
      .get("https://www.shanbay.com/team/thread/8854/3158322/?page=" + i)
      .set(
        "Accept",
        "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8"
      )
      // .set('Cookie', cookie)
      .end(function(err, res) {
        var $ = cheerio.load(res.text);

        $("#djangoForumThreadPosts")
          .find(".post")
          .each((idx, post) => {
            let teamSrc =
              $(post)
                .find(".team")
                .find("a")
                .attr("href") || "";
            let user = $(post).find(".userinfo > .span3 > a");
            let username = user.text();
            let userSrc = $(post)
              .find(".userinfo > .span3 > a")
              .attr("href");
            let content = $(post)
              .find(".post-content-todo")
              .text();
            let postId = $(post).attr("id");

            // 还在小组中
            if(teamSrc == "/team/detail/8854/"){
              if(!joinUsers[username]){
                joinUsers[username] = {};
              }
              joinUsers[username][postId] = trimContent(content);
            }

            // if (joinUsers[username]) {
            //   joinUsers[username][postId] = trimContent(content);
            // } else if (
            //   teamSrc == "/team/detail/8854/" &&
            //   content.search("2019青梅千分") != -1
            // ) {
            //   joinUsers[username] = { start: trimContent(content) };
            // }
          });

        getContennt(i + 1);
      });
  }
}
