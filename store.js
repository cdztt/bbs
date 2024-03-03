const { getUuid } = require('./utils.js');

class UserNames {
  constructor() {
    // 最大人数
    this.MAX_NUMBER = 20;
    this.userNamesPool = Array(this.MAX_NUMBER)
      .fill()
      .map(
        (v, k) =>
          `${getUuid(3)}_${String(this.MAX_NUMBER - k).padStart(2, '0')}`
      );
    this.onlineUsers = [];
    this.nickNameMap = new Map();
  }

  _setNickName(userName, nickName) {
    this.nickNameMap.set(userName, nickName);
  }

  _getNickName(userName) {
    return this.nickNameMap.get(userName);
  }

  _addOnlineUser(userName) {
    if (!this.onlineUsers.includes(userName)) {
      this.onlineUsers.push(userName);
    }
  }

  removeOnlineUser(userName) {
    this.onlineUsers = this.onlineUsers.filter((name) => name !== userName);
  }

  _borrowUserName(userName, nickName) {
    let ok = true;
    let errMsg = '';

    if (userName === '') {
      // 不带cookie
      if (nickName === undefined) {
        // 错误情况1：不带nickname，这是第一次加载，还没有注册
        ok = false;
        errMsg += '没有注册';
      } else {
        // 带nickname来注册
        userName = this.userNamesPool.pop() ?? '';
        if (userName === '') {
          // 错误情况2：人数已满
          ok = false;
          errMsg += '人数已满';
        }
      }
    }

    return { ok, errMsg, userName };
  }

  returnUserName(userName) {
    this.userNamesPool.push(userName);
  }

  register(userName, nickName) {
    const result = this._borrowUserName(userName, nickName);
    const ok = result.ok;
    userName = result.userName;

    if (ok) {
      if (nickName === undefined) {
        // 登录
        nickName = this._getNickName(userName);
        this._addOnlineUser(userName);
      } else {
        // 注册
        if (nickName === '') {
          nickName = userName;
        }
        this._setNickName(userName, nickName);
      }
    } else {
      nickName = undefined;
    }

    return { ...result, nickName };
  }

  getOnlineUsersUsingNickName() {
    return this.onlineUsers.map((userName) => this._getNickName(userName));
  }
}

const userNames = new UserNames();

module.exports.userNames = userNames;
