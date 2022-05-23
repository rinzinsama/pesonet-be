"use strict";

class StatusList {
  constructor(io) {
    this.io = io;
    this.prefix = "StatusList";
  }

  async save(data) {
    this.io.emit("socket", {
      method: `${this.prefix}Save`,
      data,
    });
  }
}

module.exports = StatusList;
