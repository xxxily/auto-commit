/*!
 * @name      throttler.js
 * @version   0.1.2
 * @author    Blaze
 * @date      2018/11/19 9:25
 * @github    https://github.com/xxxily
 */

/**
 * 节流控制系统
 * 通过该系统判断某次操作是否太快或者是否已经超限了
 */
let throttler = {
  /**
   * 判断当前操作是否太频繁了
   * @param id {string|number} -必选，节流器id
   * @param interval {number} -可选 定义间隔为长则判断为太频繁，默认1s
   * @returns {boolean}
   */
  isTooFast:function(id,interval){
    var t = this,
      recordr = t.getThrottler(id);

    if(recordr){
      let intervalTime = interval || 1000 * 1;
      return new Date().getTime() - recordr.lastTime < intervalTime;
    }else {
      return false;
    }

  },
  /**
   * 判断当前是否超限了
   * @param id {string|number} -必选，节流器id
   * @param limit {number} -可选 定义达到了多少次为超限，默认100次
   */
  isLimit:function(id,limit){
    var t = this,
      recordr = t.getThrottler(id);
    return recordr.count > (limit || 100);
  },
  /*节流器数据存储对象*/
  _throttler_:{},
  /**
   * 根据id添加一个节流记录，如果没有节流记录则创建一条初始记录
   * @param id {string|number} -必选，节流器id
   * @returns {*}
   */
  setThrottler:function(id){
    var t = this;
    if(!t._throttler_[id]){
      return t._throttler_[id] = {
        lastTime:0,
        count:0,
        id:id
      };
    }
    let count = t._throttler_[id].count+1;
    t._throttler_[id] = {
      lastTime:new Date().getTime(),
      count:count,
      id:id
    }
    return t._throttler_[id];
  },
  /**
   * 根据id获取所有记录
   * @param id {string|number} -必选，节流器id
   * @returns {*}
   */
  getThrottler:function(id){
    var t = this;
    if(!t._throttler_[id]){
      t.setThrottler(id);
    }
    return t._throttler_[id];
  },
  /**
   * 添加一条节流记录，如果不存在则会先创建一条初始记录，再添加一条当前记录
   * @param id {string|number} -必选，节流器id
   */
  addRecord:function(id){
    let t = this;
    if(!t._throttler_[id]){
      t.setThrottler(id);
    }
    t.setThrottler(id);
  },
  /**
   * 重置某个节流器id下面的节流记录数据
   * @param id {string|number} -必选，节流器id
   */
  resetRecordr:function(id){
    this._throttler_[id] = {
      lastTime:0,
      count:0,
      id:id
    };
  },
  /*获取一个以当前日期作为id的id号，可作为当天超限记录的id*/
  getDayId:function(){
    let d = new Date();
    return 'cur_day_id_'+d.getFullYear()+(d.getMonth()+1)+d.getDate();
  }
};
module.exports = throttler;
