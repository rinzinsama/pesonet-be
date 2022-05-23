"use strict";

class FileReader {
  constructor(io) {
    this.io = io;
    this.prefix = "AuditTrail";
  }

  async save(data) {
    this.io.emit("socket", {
      method: `${this.prefix}Save`,
      data,
    });
  }
}

module.exports = FileReader;
