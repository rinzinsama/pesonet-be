"use strict";

class BankList {
  constructor(io) {
    this.io = io;
    this.prefix = "BankList";
  }

  async save(data) {
    this.io.emit("socket", {
      method: `${this.prefix}Save`,
      data,
    });
  }

  async update(data) {
    this.io.emit("socket", {
      method: `${this.prefix}Update`,
      data,
    });
  }
}

module.exports = BankList;
