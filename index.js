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
wss.on('connection', (ws) => {
  ws.on('message', (msg) => {
    [...wss.clients].forEach((ws) => ws.send(msg.toString()));
  });

  ws.on('close', (code, reason) => {
    if (code === 1000 && reason.toString() === 'logout') {
      deregister(userName);
    }
  });
});

server.listen(443);
