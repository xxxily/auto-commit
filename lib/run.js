const path = require('path');
const dayjs = require("dayjs");
require('./Promise.finally');

/*扩展时间对象*/
Date.prototype.Format = function (formatStr) {
  return dayjs().format(formatStr);
};

/*git操作相关变量*/
const simpleGit = require('simple-git/promise');
const git = simpleGit(path.join(__dirname,'../'));

/*日志记录*/
const msgLog = require('./log')
msgLog.setting({
  fileNamePrefix:'auto_commit_log_',
  path:path.resolve(__dirname, '../log/')
});

let main = {
  autoCommit:async function(){
    let curTime = new Date().Format('YYYY-MM-DD HH:mm:ss');
    await git.pull(['-f']);
    await git.add(['./']);
    await git.commit('auto commit: '+curTime);
    msgLog.log('auto commit');
    await git.push('origin','master').catch(function (err) {
      console.log(err);
    });
    msgLog.log('autoCommit succeed')
  },
  init:async function () {
    let t = this;
    t.autoCommit();
    setInterval(function () {
      t.autoCommit();
    }, 1000 * 20);
  }
}
main.init();
