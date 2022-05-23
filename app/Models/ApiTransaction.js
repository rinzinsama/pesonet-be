"use strict";

const Model = use("Model");

class ApiTransaction extends Model {
  static boot() {
    super.boot();

    this.addHook("beforeCreate", "ReferenceIdHook.generateReferenceID");
    this.addHook("afterSave", (modelInstance) => {
      const Socket = use("Socket");
      Socket.broadcastData("API", "save", "New Data");
    });
  }

  static get hidden() {
    return ["id"];
  }

  static castDates(field, value) {
    return value.format("MMMM D, YYYY - h:mm:ss A");
  }
}

module.exports = ApiTransaction;
