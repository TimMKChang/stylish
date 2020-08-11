const socketCon = (io) => {
  io.on('connection', (socket) => {
    socket.on('dashboard', function () {
      // room
      socket.join('room-dashboard');
    })

    socket.on('new-order', function (newOrderStr) {
      io.sockets.in('room-dashboard').emit('new-order', newOrderStr)
    })
  });
}

module.exports = {
  socketCon
}