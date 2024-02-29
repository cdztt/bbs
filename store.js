const { getUuid } = require('./utils.js');

class UserNames {
  constructor() {
    this.MAX_NUMBER = 20;
    this.userNamesPool = Array(this.MAX_NUMBER)
      .fill()
      .map(
        (v, k) =>
          `${getUuid(3)}_${String(this.MAX_NUMBER - k).padStart(2, '0')}`
      );
  }

  register() {
    const userName = this.userNamesPool.pop() ?? '';
    return userName;
  }

  deregister(userName) {
    this.userNamesPool.push(userName);
  }
}

const userNames = new UserNames();

module.exports.userNames = userNames;
