/*!
 * @name      log.js
i * @version   1.0.2
 * @author    Blaze
 * @date      2018/5/14 11:43
 * @github    https://github.com/xxxily
 */

const fs = require("fs-extra");
const path = require('path');
const dayjs = require("dayjs");

/*扩展时间对象*/
Date.prototype.Format = function (formatStr) {
  return dayjs().format(formatStr);
};

const setting = {
  /*保存的文件地址*/
  path: path.join(process.cwd(), '/log/'),
  /*保存文件后缀格式*/
  ext: '.log',
  /*保存的文件名统一加前缀，默认不加*/
  fileNamePrefix: '',
  /*保存的文件名的日期格式*/
  fileNameDateFormat: 'YYYY-MM-DD',
  /*日志输出的日期格式*/
  outputDateFormat: 'HH:mm:ss',
  /*换行方式*/
  EOL: '\r\n'
}

const logSystem = {
  /**
   * 相关设置项 可设置的选项请参考上面的 setting 对象
   * @param obj
   */
  setting: function (obj) {
    for (var key in obj) {
      if (typeof setting[key] !== 'undefined') {
        setting[key] = obj[key];
      }
    }
  },
  msgFormat: function (msg, type) {
    let t = this,
      baseMsg = msg.toString().trim(),
      formatStr = setting.outputDateFormat,
      msgType = 'info';
    switch (type) {
      case -1 :
        msgType = 'error';
        break;
      case 1  :
      case 2  :
      case 3  :
      case 4  :
      case 5  :
        msgType = 'info level ' + type;
        break;
      default :
        msgType = 'info';
        break;
    }
    if (type) {
      return '[' + new Date().Format(formatStr) + ']' + '[' + msgType + '] ' + baseMsg;
    } else {
      return '[' + new Date().Format(formatStr) + '] ' + baseMsg;
    }
  },
  _cache_:[],
  /*获取日志将记录到哪个路径下*/
  getLogFilePath:function(){
    let logDirPath = setting.path,
      logFileName = setting.fileNamePrefix + new Date().Format(setting.fileNameDateFormat) + setting.ext,
      logFilePath = path.join(path.normalize(logDirPath),logFileName);
    return logFilePath;
  },
  /**
   * 将信息存储到文件，不进行任何格式处理
   * @param logMsg {string} -必选 要存储的日志信息
   */
  saveLog:function(logMsg){
    let t = this,
      logDirPath = setting.path,
      logFilePath = t.getLogFilePath(),
      logStr = logMsg.toString() + setting.EOL;

    t._cache_.push(logStr);

    /*确保目录存在*/
    fs.mkdirsSync(logDirPath);

    function writeLog(fd,callback) {
      let curLen = t._cache_.length;
      fs.write(fd, t._cache_.join(''), 'utf-8', function (err, written, string) {
        callback && callback(err, written, string);
        if (err) {
          console.error(t.msgFormat('日志写入失败，请检查是否有权限或存储空间是否充足~', -1));
          return false;
        }

        /*写入成功后移除已写入的缓存*/
        t._cache_.splice(0,curLen);
      });
    }

    function gotoWrite() {
      if (t.__fd__ && t.__curFdPath__ === logFilePath) {
        writeLog(t.__fd__);
      } else {
        fs.open(logFilePath, 'a+', function (err, fd) {
          if (err) {
            console.error(t.msgFormat('打开文件失败，请检查您是否有权限~', -1));
            return false;
          }
          t.__fd__ = fd;
          t.__curFdPath__ = logDirPath;
          writeLog(t.__fd__);
        });
      }
    }

    /*先进行缓存，延迟1s再写入*/
    clearTimeout(t._saveTimer_);
    t._saveTimer_ = setTimeout(function () {
      gotoWrite();
    }, 1000 * 1);
  },
  /*插入默认分割线*/
  splitLine:function(){
    let t = this,
      splitLine = '+'+'------------+'.repeat(6);
    splitLine = '\n'+splitLine+'\n';
    t.saveLog(splitLine);
  },
  /**
   * 运行日志记录
   * @param msg {string} -必选 要记录的日志信息
   * @param type {number} -可选 日志类型 -1 表示错误类型，0 表示正常的信息记录，1-10 表示信息类型的重要级别，越往后，越重要
   * @param logType {number} -可选 日志的记录方式，默认输出到控制台并保存到日志文件， -1 表示只输出到控制台，-2 表示只保存到日志文件，并不输出到控制台
   */
  log: function (msg, type, logType) {
    let t = this,
      logStr = t.msgFormat(msg, type);

    /*将日志信息输出到控制台*/
    if (logType !== -2) {
      if (type === -1) {
        console.error(logStr);
      } else {
        console.log(logStr);
      }
    }

    /*将日志存储到文件*/
    if (logType !== -1) {
      t.saveLog(logStr);
    }
  },
  /**
   * 只显示输出，不保存到日志文件
   * @param msg {string} -必选 要记录的日志信息
   */
  showLog:function(msg){
    let t = this;
    t.log(msg,0,-1);
  },
  error: function (msg) {
    var t = this;
    t.log(msg, -1);
  },
  /**
   * 只显示输出，不保存到日志文件
   * @param msg {string} -必选 要记录的日志信息
   */
  showError:function(msg){
    let t = this;
    t.log(msg,-1,-1);
  }
}

module.exports = logSystem;

