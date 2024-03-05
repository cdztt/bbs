const { env } = require('node:process');
const path = require('node:path');
const { readFile } = require('node:fs/promises');
const { parseCookie, parseBodyToStr } = require('./utils.js');
const { userNames } = require('./store.js');

/* 渲染html */
async function render(url, res, payload) {
  let html = await readFile(path.join(__dirname, url + '.html'), {
    encoding: 'utf8',
  });

  if (env.NODE_ENV === 'prod') {
    html = html.replace('vue.esm-browser.js', 'vue.esm-browser.prod.js');
  }

  // 把服务端变量传给客户端
  if (payload) {
    const injectedScript = `
<script>
  window.env='${payload['window.env']}'
  window.protocol='${payload['window.protocol']}'
  window.userName='${payload['window.userName']}'
  window.nickName='${payload['window.nickName']}'
</script>
`;
    html = html.replace('</body>', `${injectedScript}</body>`);
  }

  res.writeHead(200, {
    'Content-Type': 'text/html; charset=utf-8',
  });
  res.end(html);
}

/* 路由 */
async function onRequest(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');

  let {
    url,
    headers: { cookie, host },
  } = req;
  const initUserName = cookie ? parseCookie(cookie).userName : '';

  if (['localhost', 'hueyond.run'].includes(host) && /.js$/.test(url)) {
    // 浏览器自动请求js文件的时候
    const js = await readFile(path.join(__dirname, url), { encoding: 'utf8' });
    res.writeHead(200, { 'Content-Type': 'text/javascript; charset=utf-8' });
    res.end(js);
  } else if (['/'].includes(url)) {
    const { userName, nickName } = userNames.register(initUserName);
    const payload = {
      ['window.env']: env.NODE_ENV,
      ['window.protocol']: env.NODE_PROTOCOL,
      ['window.userName']: userName,
      ['window.nickName']: nickName,
    };
    render('/home', res, payload);
  } else if (['/register'].includes(url)) {
    if (initUserName === '') {
      render(url, res);
    } else {
      // 登录之后绝不能再进入login页面，手动在地址栏写入网址也不行
      res.writeHead(307, { Location: '/' });
      res.end();
    }
  } else if (['/api/register'].includes(url)) {
    // 登录页的"确定"按钮调用此
    parseBodyToStr(req).then((input) => {
      const { ok, errMsg, userName, nickName } = userNames.register(
        initUserName,
        input
      );
      res.setHeader('Set-Cookie', [
        `userName=${userName}; HttpOnly; Path=/; SameSite=Strict`,
      ]);
      res.writeHead(200, {
        'Content-Type': 'text/plain; charset=utf-8',
      });
      res.end(
        ok
          ? `登录成功, 你的名字: ${nickName}${
              nickName === userName ? ' (自动生成) ' : ''
            }`
          : `失败 (${errMsg})`
      );
    });
  } else if (['/api/offline'].includes(url)) {
    userNames.removeOnlineUser(initUserName);
    res.writeHead(200);
    res.end();
  } else if (['/api/logout'].includes(url)) {
    // 主页的"退出"按钮调用此
    userNames.removeOnlineUser(initUserName);
    userNames.returnUserName(initUserName);
    const userName = '';
    res.setHeader('Set-Cookie', [
      `userName=${userName}; HttpOnly; Path=/; SameSite=Strict`,
    ]);
    res.writeHead(200);
    res.end();
  }
}

module.exports = {
  onRequest,
};
