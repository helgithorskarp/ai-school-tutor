// services/ws.js

let socket = null;

export function connectWS(handlerFunction) {
  socket = new WebSocket("ws://localhost:3000");

  socket.onopen = () => {
    console.log("WS connected");
  };

  socket.onmessage = (e) => {
    const DataObj = JSON.parse(e.data); 

    handlerFunction(DataObj.data,  DataObj.type)
  };

  socket.onclose = () => {
    console.log("WS closed");
  };

  socket.onerror = (err) => {
    console.log("WS error", err);
  };

  return socket;
}

export function sendWS(message) {
  if (socket && socket.readyState === WebSocket.OPEN) {
    socket.send(message);
  }
}
