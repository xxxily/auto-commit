/**
 * 解决当前版本的nodejs不支持 Promise finally 问题
 * 实现参考：https://thecodebarbarian.com/using-promise-finally-in-node-js.html
 */

Promise.prototype.finally = function(onFinally) {
  return this.then(
    /* onFulfilled */
    res => Promise.resolve(onFinally()).then(() => res),
    /* onRejected */
    err => Promise.resolve(onFinally()).then(() => { throw err; })
  );
};
