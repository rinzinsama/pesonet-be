"use strict";

class PesonetTransaction {
  constructor(io) {
    this.io = io;
    this.prefix = "PesonetTransaction";
  }

  async save(data) {
    this.io.emit("socket", {
      method: `${this.prefix}Save`,
      data,
    });
  }
}

module.exports = PesonetTransaction;
