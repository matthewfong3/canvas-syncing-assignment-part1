const http = require('http');
const fs = require('fs');
const socketio = require('socket.io');

const port = process.env.PORT || process.env.NODE_PORT || 3000;

let serverValue = 0;

// read the client html file into memory
// __dirname in node is the current directory
// (in this case the same folder as the server.js file)
const index = fs.readFileSync(`${__dirname}/../client/index.html`);

const onRequest = (req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.write(index);
  res.end();
};

const app = http.createServer(onRequest);

app.listen(port);

console.log(`listening on 127.0.0.1: ${port}`);

// pass in the http server into socketio and grab the websocket server as io
const io = socketio(app);

const update = (sock) => {
  const socket = sock;

  socket.on('incrementOnServer', (data) => {
    serverValue += data;

    io.sockets.in('room1').emit('updateOnClient', serverValue);
  });
};

// fires when server receives an onDisconnect request from a user/client
const onDisconnect = (sock) => {
  const socket = sock;

  socket.on('disconnect', () => {
    socket.leave('room1');
  });
};

io.sockets.on('connection', (socket) => {
  console.log('started');

  socket.join('room1');

  update(socket);
  onDisconnect(socket);
});

console.log('Websocket server started');
