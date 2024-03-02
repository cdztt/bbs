// const https = require('node:https');
const http = require('node:http');
// const { env } = require('node:process');
const { WebSocketServer } = require('ws');
const { onRequest } = require('./route.js');
// const { getTls } = require('./utils.js');
const { userNames } = require('./store.js');

/* https server */
// const server = https.createServer(getTls(env.NODE_ENV), onRequest);
/* http server */
const server = http.createServer(onRequest);

/* websocket server */
const wss = new WebSocketServer({
  server,
  path: '/chat',
  clientTracking: true,
});

/* after a websocket connected */
wss.on('connection', (ws, req) => {
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

// const PORT= 443
const PORT = 80;
server.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
