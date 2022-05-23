"use strict";
const Server = use("Server");
const Env = use("Env");
const socketIO = use("socket.io");
const { green } = require("kleur");
const path = Env.get("SOCKET_PATH", "/ws");
const Logger = use("Logger");
const moment = use("moment");

const io = socketIO(Server.getInstance(), {
  path,
});

io.on("connection", (socket) => {
  Logger.transport("socket").info({
    timestamp: moment().format("MMMM D, YYYY - h:mm:ss A"),
    id: socket.id,
    action: "Connected",
  });

  socket.on("socket", (received) => {
    const { method, data } = received;

    Logger.transport("socket").info({
      timestamp: moment().format("MMMM D, YYYY - h:mm:ss A"),
      id: socket.id,
      action: "Listen on (socket)",
      data: received,
    });

    io.emit(method, data);

    Logger.transport("socket").info({
      timestamp: moment().format("MMMM D, YYYY - h:mm:ss A"),
      id: socket.id,
      action: "Emit",
      data: received,
    });
  });

  socket.once("disconnect", function () {
    Logger.transport("socket").info({
      timestamp: moment().format("MMMM D, YYYY - h:mm:ss A"),
      id: socket.id,
      action: "Disconnected",
    });
  });
});

console.log(
  `${green("info")}: socket is running on ${Env.get("APP_URL")}${path}`
);
