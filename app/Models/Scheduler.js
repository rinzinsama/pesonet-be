"use strict";

const Model = use("Model");

class Scheduler extends Model {
  static get table() {
    return "scheduler";
  }

  static boot() {
    super.boot();

    this.addHook("beforeCreate", "ReferenceIdHook.generateReferenceID");
    this.addHook("afterSave", async (modelInstance) => {
      const Socket = use("Socket");

      Socket.broadcastData("Scheduler", "save", {
        message: "New Entry",
        type: modelInstance.type,
      });
    });
  }

  static get hidden() {
    return ["id"];
  }

  static castDates(field, value) {
    return value.format("MMMM D, YYYY - h:mm:ss A");
  }
}

module.exports = Scheduler;
