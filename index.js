const https = require('node:https');
const path = require('node:path');
const { readFileSync } = require('node:fs');
const { env } = require('node:process');
const { WebSocketServer } = require('ws');

function getTls(mode) {
  let tls;
  if (mode === 'dev') {
    tls = {
      key: readFileSync(
        path.join(__dirname, './env/localhost/localhost-key.pem')
      ),
      cert: readFileSync(path.join(__dirname, './env/localhost/localhost.pem')),
    };
  } else if (mode === 'prod') {
    tls = {
      pfx: readFileSync(
        path.join(__dirname, './env/hueyond.run_iis/hueyond.run.pfx')
      ),
      passphrase: readFileSync(
        path.join(__dirname, './env/hueyond.run_iis/keystorePass.txt'),
        'utf8'
      ),
    };
  }

  return tls;
}

function onRequest(req, res) {
  const { url } = req;

  if (url === '/') {
    let html = readFileSync(path.join(__dirname, url + 'index.html'));
    // 把服务端变量传给客户端
    html = html.toString().replace('TO_BE_DECIDED', env.NODE_ENV);

    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(html);
  } else if (url.endsWith('.js')) {
    const js = readFileSync(path.join(__dirname, url));

    res.writeHead(200, { 'Content-Type': 'application/javascript' });
    res.end(js);
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

/* 访客名的堆栈 */
const MAX_NUMBER = 100;
const userNames = Array(MAX_NUMBER)
  .fill()
  .map((v, k) => `visitor_${MAX_NUMBER - k}`);

/* after websocket connected */
wss.on('connection', (ws) => {
  // pop from the stack
  const userName = userNames.pop();

  // when the visitor pool is empty
  if (userName === undefined) {
    ws.close();
    return;
  }

  const initMsg = { userName, init: true };
  // 初始化访客的名字，把名字发给客户端
  ws.send(JSON.stringify(initMsg));

  // listening for the message from clients
  ws.on('message', (msg) => {
    const { text, createdAt } = JSON.parse(msg.toString());
    const msgWithUserName = { userName, text, createdAt };
    // 发送给所有人，群聊
    [...wss.clients].forEach((ws) => ws.send(JSON.stringify(msgWithUserName)));
  });

  // listening for the closing event from the clients
  ws.on('close', () => {
    // push back to stack for reusing
    userNames.push(userName);
  });
});

server.listen(env.NODE_ENV === 'dev' ? 2222 : 443);
