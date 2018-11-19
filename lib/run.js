const path = require('path');
const dayjs = require("dayjs");
const throttler = require("./throttler");
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

    /*每天限制只自动提交10次，阻止过多的无用提交，浪费资源*/
    let dayId = throttler.getDayId();
    throttler.addRecord(dayId);
    if(throttler.isLimit(dayId,10)){
      console.log('自动提交的次数已达到上限，明天再提交吧~');
      return false;
    }

    let curTime = new Date().Format('YYYY-MM-DD HH:mm:ss');
    await git.pull(['-f']);
    await git.add(['./']);
    await git.commit('auto commit: '+curTime);
    msgLog.log('auto commit');
    await git.push('origin','master');
    msgLog.log('auto commit succeed')

    console.log('准备进行下一轮操作~');
    setTimeout(function () {
      main.autoCommit();
    }, 1000 * 20);
  },
  init:async function () {
    let t = this;
    t.autoCommit();
  }
}
main.init();
