let io;

function setRealtimeServer(server) {
  io = server;
}

function emitRealtime(eventName, payload) {
  if (io) {
    io.emit(eventName, payload);
  }
}

export { setRealtimeServer, emitRealtime };
