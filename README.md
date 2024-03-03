# 简易的聊天应用

## 做这个应用的目的

- 了解 WebSocket

## 应用的功能

- 群聊
- 当前在线用户列表

## 学到的东西

> 涉及 WebSocket 本身的代码是很简单的，就是服务客户两端相互监听 message

- 客户端发起升级，服务端接受升级，建立 WebSocket；客户端和服务端都可以主动关闭 WebSocket
- 通过 WebSocket 把服务端的变更推送给客户端

> 没有用 express 框架，手写服务端路由，进一步了解了 node 的 http、net 这些模块

- net 的 socket 和 file 文件流是一样的，都是 stream
- ip 是网络层，tcp（或 udp） 是通信层，http 是应用层，WebSocket 和 tls（https） 是 http 之上的应用
- 单片机如 arduino 的通信就是在 tcp 层传字符，http 是在传的字符之上再建立一个应用协议
- 而 net.Socket 就是用 stream 替你处理 tcp 传字符，arduino 也有内置的 stream 库
- 所有都是 event 和 stream

> 只是个示例就没用构建工具，用 vue 把界面写到 html 里

- 文件夹的结构很难管理，所以我把文件全部放在了根目录里
- 没有客户端单页的局部渲染，所以在页（路由、html）与页之间传数据就很棘手，不同的页之间可以
  - 通过 sessionStorage 传数据
    - 一个 host 下的所有页都是共享 sessionStorage 的
  - 通过 cookie 传数据
    - 先把一个页的数据给服务端，服务端保存并且发 cookie，另一个页通过 cookie 要数据，数据插值进 html
  - *不能*通过 window 全局对象传数据
    - 一个 host 下的不同页*不共享* window 全局对象
- onBeforeUnmount 似乎用不起来 [reason](https://vuejs.org/api/composition-api-lifecycle.html#onbeforeunmount)，用 beforeunload

> 了解多页应用 mpa 的一般模式

- 服务端设置 cookie，加载目标页面，根据 cookie 通过 window 变量把数据插值进 html 字符串，实现客户端页面更新

## 文件结构

- index.js —— 程序入口
- route.js —— 服务端路由
- utils.js —— 一些工具函数
- store.js —— 用户数据，登录登出逻辑
- home.html —— 首页
- register.html —— 登录页
- Home.js、Register.js、DialogP.js —— 用 vue 写的 ui 组件

---

> [http://hueyond.run](http://hueyond.run)
