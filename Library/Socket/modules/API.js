"use strict";

class API {
  constructor(io) {
    this.io = io;
    this.prefix = "API";
  }

  async update(data) {
    this.io.emit("socket", {
      method: `${this.prefix}Update`,
      data,
    });
  }

  async save(data) {
    this.io.emit("socket", {
      method: `${this.prefix}Save`,
      data,
    });
  }
}

module.exports = API;
