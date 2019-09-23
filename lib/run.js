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

/* 生成指定范围的随机整数 */
function random (min, max) {
  return Math.round(Math.random() * (max - min)) + min
}


let main = {
  /*最大提交次数的上限值*/
  maxCommitCount:2,
  /**
   * 每天限制只自动提交5次，防止过多的无用提交，浪费资源
   * @param num {number} -可选 定义多少次则视为超出上限，默认2次
   * @returns {boolean}
   */
  isLimit:function(num){
    num = num || this.maxCommitCount;
    let dayId = throttler.getDayId();
    if(throttler.isLimit(dayId,num)){
      return true;
    }
    throttler.addRecord(dayId);
    return false;
  },

  /**
   * 变换maxCommitCount，程序每次启动或到了第二天的时候都会变更一次
   */
  changeMaxCommitCount:function(){
    const t = this
    let dayId = throttler.getDayId();
    if(!t._maxCommitCount_ || !t._maxCommitCount_[dayId]) {
      const maxCount = random(1,10)
      t._maxCommitCount_ = {}
      t._maxCommitCount_[dayId] = maxCount
      t.maxCommitCount = maxCount
    }
  },

  /**
   * 获取今天已提交的次数
   * @returns {Promise<number>}
   */
  getTodayCommitCount:async function(){
    let today = new Date().Format('YYYY-MM-DD'),
      commitCount = 0,
      gitLog = await git.log([-50]).catch(function () {
        commitCount = -1;
      });

    gitLog && gitLog.all && gitLog.all.forEach(function (log) {
      let commitTime = log.date.split(' ')[0];
      if( today === commitTime ){
        commitCount+=1;
      }
    });

    return commitCount;
  },
  /*更新代码*/
  update:async function(){
    return await git.pull(['-f']).catch(function (err) {
      msgLog.error('获取更新失败~');
      msgLog.error(err);
    });
  },
  autoCommit:async function(){
    let t = this,
      todayCommitCount = await t.getTodayCommitCount();

    t.changeMaxCommitCount()

    if(t.isLimit() || todayCommitCount > 15){
      msgLog.showLog('自动提交的次数已达到上限，明天再提交吧~');
      t.loopAutoCommit(1000*60*10);
      return false;
    }

    let curTime = new Date().Format('YYYY-MM-DD HH:mm:ss');
    await t.update();
    await git.add(['./']);
    await git.commit('auto commit: '+curTime);
    msgLog.log('auto commit');
    msgLog.log('maxCommitCount：' + t.maxCommitCount);
    await git.push('origin','master');
    msgLog.log('auto commit succeed');
    msgLog.showLog('准备进行下一轮操作~');
    t.loopAutoCommit(1000 * 120);
  },
  /**
   * 循环执行自动提交操作
   * @param delayed {number} -可选 多久后执行下一轮操作，默认60s
   */
  loopAutoCommit:function(delayed){
    delayed = delayed || 1000 * 60;
    setTimeout(function () {
      main.autoCommit();
    }, delayed);
  },
  init:async function () {
    let t = this;

    /*程序运行即刻更新一波*/
    await t.update();

    /*执行自动提交逻辑*/
    t.autoCommit();
  }
}
main.init();

