# 简易的聊天应用

## 做这个应用的目的

- 了解 WebSocket

## 应用的功能

- 群聊
- 可以起名字

## 学到的东西

> 涉及 WebSocket 本身的代码是很简单的，就是服务客户两端相互监听 message

- 客户端发起升级，服务端接受升级，建立 WebSocket；客户端和服务端都可以主动关闭 WebSocket

> 没有用 express 框架，手写服务端路由，进一步了解了 node 的 http、net 这些模块

- net 的 socket 和 file 文件流是一样的，都是 stream
- ip 是网络层，tcp（或 udp） 是通信层，http 是应用层，WebSocket 和 tls（https） 是 http 之上的应用
- 单片机如 arduino 的通信就是在 tcp 层传字符，http 是在传的字符之上再建立一个应用协议
- 而 net.Socket 就是用 stream 替你处理 tcp 传字符，arduino 也有内置的 stream 库
- 所有都/只是 event 和 stream

> 没有用构建工具，但还是用了 vue，因为不会操作 dom

- 文件夹的结构很难管理，所以我把文件全部放在了根目录里
- 没有客户端单页的局部渲染，所以在页（路由、html）与页之间传数据就很棘手，不同的页之间可以
  - 通过 sessionStorage 传数据
    - 一个 host 下的所有页都是共享 sessionStorage 的
  - 通过 cookie 传数据
    - 先把一个页的数据给服务端，服务端保存并且发 cookie，另一个页通过这个 cookie 要数据
  - *不能*通过 window 全局对象传数据
    - 一个 host 下的不同页*不共享* window 全局对象
- onBeforeUnmount 似乎用不起来？
- 这种应用写 1 个就知道了 express 和 vue 的意义，写 10 个就可以自己写框架了

> 传统后端语言大概就是这样写网页的？用字符串写 html，把数据插值进 html 里

- nextjs 推出了 server action，在组件里提交表单不需要用 js 去 fetch 后端 api，直接去操作数据库？

- PS 既然会了 WebSocket，就想做一个简单的在线下中国象棋的应用，毕竟 MDN 的文档上也讲了 WebSocket 的两个常见应用就是 chat 和 game，但是棋盘怎么画？css 真的比 js 更难……
