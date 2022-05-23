"use strict";
const Env = use("Env");
const socketIOClient = use("socket.io-client");

class Singleton {
  constructor() {
    this.io = socketIOClient(Env.get("APP_URL"), {
      path: Env.get("SOCKET_PATH"),
    });
  }

  broadcastData(service, method, data) {
    const Service = use(`Library/Socket/modules/${service}`);
    const emitter = new Service(this.io);
    emitter[method](data);
  }
}

module.exports = Singleton;
