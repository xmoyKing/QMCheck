# QMCheck

扇贝青梅小组自动查卡程序，基于nodejs + express + jade，采用PM2自动部署。

步骤：
1. 安装git/node
1. 克隆项目：`git clone git@github.com:xmoyKing/QMCheck.git` 
1. 全局安装pm2：`sudo npm install pm2 -g`
1. 在项目主目录下安装依赖：`cd QMCheck && npm install` 
1. 修改配置文件`config.tmpl.json`：`user`下的`username`和`password`
1. 重命名`config.tmpl.json`为`config.json`
1. 用pm2部署项目并重命名为QMCheck：`pm2 start ./bin/www --name QMCheck`