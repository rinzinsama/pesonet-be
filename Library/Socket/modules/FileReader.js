"use strict";

class FileReader {
  constructor(io) {
    this.io = io;
    this.prefix = "FileReader";
  }

  async transactions(data) {
    this.io.emit("socket", {
      method: `${this.prefix}Transactions`,
      data,
    });
  }

  async status(data) {
    this.io.emit("socket", {
      method: `${this.prefix}Status`,
      data,
    });
  }
}

module.exports = FileReader;
