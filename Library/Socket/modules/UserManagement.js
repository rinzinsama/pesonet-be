"use strict";

class UserManagement {
  constructor(io) {
    this.io = io;
    this.prefix = "UserManagement";
  }

  async save(data) {
    this.io.emit("socket", {
      method: `${this.prefix}Save`,
      data,
    });
  }
}

module.exports = UserManagement;
