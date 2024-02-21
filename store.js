const { getUuid } = require('./utils.js');

/* 用户名的堆栈 */
const MAX_NUMBER = 5;
const userNamesPool = Array(MAX_NUMBER)
  .fill()
  .map((v, k) => `${getUuid(3)}_${String(MAX_NUMBER - k).padStart(2, '0')}`);

function register() {
  const userName = userNamesPool.pop() ?? '';
  return userName;
}

function deregister(userName) {
  userNamesPool.push(userName);
}

module.exports = {
  register,
  deregister,
};
