"use strict";

class Outward {
  constructor(io) {
    this.io = io;
    this.prefix = "Outward";
  }

  async save(data) {
    this.io.emit("socket", {
      method: `${this.prefix}Save`,
      data,
    });
  }
}

module.exports = Outward;
