"use strict";

class TransactionList {
  constructor(io) {
    this.io = io;
    this.prefix = "TransactionList";
  }

  async save(data) {
    this.io.emit("socket", {
      method: `${this.prefix}Save`,
      data,
    });
  }
}

module.exports = TransactionList;
