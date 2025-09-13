const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static('public')); // acá va tu index.html dentro de /public

const players = {};

io.on('connection', (socket) => {
  console.log(`Jugador conectado: ${socket.id}`);

  // Crear jugador nuevo
  players[socket.id] = {
    id: socket.id,
    x: 100,
    y: 100,
    size: 20,
    color: `hsl(${Math.random() * 360}, 70%, 50%)`,
    score: 0
  };

  // Mandar lista de jugadores al nuevo
  socket.emit('currentPlayers', players);

  // Avisar a los demás
  socket.broadcast.emit('newPlayer', players[socket.id]);

  // Recibir movimientos
  socket.on('playerMovement', (movementData) => {
    const player = players[socket.id];
    if (player) {
      player.x = movementData.x;
      player.y = movementData.y;
      io.emit('playerMoved', { id: socket.id, x: player.x, y: player.y });
    }
  });

  // Desconexión
  socket.on('disconnect', () => {
    console.log(`Jugador desconectado: ${socket.id}`);
    delete players[socket.id];
    io.emit('playerDisconnected', socket.id);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});
