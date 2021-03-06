let  nodemailer = require('nodemailer');
let fs = require('fs');
let path = require('path');
////////////////////////////////////////////////////////////////////////////////

let config = JSON.parse(fs.readFileSync(path.join(__dirname, 'config.json'), 'utf-8'));

let transporter = nodemailer.createTransport({
    service: 'qq',
    auth: config.mail  //QQ邮箱及其授权码,通过QQ获取  
});
let mailOptions = {
    from: '443857611@qq.com', // 发送者  
    to: '822547462@qq.com', // 接受者,可以同时发送多个,以逗号隔开  
    subject: 'Cookie过期提醒', // 标题  
    //text: 'Hello world', // 文本  
    html: `<h3>  
    <a href="http://139.199.189.124:3000/cookie">  
    http://139.199.189.124:3000/cookie</a></h3>`
};

function send() {
    transporter.sendMail(mailOptions, function (err, info) {
        if (err) {
            console.log(err);
            return;
        }
        console.log('发送成功');
    });
}

module.exports = {send: send};