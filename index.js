const http = require('node:http');
const https = require('node:https');
const { env } = require('node:process');
const { WebSocketServer } = require('ws');
const { onRequest } = require('./route.js');
const { getTls } = require('./utils.js');
const { userNames } = require('./store.js');

let server;
let PORT;

if (env.NODE_PROTOCOL === 'http') {
  server = http.createServer(onRequest);
  PORT = 80;
} else {
  server = https.createServer(getTls(env.NODE_ENV), onRequest);
  PORT = 443;
}

const wss = new WebSocketServer({
  server,
  path: '/chat',
  clientTracking: true,
});

wss.on('connection', (ws) => {
  ws.on('message', (msg) => {
    const { type, ...content } = JSON.parse(msg.toString());

    if (type === 'dialog') {
      [...wss.clients].forEach((ws) => ws.send(JSON.stringify(content)));
    } else if (type === 'state') {
      const onlineUsers = userNames.getOnlineUsersUsingNickName();
      const state = {
        onlineUsers,
      };
      [...wss.clients].forEach((ws) => ws.send(JSON.stringify(state)));
    }
  });
});

server.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
