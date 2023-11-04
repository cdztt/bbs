const https = require('node:https');
const { env } = require('node:process');
const { WebSocketServer } = require('ws');
const { onRequest } = require('./route.js');
const { getTls, parseCookie } = require('./utils.js');
const { deregister } = require('./store.js');

/* https server */
const server = https.createServer(getTls(env.NODE_ENV), onRequest);

/* websocket server */
const wss = new WebSocketServer({
  server,
  path: '/chat',
  clientTracking: true,
});

/* after a websocket connected */
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
