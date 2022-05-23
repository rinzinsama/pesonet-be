"use strict";

class Module {
  constructor(io) {
    this.io = io;
    this.prefix = "Module";
  }

  async save(data) {
    this.io.emit("socket", {
      method: `${this.prefix}Save`,
      data,
    });
  }
}

module.exports = Module;
