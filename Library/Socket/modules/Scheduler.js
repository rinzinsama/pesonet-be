"use strict";

class Scheduler {
  constructor(io) {
    this.io = io;
    this.prefix = "Scheduler";
  }

  async save(data) {
    this.io.emit("socket", {
      method: `${this.prefix}Save`,
      data,
    });
  }

  async triggerSync(data) {
    this.io.emit("socket", {
      method: `${this.prefix}TriggerSync`,
      data,
    });
  }
}

module.exports = Scheduler;
