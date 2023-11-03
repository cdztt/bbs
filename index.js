const https = require('node:https');
const path = require('node:path');
const { readFileSync } = require('node:fs');
const { env } = require('node:process');
const { WebSocketServer } = require('ws');
const { getTls, getUuid, parseCookie } = require('./utils.js');

/* 访客名的堆栈 */
const MAX_NUMBER = 2;
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

/* 渲染html */
function render(url, res, payload) {
  let html = readFileSync(path.join(__dirname, url + '.html'));
  // 把服务端变量传给客户端
  if (payload) {
    const injectedScript = `
      <script>
        window.env='${payload['window.env']}'
        window.nickName='${payload['window.nickName']}'
        window.userName='${payload['window.userName']}'
      </script>
    `;
    html = html.toString().replace('</body>', `${injectedScript}</body>`);
  }

  res.writeHead(200, {
    'Content-Type': 'text/html; charset=utf-8',
  });
  res.end(html);
}

/* 路由 */
function onRequest(req, res) {
  let {
    url,
    headers: { cookie },
  } = req;
  const fakeCookieForInitialLoading = { nickName: 'visitor', userName: '' };
  cookie =
    cookie !== undefined ? parseCookie(cookie) : fakeCookieForInitialLoading;

  if (/.js$/.test(url)) {
    // 浏览器自动请求js文件
    const js = readFileSync(path.join(__dirname, url));
    res.writeHead(200, { 'Content-Type': 'text/javascript; charset=utf-8' });
    res.end(js);
  } else if (['/login'].includes(url)) {
    render(url, res);
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
      nickName =
        nickName !== '' ? nickName : userName !== '' ? userName : 'visitor';

      res.setHeader('Set-Cookie', [
        `nickName=${nickName}; HttpOnly; Path=/; SameSite=Strict; Secure`,
        `userName=${userName}; HttpOnly; Path=/; SameSite=Strict; Secure`,
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
      `nickName=${fakeCookieForInitialLoading.nickName}; HttpOnly; Path=/; SameSite=Strict; Secure`,
      `userName=${fakeCookieForInitialLoading.userName}; HttpOnly; Path=/; SameSite=Strict; Secure`,
    ]);
    res.writeHead(200);
    res.end();
  }
}

/* https server */
const server = https.createServer(getTls(env.NODE_ENV), onRequest);

/* websocket server */
const wss = new WebSocketServer({
  server,
  path: '/chat',
  clientTracking: true,
});

/* after websocket connected */
wss.on('connection', (ws, req) => {
  const userName = parseCookie(req.headers.cookie).userName;

  if (userName === '') {
    ws.close();
    return;
  }

  ws.on('message', (msg) => {
    // 发送给所有人，群聊
    [...wss.clients].forEach((ws) => ws.send(msg.toString()));
  });

  ws.on('close', () => {
    deregister(userName);
  });
});

server.listen(env.NODE_ENV === 'dev' ? 2222 : 443);
