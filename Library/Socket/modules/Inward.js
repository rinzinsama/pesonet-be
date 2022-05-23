"use strict";

class Inward {
  constructor(io) {
    this.io = io;
    this.prefix = "Inward";
  }

  async save(data) {
    this.io.emit("socket", {
      method: `${this.prefix}Save`,
      data,
    });
  }

  async transactionSave(data) {
    this.io.emit("socket", {
      method: `${this.prefix}TransactionSave`,
      data,
    });
  }
}

module.exports = Inward;
