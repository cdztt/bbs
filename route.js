const { env } = require('node:process');
const path = require('node:path');
const { readFileSync } = require('node:fs');
const { parseCookie } = require('./utils.js');
const { register } = require('./store.js');

/* 渲染html */
function render(url, res, payload) {
  let html = readFileSync(path.join(__dirname, url + '.html')).toString();

  if (env.NODE_ENV === 'prod') {
    html = html.replace('vue.esm-browser.js', 'vue.esm-browser.prod.js');
  }

  // 把服务端变量传给客户端
  if (payload) {
    const injectedScript = `
      <script>
        window.env='${payload['window.env']}'
        window.nickName='${payload['window.nickName']}'
        window.userName='${payload['window.userName']}'
      </script>
    `;
    html = html.replace('</body>', `${injectedScript}</body>`);
  }

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.writeHead(200, {
    'Content-Type': 'text/html; charset=utf-8',
  });
  res.end(html);
}

/* 路由 */
function onRequest(req, res) {
  let {
    url,
    headers: { cookie, host },
  } = req;
  const fakeCookieForInit = { nickName: 'visitor', userName: '' };
  cookie = cookie !== undefined ? parseCookie(cookie) : fakeCookieForInit;

  if (['localhost', 'hueyond.run'].includes(host) && /.js$/.test(url)) {
    // 浏览器自动请求js文件的时候
    const js = readFileSync(path.join(__dirname, url));
    res.writeHead(200, { 'Content-Type': 'text/javascript; charset=utf-8' });
    res.end(js);
  } else if (['/login'].includes(url)) {
    if (cookie.userName === '') {
      render(url, res);
    } else {
      // 登录之后绝不能再进入login页面，手动在地址栏写入网址也不行
      res.writeHead(307, { Location: '/' });
      res.end();
    }
  } else if (['/'].includes(url)) {
    const payload = {
      ['window.env']: env.NODE_ENV,
      ['window.nickName']: cookie.nickName,
      ['window.userName']: cookie.userName,
    };
    render('/home', res, payload);
  } else if (['/api/login'].includes(url)) {
    // 登录页的"确定"按钮调用此
    let nickName = '';

    req.on('data', (chunk) => {
      nickName += chunk.toString();
    });

    req.on('end', () => {
      const userName = register();

      if (userName === '') {
        nickName = 'visitor';
      } else if (nickName === '') {
        nickName = userName;
      }

      res.setHeader('Set-Cookie', [
        `nickName=${nickName}; HttpOnly; Path=/; SameSite=Strict`,
        `userName=${userName}; HttpOnly; Path=/; SameSite=Strict`,
      ]);
      res.writeHead(200, {
        'Content-Type': 'text/plain; charset=utf-8',
      });
      res.end(
        userName !== ''
          ? `登录成功, 你的名字: ${nickName}${
              nickName === userName ? ' (自动生成) ' : ''
            }`
          : '失败 (人数已满)'
      );
    });
  } else if (['/api/logout'].includes(url)) {
    // 主页的"退出"按钮调用此
    res.setHeader('Set-Cookie', [
      `nickName=${fakeCookieForInit.nickName}; HttpOnly; Path=/; SameSite=Strict`,
      `userName=${fakeCookieForInit.userName}; HttpOnly; Path=/; SameSite=Strict`,
    ]);
    res.writeHead(200);
    res.end();
  }
}

module.exports = {
  onRequest,
};
